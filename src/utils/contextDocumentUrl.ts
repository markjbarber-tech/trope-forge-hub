import { z } from 'zod';

const DocumentUrlSchema = z.string().trim().max(2048).url().refine(value => {
  const url = new URL(value);
  return url.protocol === 'https:' && !url.username && !url.password;
}, 'Enter a valid HTTPS document URL.');

export function validateContextDocumentUrl(value: string): string {
  const result = DocumentUrlSchema.safeParse(value);
  if (!result.success) throw new Error('Enter a valid HTTPS document URL.');
  return result.data;
}