import { useState, useEffect, useCallback } from 'react';
import { Trope } from '@/types/trope';
import { parseTropeCSV } from '@/utils/csvDataSource';
import { toast } from 'sonner';

const PERSONAL_TROPES_CSV_URL = 'https://raw.githubusercontent.com/markjbarber-tech/DnD-Story-Generator/main/Personal%20data.csv';
const LOCAL_FALLBACK_FILENAME = 'Personal-data.csv';
const CACHE_KEY = 'encounter-personal-tropes-cache';

export const useEncounterPersonalTropes = () => {
  const [allPersonalTropes, setAllPersonalTropes] = useState<Trope[]>([]);
  const [selectedTropes, setSelectedTropes] = useState<Trope[]>([]);
  const [tropeCount, setTropeCount] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load from cache immediately
  const loadFromCache = useCallback((): Trope[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const tropes = JSON.parse(cached) as Trope[];
        if (tropes.length > 0) {
          console.log(`Loaded ${tropes.length} personal tropes from cache`);
          return tropes;
        }
      }
    } catch {
      console.warn('Cache read failed');
    }
    return null;
  }, []);

  // Fetch fresh data from remote
  const fetchRemoteData = useCallback(async (): Promise<Trope[] | null> => {
    console.log('Fetching personal tropes from:', PERSONAL_TROPES_CSV_URL);
    
    const fetchMethods = [
      // Method 1: Direct fetch
      async () => {
        const response = await fetch(PERSONAL_TROPES_CSV_URL, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'text/csv,text/plain,*/*',
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
      },
      
      // Method 2: AllOrigins proxy
      async () => {
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(PERSONAL_TROPES_CSV_URL)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return data.contents;
      },
      
      // Method 3: CORS Anywhere proxy
      async () => {
        const response = await fetch(`https://cors-anywhere.herokuapp.com/${PERSONAL_TROPES_CSV_URL}`, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
      },
    ];

    for (let i = 0; i < fetchMethods.length; i++) {
      try {
        console.log(`Trying fetch method ${i + 1} for personal tropes...`);
        const csvText = await fetchMethods[i]();
        
        if (csvText.length < 50) {
          throw new Error('CSV data too short');
        }

        const tropes = parseTropeCSV(csvText);
        console.log(`Successfully parsed ${tropes.length} personal tropes via method ${i + 1}`);
        return tropes;
        
      } catch (error) {
        console.warn(`Fetch method ${i + 1} failed:`, error);
        continue;
      }
    }
    return null;
  }, []);

  // Load from local fallback file
  const loadFromLocalFallback = useCallback(async (): Promise<Trope[] | null> => {
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const fallbackPath = `${baseUrl}${LOCAL_FALLBACK_FILENAME}`.replace(/\/\//g, '/');
      console.log('Trying local fallback path:', fallbackPath);
      
      const response = await fetch(fallbackPath);
      if (response.ok) {
        const csvText = await response.text();
        if (csvText.length > 50) {
          const tropes = parseTropeCSV(csvText);
          console.log(`Loaded ${tropes.length} personal tropes from local fallback`);
          return tropes;
        }
      }
    } catch (error) {
      console.warn('Local fallback failed:', error);
    }
    return null;
  }, []);

  // Background refresh - fetch latest and update if different
  const backgroundRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    const remoteTropes = await fetchRemoteData();
    
    if (remoteTropes && remoteTropes.length > 0) {
      // Cache the fresh data
      localStorage.setItem(CACHE_KEY, JSON.stringify(remoteTropes));
      
      // Update state with new data
      setAllPersonalTropes(prev => {
        if (prev.length !== remoteTropes.length) {
          toast.success(`Updated to ${remoteTropes.length} personal tropes`);
          return remoteTropes;
        }
        return remoteTropes;
      });
    }
    
    setIsRefreshing(false);
  }, [fetchRemoteData]);

  // Initial load: cache first, then background refresh
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      // Step 1: Try cache first for instant load
      const cachedTropes = loadFromCache();
      if (cachedTropes) {
        setAllPersonalTropes(cachedTropes);
        setIsLoading(false);
        
        // Step 2: Background refresh for latest data
        backgroundRefresh();
        return;
      }
      
      // Step 3: No cache - try remote
      const remoteTropes = await fetchRemoteData();
      if (remoteTropes && remoteTropes.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(remoteTropes));
        setAllPersonalTropes(remoteTropes);
        toast.success(`Loaded ${remoteTropes.length} personal tropes`);
        setIsLoading(false);
        return;
      }
      
      // Step 4: No remote - try local fallback
      const localTropes = await loadFromLocalFallback();
      if (localTropes && localTropes.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(localTropes));
        setAllPersonalTropes(localTropes);
        toast.info('Using local personal tropes data');
        setIsLoading(false);
        return;
      }
      
      toast.error('Could not load personal tropes');
      setIsLoading(false);
    };
    
    initializeData();
  }, [loadFromCache, fetchRemoteData, loadFromLocalFallback, backgroundRefresh]);

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
    refreshData: backgroundRefresh,
    isRefreshing,
  };
};
