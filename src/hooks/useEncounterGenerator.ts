import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { parseEncounterCSV, generateRandomEncounter, CategoryData } from '@/utils/encounterCsvParser';
import { GeneratedEncounter } from '@/types/encounter';

const ENCOUNTER_CSV_URL = '/Encounter_inputs.csv';

export const useEncounterGenerator = () => {
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [generatedEncounter, setGeneratedEncounter] = useState<GeneratedEncounter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadEncounterData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Add cache-busting parameter to ensure fresh fetch
      const response = await fetch(`${ENCOUNTER_CSV_URL}?v=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch encounter data: ${response.status}`);
      }
      const csvText = await response.text();
      const data = parseEncounterCSV(csvText);
      setCategoryData(data);
      console.log('Encounter data loaded successfully');
    } catch (error) {
      console.error('Error loading encounter data:', error);
      toast({
        title: 'Error loading encounter data',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
    generateEncounter,
    clearEncounter,
  };
};
