import Papa from 'papaparse';
import { Trope } from '@/types/trope';

const CSV_URL = 'https://markjbarber-tech.github.io/DnD-Story-Generator/data.csv';

// Normalize headers for case-insensitive matching
const normalizeHeader = (header: string): string => {
  return header
    .replace(/^\uFEFF/, '') // Remove BOM
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
};

export const fetchTropeData = async (): Promise<Trope[]> => {
  try {
    console.log('Fetching CSV data from:', CSV_URL);
    
    const response = await fetch(CSV_URL, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv,text/plain,*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    console.log('CSV data received, length:', csvText.length);

    return parseTropeCSV(csvText);
  } catch (error) {
    console.error('Failed to fetch CSV data:', error);
    throw new Error(`Failed to load trope data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const parseTropeCSV = (csvText: string): Trope[] => {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
    encoding: 'UTF-8',
  });

  if (result.errors && result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors);
  }

  const fields = result.meta.fields || [];
  if (fields.length === 0) {
    throw new Error('No headers found in CSV file');
  }

  console.log('Raw CSV headers:', fields);

  // Build normalized header mapping
  const headerMap = new Map<string, string>();
  fields.forEach(field => {
    headerMap.set(normalizeHeader(field), field);
  });

  console.log('Normalized header map:', Array.from(headerMap.entries()));

  // Strict header matching for required columns
  const idHeader = headerMap.get('#') || headerMap.get('number') || headerMap.get('no') || null;
  const nameHeader = headerMap.get('trope name');
  const detailHeader = headerMap.get('trope detail');

  console.log('Mapped headers:', {
    id: idHeader || '(auto-generated)',
    name: nameHeader || '(NOT FOUND)',
    detail: detailHeader || '(NOT FOUND)'
  });

  if (!nameHeader || !detailHeader) {
    throw new Error(
      `CSV must contain "Trope name" and "Trope detail" columns. Found headers: ${fields.join(', ')}`
    );
  }

  const rows = (result.data as Record<string, unknown>[]) || [];
  console.log('Total CSV rows:', rows.length);

  const tropes: Trope[] = [];
  
  rows.forEach((row, index) => {
    const rawId = idHeader ? row[idHeader] : undefined;
    const rawName = row[nameHeader];
    const rawDetail = row[detailHeader];

    // Generate ID if not provided
    const id = (rawId != null && rawId !== '') ? String(rawId) : `trope-${index + 1}`;
    
    // Preserve exact cell content, normalize line endings only
    const name = (rawName == null) ? '' : String(rawName).replace(/\r\n?/g, '\n').trim();
    const detail = (rawDetail == null) ? '' : String(rawDetail).replace(/\r\n?/g, '\n').trim();

    // Only include rows with both name and detail
    if (name && detail) {
      tropes.push({ id, name, detail });
    } else {
      console.warn(`Skipping row ${index + 1}: missing name or detail`, { name: !!name, detail: !!detail });
    }
  });

  console.log(`Successfully parsed ${tropes.length} tropes from ${rows.length} rows`);

  if (tropes.length === 0) {
    throw new Error('No valid trope data found. Check that CSV has "Trope name" and "Trope detail" columns with data.');
  }

  return tropes;
};

export const generateRandomTropes = (allTropes: Trope[], count: number): Trope[] => {
  if (allTropes.length === 0) return [];
  
  // Fisher-Yates shuffle for better randomness
  const shuffled = [...allTropes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, Math.min(count, shuffled.length));
};