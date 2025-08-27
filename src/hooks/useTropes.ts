import { useState, useEffect } from 'react';
import { Trope } from '@/types/trope';
import { parseCSV, generateRandomTropes } from '@/utils/csvParser';
import { useToast } from '@/hooks/use-toast';

const POTENTIAL_CSV_URLS = [
  'https://markjbarber-tech.github.io/DnD-Story-Generator/data.csv',
  'https://raw.githubusercontent.com/markjbarber-tech/DnD-Story-Generator/main/data.csv',
  'https://raw.githubusercontent.com/markjbarber-tech/DnD-Story-Generator/master/data.csv',
  'https://raw.githubusercontent.com/markjbarber-tech/DnD-Story-Generator/gh-pages/data.csv'
];
const STORAGE_KEY = 'dnd-tropes-data';

export const useTropes = () => {
  const [allTropes, setAllTropes] = useState<Trope[]>([]);
  const [generatedTropes, setGeneratedTropes] = useState<Trope[]>([]);
  const [tropeCount, setTropeCount] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load tropes from localStorage or fetch default
  useEffect(() => {
    loadTropes();
  }, []);

  const loadTropes = async () => {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const tropes = JSON.parse(stored);
        if (tropes.length > 0) {
          setAllTropes(tropes);
          setIsLoading(false);
          return;
        }
      }

      // Try to fetch default CSV from multiple potential URLs
      await fetchDefaultData();
    } catch (error) {
      console.error('Error loading tropes:', error);
      toast({
        title: "No CSV data found",
        description: "Please upload a CSV file with the format: \"#\", \"Trope name\", \"Trope detail\"",
        variant: "destructive"
      });
      setAllTropes([]);
      setIsLoading(false);
    }
  };

  const fetchDefaultData = async () => {
    setIsLoading(true);
    
    let lastError: Error | null = null;
    
    // Try each potential URL
    for (const url of POTENTIAL_CSV_URLS) {
      try {
        console.log(`Trying to fetch CSV from: ${url}`);
        const response = await fetch(url);
        
        if (response.ok) {
          const csvText = await response.text();
          const tropes = parseCSV(csvText);
          
          if (tropes.length > 0) {
            setAllTropes(tropes);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tropes));
            
            toast({
              title: "Data loaded successfully",
              description: `Loaded ${tropes.length} tropes from GitHub repository`,
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${url}:`, error);
        lastError = error as Error;
      }
    }
    
    // If all URLs failed
    setIsLoading(false);
    throw new Error(`Could not fetch CSV data from any source. Last error: ${lastError?.message}`);
  };

  const handleFileUpload = (csvContent: string) => {
    try {
      const tropes = parseCSV(csvContent);
      setAllTropes(tropes);
      setGeneratedTropes([]); // Clear previous results
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tropes));
      
      toast({
        title: "File uploaded",
        description: `Successfully loaded ${tropes.length} tropes`,
      });
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: "Error parsing file",
        description: "Could not parse the CSV file. Please check the format.",
        variant: "destructive"
      });
    }
  };

  const generateTropes = () => {
    if (allTropes.length === 0) {
      toast({
        title: "No data available",
        description: "Please load tropes data first",
        variant: "destructive"
      });
      return;
    }

    const generated = generateRandomTropes(allTropes, tropeCount);
    setGeneratedTropes(generated);
    
    toast({
      title: "Tropes generated!",
      description: `Generated ${generated.length} random tropes`,
    });
  };

  return {
    allTropes,
    generatedTropes,
    tropeCount,
    isLoading,
    setTropeCount,
    handleFileUpload,
    generateTropes,
    fetchDefaultData
  };
};