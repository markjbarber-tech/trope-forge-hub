import { useState, useEffect } from 'react';
import { Trope } from '@/types/trope';
import { parseCSV, generateRandomTropes } from '@/utils/csvParser';
import { SAMPLE_TROPES } from '@/data/sampleTropes';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_CSV_URL = 'https://markjbarber-tech.github.io/DnD-Story-Generator/data.csv';
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

      // Try to fetch default CSV, but fallback to sample data
      try {
        await fetchDefaultData();
      } catch (error) {
        console.warn('Could not fetch default data, using sample tropes:', error);
        // Use sample data as fallback
        setAllTropes(SAMPLE_TROPES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_TROPES));
        toast({
          title: "Using sample data",
          description: `Loaded ${SAMPLE_TROPES.length} sample tropes. Upload your own CSV file to use custom data.`,
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading tropes:', error);
      toast({
        title: "Error loading data", 
        description: "Could not load tropes data. Please try uploading a CSV file.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const fetchDefaultData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(DEFAULT_CSV_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      const tropes = parseCSV(csvText);
      
      setAllTropes(tropes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tropes));
      
      toast({
        title: "Data loaded",
        description: `Loaded ${tropes.length} tropes from default source`,
      });
    } catch (error) {
      console.error('Error fetching default data:', error);
      toast({
        title: "Error fetching data",
        description: "Could not load default tropes. Please upload a CSV file.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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