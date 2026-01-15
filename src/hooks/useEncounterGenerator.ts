import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { parseEncounterCSV, generateRandomEncounter, CategoryData } from '@/utils/encounterCsvParser';
import { GeneratedEncounter } from '@/types/encounter';

const GITHUB_CSV_URL = 'https://raw.githubusercontent.com/markjbarber-tech/DnD-Story-Generator/main/Encounter_inputs.csv';
const LOCAL_STORAGE_KEY = 'encounter-inputs-csv';
const ENCOUNTER_CSV_FILENAME = 'Encounter_inputs.csv';

export const useEncounterGenerator = () => {
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [generatedEncounter, setGeneratedEncounter] = useState<GeneratedEncounter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'github' | 'cache' | 'local'>('local');
  const { toast } = useToast();

  const loadEncounterData = useCallback(async () => {
    setIsLoading(true);
    
    // Try fetching from GitHub first
    try {
      const response = await fetch(`${GITHUB_CSV_URL}?v=${Date.now()}`);
      if (response.ok) {
        const csvText = await response.text();
        const data = parseEncounterCSV(csvText);
        setCategoryData(data);
        setDataSource('github');
        // Cache in localStorage for offline use
        localStorage.setItem(LOCAL_STORAGE_KEY, csvText);
        console.log('Encounter data loaded from GitHub');
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.warn('Failed to fetch encounter data from GitHub:', error);
    }

    // Fallback to localStorage cache
    const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cachedData) {
      try {
        const data = parseEncounterCSV(cachedData);
        setCategoryData(data);
        setDataSource('cache');
        console.log('Encounter data loaded from cache');
        setIsLoading(false);
        return;
      } catch (error) {
        console.warn('Failed to parse cached encounter data:', error);
      }
    }

    // Final fallback to local public file
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const csvUrl = `${baseUrl}${ENCOUNTER_CSV_FILENAME}?v=${Date.now()}`;
      const response = await fetch(csvUrl);
      if (response.ok) {
        const csvText = await response.text();
        const data = parseEncounterCSV(csvText);
        setCategoryData(data);
        setDataSource('local');
        // Cache for future use
        localStorage.setItem(LOCAL_STORAGE_KEY, csvText);
        console.log('Encounter data loaded from local file');
      } else {
        throw new Error(`Failed to fetch encounter data: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading encounter data from any source:', error);
      toast({
        title: 'Error loading encounter data',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
    
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadEncounterData();
  }, [loadEncounterData]);

  const generateEncounter = useCallback(() => {
    if (!categoryData) {
      toast({
        title: 'Data not loaded',
        description: 'Please wait for encounter data to load.',
        variant: 'destructive',
      });
      return;
    }

    const encounter = generateRandomEncounter(categoryData);
    setGeneratedEncounter(encounter);
  }, [categoryData, toast]);

  const clearEncounter = useCallback(() => {
    setGeneratedEncounter(null);
  }, []);

  return {
    categoryData,
    generatedEncounter,
    isLoading,
    dataSource,
    generateEncounter,
    clearEncounter,
  };
};
