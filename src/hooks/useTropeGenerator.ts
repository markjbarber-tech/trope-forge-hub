import { useState, useEffect, useCallback } from 'react';
import { Trope } from '@/types/trope';
import { fetchTropeData, generateRandomTropes } from '@/utils/csvDataSource';
import { useToast } from '@/hooks/use-toast';

export const useTropeGenerator = () => {
  const [allTropes, setAllTropes] = useState<Trope[]>([]);
  const [generatedTropes, setGeneratedTropes] = useState<Trope[]>([]);
  const [tropeCount, setTropeCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();

  const loadTropeData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Starting trope data load...');
      const tropes = await fetchTropeData();
      setAllTropes(tropes);
      
      toast({
        title: "Trope Data Loaded",
        description: `Successfully loaded ${tropes.length} tropes from CSV`,
      });
      
      console.log(`Loaded ${tropes.length} tropes from CSV`);
    } catch (error) {
      console.error('Failed to load CSV, using fallback data:', error);
      
      // Import and use fallback data directly
      const { getFallbackData } = await import('@/utils/csvDataSource');
      const fallbackTropes = getFallbackData();
      setAllTropes(fallbackTropes);
      
      toast({
        title: "Using Demo Data",
        description: `Network error. Loaded ${fallbackTropes.length} demo tropes instead.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [toast]);

  // Load trope data on app start - this is the key fix
  useEffect(() => {
    console.log('Component mounted, loading trope data...');
    loadTropeData();
  }, [loadTropeData]);

  const generateTropes = useCallback(() => {
    if (allTropes.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please wait for trope data to load first",
        variant: "destructive",
      });
      return;
    }

    const newTropes = generateRandomTropes(allTropes, tropeCount);
    setGeneratedTropes(newTropes);
    
    toast({
      title: "Tropes Generated",
      description: `Generated ${newTropes.length} random tropes`,
    });

    console.log('Generated tropes:', newTropes.map(t => t.name));
  }, [allTropes, tropeCount, toast]);

  // Handle URL actions (for PWA shortcuts)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'generate' && allTropes.length > 0) {
      generateTropes();
      // Clean up URL
      window.history.replaceState({}, '', '/');
    }
  }, [allTropes, generateTropes]);

  const removeTrope = useCallback((tropeId: string) => {
    setGeneratedTropes(prev => prev.filter(trope => trope.id !== tropeId));
    
    toast({
      title: "Trope Removed",
      description: "Successfully removed trope from the list",
    });
  }, [toast]);

  const addRandomTrope = useCallback(() => {
    if (allTropes.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please wait for trope data to load first",
        variant: "destructive",
      });
      return;
    }

    // Filter out tropes already in the generated list
    const usedTropeIds = new Set(generatedTropes.map(t => t.id));
    const availableTropes = allTropes.filter(t => !usedTropeIds.has(t.id));
    
    if (availableTropes.length === 0) {
      toast({
        title: "No More Tropes",
        description: "All available tropes are already in your list",
        variant: "destructive",
      });
      return;
    }

    // Get a random trope from available ones
    const randomIndex = Math.floor(Math.random() * availableTropes.length);
    const newTrope = availableTropes[randomIndex];
    
    setGeneratedTropes(prev => [...prev, newTrope]);
    
    toast({
      title: "Trope Added",
      description: `Added "${newTrope.name}" to your list`,
    });
  }, [allTropes, generatedTropes, toast]);

  return {
    allTropes,
    generatedTropes,
    tropeCount,
    isLoading,
    isInitialLoad,
    setTropeCount,
    generateTropes,
    refreshData: loadTropeData,
    removeTrope,
    addRandomTrope,
  };
};