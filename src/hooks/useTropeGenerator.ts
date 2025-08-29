import { useState, useEffect, useCallback } from 'react';
import { Trope } from '@/types/trope';
import { fetchTropeData } from '@/utils/csvDataSource';
import { generateMixedTropes } from '@/utils/mixedTropeGenerator';
import { usePersonalData } from '@/hooks/usePersonalData';
import { useToast } from '@/hooks/use-toast';

export const useTropeGenerator = () => {
  const [allTropes, setAllTropes] = useState<Trope[]>([]);
  const [generatedTropes, setGeneratedTropes] = useState<Trope[]>([]);
  const [tropeCount, setTropeCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();
  const { personalTropes, hasPersonalData, uploadPersonalData, purgePersonalData } = usePersonalData();

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

    const generated = generateMixedTropes(allTropes, personalTropes, tropeCount);
    setGeneratedTropes(generated);
    
    const personalCount = generated.filter(trope => trope.source === 'personal').length;
    const defaultCount = generated.filter(trope => trope.source === 'default').length;
    
    toast({
      title: "Tropes generated!",
      description: hasPersonalData 
        ? `Generated ${generated.length} tropes (${personalCount} personal, ${defaultCount} default)`
        : `Generated ${generated.length} random tropes`,
    });

    // Add a second toast with scroll instruction after a brief delay
    setTimeout(() => {
      toast({
        title: "Scroll down for story element combination",
        description: "View your generated elements below to start crafting your story",
        duration: 5000, // Fade after 5 seconds
      });
    }, 1500);

    console.log('Generated tropes:', generated.map(t => t.name));
    console.log(`Counts: ${personalCount} personal, ${defaultCount} default`);
  }, [allTropes, personalTropes, tropeCount, hasPersonalData, toast]);

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
    const newTropeBase = availableTropes[randomIndex];
    const newTrope: Trope = {
      ...newTropeBase,
      source: personalTropes.some(p => p.id === newTropeBase.id) ? 'personal' : 'default',
    };
    
    setGeneratedTropes(prev => [...prev, newTrope]);
    
    toast({
      title: "Trope Added",
      description: `Added "${newTrope.name}" to your list`,
    });
  }, [allTropes, generatedTropes, toast]);

  const addCustomTrope = useCallback((name: string, detail: string) => {
    // Generate a unique ID for the custom trope
    const customId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const customTrope: Trope = {
      id: customId,
      name,
      detail,
      source: 'custom',
    };
    
    setGeneratedTropes(prev => [...prev, customTrope]);
    
    toast({
      title: "Custom Trope Added",
      description: `Added "${name}" to your list`,
    });
  }, [toast]);

  return {
    allTropes,
    generatedTropes,
    tropeCount,
    isLoading,
    isInitialLoad,
    personalTropes,
    hasPersonalData,
    setTropeCount,
    generateTropes,
    refreshData: loadTropeData,
    removeTrope,
    addRandomTrope,
    addCustomTrope,
    uploadPersonalData,
    purgePersonalData
  };
};