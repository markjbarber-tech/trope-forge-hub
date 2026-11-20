import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

export const SAVED_ADVENTURES_KEY = 'story-copilot-saved-adventures-v1';
export type AdventureKind = 'campaign' | 'oneshot' | 'encounter';

const EntrySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  kind: z.enum(['campaign', 'oneshot', 'encounter']),
  createdAt: z.string(),
  deleteToken: z.string().min(32).max(128),
  elements: z.array(z.object({ name: z.string(), detail: z.string().optional() })).default([]),
});
export type SavedAdventureEntry = z.infer<typeof EntrySchema>;

/** Parses a stored or imported list, dropping invalid entries and duplicate ids. */
export const parseSavedList = (raw: unknown): SavedAdventureEntry[] => {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: SavedAdventureEntry[] = [];
  for (const item of raw) {
    const r = EntrySchema.safeParse(item);
    if (r.success && !seen.has(r.data.id)) { seen.add(r.data.id); out.push(r.data); }
  }
  return out;
};

/** Merges imported entries into the current list; existing entries win. Newest first. */
export const mergeSavedLists = (current: SavedAdventureEntry[], incoming: SavedAdventureEntry[]) =>
  parseSavedList([...current, ...incoming]).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const loadSavedList = (): SavedAdventureEntry[] => {
  try { return parseSavedList(JSON.parse(localStorage.getItem(SAVED_ADVENTURES_KEY) ?? '[]')); } catch { return []; }
};
// Re-downloadable caches that may be evicted when browser storage is full.
const EVICTABLE_CACHE_KEYS = ['adventure-story-tropes-cache', 'dnd-tropes-data', 'encounter-inputs-csv', 'encounter-personal-tropes-cache', 'encounter-prompt-template'];

export const storeSavedList = (list: SavedAdventureEntry[]) => {
  const value = JSON.stringify(list);
  try {
    localStorage.setItem(SAVED_ADVENTURES_KEY, value);
  } catch {
    EVICTABLE_CACHE_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch { /* ignore */ } });
    localStorage.setItem(SAVED_ADVENTURES_KEY, value);
  }
  window.dispatchEvent(new Event('saved-adventures-changed'));
};

const blobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
});

const invoke = async <T,>(body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke('saved-adventures', { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data as T;
};

export const saveAdventure = async (input: {
  kind: AdventureKind; title: string; pdf: Blob;
  elements: { name: string; detail?: string }[]; settings?: Record<string, unknown>;
}): Promise<SavedAdventureEntry> => {
  const elements = input.elements.slice(0, 100).map(e => ({ name: e.name.slice(0, 300), detail: e.detail?.slice(0, 4000) }));
  const title = input.title.trim().slice(0, 200) || 'Untitled adventure';
  const { id, deleteToken } = await invoke<{ id: string; deleteToken: string }>({
    action: 'save', kind: input.kind, title, elements, settings: input.settings ?? {}, pdfBase64: await blobToBase64(input.pdf),
  });
  // Keep only short previews on the device: full element text lives with the saved adventure online.
  const preview = elements.map(e => ({ name: e.name.slice(0, 120), detail: e.detail?.slice(0, 200) }));
  const entry: SavedAdventureEntry = { id, deleteToken, title, kind: input.kind, createdAt: new Date().toISOString(), elements: preview };
  storeSavedList(mergeSavedLists(loadSavedList(), [entry]));
  return entry;
};

export const fetchAdventure = (id: string) => invoke<{
  id: string; kind: AdventureKind; title: string; elements: { name: string; detail?: string }[];
  settings: Record<string, unknown>; createdAt: string; downloadUrl: string;
}>({ action: 'get', id });

export const deleteAdventure = async (entry: SavedAdventureEntry) => {
  await invoke({ action: 'delete', id: entry.id, deleteToken: entry.deleteToken });
  storeSavedList(loadSavedList().filter(e => e.id !== entry.id));
};

export const renameAdventure = async (entry: SavedAdventureEntry, title: string) => {
  await invoke({ action: 'rename', id: entry.id, deleteToken: entry.deleteToken, title });
  storeSavedList(loadSavedList().map(e => e.id === entry.id ? { ...e, title } : e));
};

export const shareLink = (id: string) => `${window.location.origin}${import.meta.env.BASE_URL}#/adventure/${id}`;
export const kindLabel = (k: AdventureKind) => k === 'campaign' ? 'Campaign' : k === 'oneshot' ? 'One-Shot' : 'Encounter';
