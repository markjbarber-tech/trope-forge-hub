import { useState, useEffect } from 'react';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/markjbarber-tech/DnD-Story-Generator/fb5b57a89a19fea37d44c110ee9e9e3505dacb6f/Lovable_DnD_Encounter_AutoExec_System_Prompt_v1.3.txt';
const LOCAL_STORAGE_KEY = 'encounter-prompt-template';
const LOCAL_FALLBACK_PATH = '/encounter-prompt-template.txt';

export const usePromptTemplate = () => {
  const [template, setTemplate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<'github' | 'cache' | 'local'>('cache');

  useEffect(() => {
    const loadTemplate = async () => {
      setIsLoading(true);
      
      // Try fetching from GitHub first
      try {
        const response = await fetch(GITHUB_RAW_URL);
        if (response.ok) {
          const text = await response.text();
          setTemplate(text);
          setSource('github');
          // Cache in localStorage for offline use
          localStorage.setItem(LOCAL_STORAGE_KEY, text);
          console.log('Prompt template loaded from GitHub');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.warn('Failed to fetch template from GitHub:', error);
      }

      // Fallback to localStorage cache
      const cachedTemplate = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedTemplate) {
        setTemplate(cachedTemplate);
        setSource('cache');
        console.log('Prompt template loaded from cache');
        setIsLoading(false);
        return;
      }

      // Final fallback to local public file
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${baseUrl}encounter-prompt-template.txt?v=${Date.now()}`);
        if (response.ok) {
          const text = await response.text();
          setTemplate(text);
          setSource('local');
          // Cache for future use
          localStorage.setItem(LOCAL_STORAGE_KEY, text);
          console.log('Prompt template loaded from local file');
        }
      } catch (error) {
        console.error('Failed to load prompt template from any source:', error);
      }

      setIsLoading(false);
    };

    loadTemplate();
  }, []);

  return { template, isLoading, source };
};
