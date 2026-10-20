import { z } from 'zod';

const MemorySchema = z.object({
  text: z.string(),
  documents: z.array(z.object({ id: z.string(), name: z.string(), text: z.string() })),
});

export type ContextMemory = z.infer<typeof MemorySchema>;
export const emptyContextMemory = (): ContextMemory => ({ text: '', documents: [] });

export function loadContextMemory(storage: Pick<Storage, 'getItem'>, key: string): ContextMemory {
  const raw = storage.getItem(key);
  if (!raw) return emptyContextMemory();
  const parsed = MemorySchema.safeParse(JSON.parse(raw));
  if (!parsed.success) throw new Error('Saved context is invalid.');
  return parsed.data;
}

export function saveContextMemory(storage: Pick<Storage, 'setItem'>, key: string, value: ContextMemory): void {
  storage.setItem(key, JSON.stringify(value));
}