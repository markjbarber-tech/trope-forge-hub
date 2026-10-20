import { supabase } from '@/integrations/supabase/client';

export async function readLoreTitle(url: string): Promise<string> {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || url.length > 2048) throw new Error('Enter a public HTTPS document URL.');
  const { data, error } = await supabase.functions.invoke('lore-document-title', { body: { url } });
  if (error) throw new Error('Could not read the document title. Enter an optional title.');
  if (!data?.title) throw new Error(data?.error || 'No document title found. Enter an optional title.');
  return data.title;
}