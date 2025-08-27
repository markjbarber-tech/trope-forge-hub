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
      mode: 'cors',
      headers: {
        'Accept': 'text/csv,text/plain,*/*',
        'Cache-Control': 'no-cache',
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
    
    // Try alternative approaches for CORS issues
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('Attempting to fetch via proxy...');
      return await fetchViaProxy();
    }
    
    throw new Error(`Failed to load trope data: ${error instanceof Error ? error.message : 'Network error'}`);
  }
};

// Alternative fetch method for CORS issues
const fetchViaProxy = async (): Promise<Trope[]> => {
  try {
    // Try using a CORS proxy as fallback
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(CSV_URL)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Proxy fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    const csvText = data.contents;
    
    console.log('CSV data received via proxy, length:', csvText.length);
    return parseTropeCSV(csvText);
  } catch (error) {
    console.error('Proxy fetch also failed:', error);
    // Return fallback data if all else fails
    return getFallbackData();
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

// Fallback data in case all network requests fail
const getFallbackData = (): Trope[] => {
  return [
    {
      id: 'fallback-1',
      name: 'The Chosen One',
      detail: 'A character who is prophesied or destined to save the world, defeat evil, or accomplish some other great task. Often reluctant at first, they must grow into their role and accept their destiny.'
    },
    {
      id: 'fallback-2', 
      name: 'The Mentor',
      detail: 'An older, wiser character who guides and teaches the hero. Often has a mysterious past and may sacrifice themselves to help the hero succeed.'
    },
    {
      id: 'fallback-3',
      name: 'Ancient Evil Returns',
      detail: 'A powerful evil force that was defeated or sealed away long ago has returned to threaten the world once more. The heroes must discover how it was defeated before.'
    },
    {
      id: 'fallback-4',
      name: 'Unlikely Alliance',
      detail: 'Former enemies or unlikely companions must work together to face a greater threat. Their differences create tension but ultimately make them stronger.'
    },
    {
      id: 'fallback-5',
      name: 'Lost Artifact',
      detail: 'A powerful magical item has been lost, stolen, or broken. The heroes must find it, recover its pieces, or prevent it from falling into the wrong hands.'
    },
    {
      id: 'fallback-6',
      name: 'Betrayal from Within',
      detail: 'Someone the heroes trusted reveals themselves to be working for the enemy, or is forced to betray the party due to blackmail, mind control, or other circumstances.'
    }
  ];
};