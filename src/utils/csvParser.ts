import Papa from 'papaparse';
import { Trope } from '@/types/trope';
export const parseCSV = (csvText: string): Trope[] => {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    quoteChar: '"',
    escapeChar: '"',
    dynamicTyping: false,
  });

  if (result.errors && result.errors.length > 0) {
    console.warn('CSV parse warnings/errors:', result.errors);
  }

  const fields = result.meta.fields || [];
  const norm = (s: string) => s.trim().toLowerCase();

  const idKey = fields.find(f => ['#', 'id', 'number', 'no.', 'index'].includes(norm(f)))
    || fields.find(f => norm(f).includes('#') || norm(f).includes('id') || norm(f).includes('number'))
    || '#';
  const nameKey = fields.find(f => ['trope name', 'name', 'trope'].includes(norm(f)))
    || fields.find(f => norm(f).includes('trope') && norm(f).includes('name'))
    || fields.find(f => norm(f).includes('name'));
  const detailKey = fields.find(f => ['trope detail', 'detail', 'description'].includes(norm(f)))
    || fields.find(f => norm(f).includes('trope') && norm(f).includes('detail'))
    || fields.find(f => norm(f).includes('detail'));

  if (!nameKey || !detailKey) {
    throw new Error('CSV headers must include "Trope name" and "Trope detail" columns.');
  }

  const rows = (result.data as Record<string, unknown>[]) || [];

  const tropes: Trope[] = [];
  rows.forEach((row, idx) => {
    const rawId = idKey ? row[idKey] : undefined;
    const rawName = row[nameKey];
    const rawDetail = row[detailKey];

    // Preserve exact cell text; only normalize Windows line endings
    const id = (rawId != null && rawId !== '') ? String(rawId) : `trope-${idx + 1}`;
    const name = rawName == null ? '' : String(rawName).replace(/\r\n?/g, '\n');
    const detail = rawDetail == null ? '' : String(rawDetail).replace(/\r\n?/g, '\n');

    if (name && detail) {
      tropes.push({ id, name, detail });
    }
  });

  if (tropes.length === 0) {
    throw new Error('No valid trope rows found. Ensure your CSV has data under "Trope name" and "Trope detail".');
  }

  return tropes;
};


export const generateRandomTropes = (tropes: Trope[], count: number): Trope[] => {
  const shuffled = [...tropes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, tropes.length));
};