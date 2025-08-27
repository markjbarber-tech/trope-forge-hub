import Papa from 'papaparse';
import { Trope } from '@/types/trope';

const normalizeHeader = (s: string) =>
  s
    .replace(/^\uFEFF/, '') // strip BOM if present
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

export const parseCSV = (csvText: string): Trope[] => {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });

  if (result.errors && result.errors.length > 0) {
    console.warn('CSV parse warnings/errors:', result.errors);
  }

  const fields = result.meta.fields || [];
  if (fields.length === 0) {
    throw new Error('No headers found in CSV.');
  }

  // Build normalized -> original header map
  const headerMap = new Map<string, string>();
  for (const f of fields) {
    headerMap.set(normalizeHeader(f), f);
  }

  // Strict, exact header resolution
  const idHeader = headerMap.get('#') || headerMap.get('number') || headerMap.get('no .') || null;
  const nameHeader = headerMap.get('trope name');
  const detailHeader = headerMap.get('trope detail');

  if (!nameHeader || !detailHeader) {
    throw new Error('CSV headers must include "Trope name" and "Trope detail" columns (case-insensitive).');
  }

  console.log('Detected headers:', {
    idHeader: idHeader || '(auto-generated)',
    nameHeader,
    detailHeader,
    allHeaders: fields,
  });

  const rows = (result.data as Record<string, unknown>[]) || [];

  const tropes: Trope[] = [];
  rows.forEach((row, idx) => {
    const rawId = idHeader ? row[idHeader] : undefined;
    const rawName = row[nameHeader];
    const rawDetail = row[detailHeader];

    // Preserve exact cell text; only normalize Windows line endings
    const id = rawId != null && rawId !== '' ? String(rawId) : `trope-${idx + 1}`;
    const name = rawName == null ? '' : String(rawName).replace(/\r\n?/g, '\n');
    const detail = rawDetail == null ? '' : String(rawDetail).replace(/\r\n?/g, '\n');

    // Only accept rows with both name and detail from the same row
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
