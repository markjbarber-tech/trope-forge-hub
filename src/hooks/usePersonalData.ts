import { useState, useCallback } from 'react';
import { Trope } from '@/types/trope';
import { parseTropeCSV } from '@/utils/csvDataSource';
import { useToast } from '@/hooks/use-toast';

const PERSONAL_DATA_KEY = 'dnd-personal-tropes-data';

export const usePersonalData = () => {
  const [personalTropes, setPersonalTropes] = useState<Trope[]>(() => {
    try {
      const stored = localStorage.getItem(PERSONAL_DATA_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const { toast } = useToast();

  const uploadPersonalData = useCallback((csvContent: string) => {
    try {
      const tropes = parseTropeCSV(csvContent);
      setPersonalTropes(tropes);
      localStorage.setItem(PERSONAL_DATA_KEY, JSON.stringify(tropes));
      
      toast({
        title: "Personal data uploaded",
        description: `Successfully loaded ${tropes.length} personal tropes`,
      });
    } catch (error) {
      console.error('Error parsing personal CSV:', error);
      toast({
        title: "Error parsing personal file",
        description: "Could not parse the CSV file. Please check the format.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const purgePersonalData = useCallback(() => {
    setPersonalTropes([]);
    localStorage.removeItem(PERSONAL_DATA_KEY);
    
    toast({
      title: "Personal data cleared",
      description: "Your personal tropes have been removed",
    });
  }, [toast]);

  const hasPersonalData = personalTropes.length > 0;

  return {
    personalTropes,
    hasPersonalData,
    uploadPersonalData,
    purgePersonalData
  };
};