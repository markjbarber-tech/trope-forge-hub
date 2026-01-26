import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseAdventureAIReturn {
  generateAdventure: (prompt: string, adventureType: 'campaign' | 'oneshot') => Promise<string | null>;
  isGenerating: boolean;
  error: string | null;
}

export const useAdventureAI = (): UseAdventureAIReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getInvokeErrorMessage = async (functionError: unknown): Promise<string> => {
    const fallback = functionError instanceof Error
      ? functionError.message
      : 'Failed to generate adventure';

    try {
      const ctx = (functionError as any)?.context;
      const res: Response | undefined = ctx?.response;
      const status: number | undefined = ctx?.status;

      if (!res) return fallback;

      const text = await res.text();
      if (!text) return status ? `${fallback} (HTTP ${status})` : fallback;

      try {
        const parsed = JSON.parse(text);
        const bodyMessage = parsed?.error || parsed?.message;
        if (typeof bodyMessage === 'string' && bodyMessage.trim()) return bodyMessage;
      } catch {
        // not json
      }

      return status ? `${fallback} (HTTP ${status})` : fallback;
    } catch {
      return fallback;
    }
  };

  const generateAdventure = async (prompt: string, adventureType: 'campaign' | 'oneshot'): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      console.log('Calling generate-adventure edge function...');
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-adventure', {
        body: { prompt, adventureType }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        const msg = await getInvokeErrorMessage(functionError);
        throw new Error(msg);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.content) {
        throw new Error('No content received from AI');
      }

      console.log('Successfully generated adventure');
      return data.content;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error generating adventure:', errorMessage);
      setError(errorMessage);
      
      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAdventure,
    isGenerating,
    error,
  };
};
