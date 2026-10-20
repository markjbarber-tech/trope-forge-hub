import { useEffect, useState } from 'react';
import { z } from 'zod';

const LoreSchema = z.array(z.object({
  id: z.string(), title: z.string(), url: z.string(), sourceType: z.enum(['url', 'file']),
  fileContent: z.string().optional(), fileName: z.string().optional(),
}));
interface LoreDocument {
  id: string; title: string; url: string; sourceType: 'url' | 'file'; fileContent?: string; fileName?: string;
}

export function useLoreMemory(kind: 'adventure' | 'encounter') {
  const key = `story-copilot-lore-${kind}-v1`;
  const [initial] = useState(() => {
    try {
      const parsed = LoreSchema.parse(JSON.parse(localStorage.getItem(key) ?? '[]'));
      const links: LoreDocument[] = parsed.map(item => ({ ...item, id: item.id ?? '', title: item.title ?? '', url: item.url ?? '', sourceType: item.sourceType ?? 'url' }));
      return { links, error: '' };
    } catch {
      return { links: [] as LoreDocument[], error: 'Saved lore could not be restored on this device.' };
    }
  });
  const [loreLinks, setLinks] = useState(initial.links);
  const [loreSaveError, setError] = useState(initial.error);
  const [changed, setChanged] = useState(false);
  useEffect(() => {
    if (!changed) return;
    try {
      localStorage.setItem(key, JSON.stringify(loreLinks));
      setError('');
    } catch {
      setError('Lore could not be saved on this device. Keep a copy before closing.');
    }
  }, [key, loreLinks, changed]);
  const setLoreLinks = (links: LoreDocument[]) => { setChanged(true); setLinks(links); };
  return { loreLinks, setLoreLinks, loreSaveError };
}