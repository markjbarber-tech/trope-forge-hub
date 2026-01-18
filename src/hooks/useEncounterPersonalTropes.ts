import { useState, useEffect, useCallback } from 'react';
import { Trope } from '@/types/trope';
import { parseTropeCSV } from '@/utils/csvDataSource';
import { toast } from 'sonner';

const PERSONAL_TROPES_CSV_URL = 'https://raw.githubusercontent.com/markjbarber-tech/DnD-Story-Generator/main/Personal-data-template.csv';
const CACHE_KEY = 'encounter-personal-tropes-cache';

export const useEncounterPersonalTropes = () => {
  const [allPersonalTropes, setAllPersonalTropes] = useState<Trope[]>([]);
  const [selectedTropes, setSelectedTropes] = useState<Trope[]>([]);
  const [tropeCount, setTropeCount] = useState(3);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPersonalTropes = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Try fetching from GitHub
      console.log('Fetching personal tropes from:', PERSONAL_TROPES_CSV_URL);
      const response = await fetch(PERSONAL_TROPES_CSV_URL, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'text/csv,text/plain,*/*',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const csvText = await response.text();
      
      if (csvText.length < 50) {
        throw new Error('CSV data too short');
      }

      const tropes = parseTropeCSV(csvText);
      console.log(`Successfully parsed ${tropes.length} personal tropes`);
      
      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify(tropes));
      
      setAllPersonalTropes(tropes);
      toast.success(`Loaded ${tropes.length} personal tropes`);
    } catch (error) {
      console.warn('Failed to fetch personal tropes from GitHub:', error);
      
      // Try loading from cache
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const tropes = JSON.parse(cached) as Trope[];
          setAllPersonalTropes(tropes);
          toast.info('Using cached personal tropes');
        } else {
          toast.error('Could not load personal tropes');
        }
      } catch {
        toast.error('Could not load personal tropes');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPersonalTropes();
  }, [fetchPersonalTropes]);

  // Generate random selection of tropes based on count
  const generateRandomTropes = useCallback((count: number) => {
    if (allPersonalTropes.length === 0 || count === 0) {
      setSelectedTropes([]);
      return;
    }

    // Fisher-Yates shuffle
    const shuffled = [...allPersonalTropes];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setSelectedTropes(shuffled.slice(0, Math.min(count, shuffled.length)));
  }, [allPersonalTropes]);

  // Update count and regenerate
  const handleCountChange = useCallback((newCount: number) => {
    setTropeCount(newCount);
    generateRandomTropes(newCount);
  }, [generateRandomTropes]);

  // Regenerate with current count
  const regenerateTropes = useCallback(() => {
    generateRandomTropes(tropeCount);
  }, [generateRandomTropes, tropeCount]);

  // Add a specific trope (from search)
  const addTrope = useCallback((trope: Trope) => {
    setSelectedTropes(prev => {
      // Don't add duplicates
      if (prev.some(t => t.id === trope.id)) {
        toast.info('This trope is already selected');
        return prev;
      }
      return [...prev, trope];
    });
  }, []);

  // Remove a specific trope
  const removeTrope = useCallback((tropeId: string) => {
    setSelectedTropes(prev => prev.filter(t => t.id !== tropeId));
  }, []);

  // Clear all selected tropes
  const clearTropes = useCallback(() => {
    setSelectedTropes([]);
  }, []);

  // Replace a specific trope with a random one
  const randomizeTrope = useCallback((tropeId: string) => {
    setSelectedTropes(prev => {
      const currentIds = new Set(prev.map(t => t.id));
      const available = allPersonalTropes.filter(t => !currentIds.has(t.id));
      
      if (available.length === 0) {
        toast.info('No more tropes available');
        return prev;
      }

      const randomTrope = available[Math.floor(Math.random() * available.length)];
      return prev.map(t => t.id === tropeId ? randomTrope : t);
    });
  }, [allPersonalTropes]);

  return {
    allPersonalTropes,
    selectedTropes,
    tropeCount,
    isLoading,
    hasPersonalTropes: allPersonalTropes.length > 0,
    setTropeCount: handleCountChange,
    regenerateTropes,
    addTrope,
    removeTrope,
    clearTropes,
    randomizeTrope,
    refreshData: fetchPersonalTropes,
  };
};
