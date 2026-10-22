import { z } from 'zod';
import { CampaignDocument } from './campaignContext';

const MemorySchema = z.object({
  text: z.string(),
  documents: z.array(z.object({ id: z.string(), name: z.string(), text: z.string(), url: z.string().url().refine(value => { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; }).optional() })),
});

export interface ContextMemory { text: string; documents: CampaignDocument[]; }
export const emptyContextMemory = (): ContextMemory => ({ text: '', documents: [] });

export function loadContextMemory(storage: Pick<Storage, 'getItem'>, key: string): ContextMemory {
  const raw = storage.getItem(key);
  if (!raw) return emptyContextMemory();
  const parsed = MemorySchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error('Saved context is invalid.');
  return { text: parsed.data.text, documents: parsed.data.documents.map(document => ({ id: document.id, name: document.name, text: document.text, ...(document.url ? { url: document.url } : {}) })) };
}

export function saveContextMemory(storage: Pick<Storage, 'setItem'>, key: string, value: ContextMemory): void {
  storage.setItem(key, JSON.stringify(value));
}