import Papa from 'papaparse';
import { Trope } from '@/types/trope';

const CSV_URL = 'https://markjbarber-tech.github.io/DnD-Story-Generator/data.csv';
const FALLBACK_CSV_URL = '/data.csv'; // Local fallback

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
  console.log('Fetching CSV data from:', CSV_URL);
  
  // Try multiple approaches to fetch the CSV data
  const fetchMethods = [
    // Method 1: Direct fetch
    () => fetch(CSV_URL, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'text/csv,text/plain,*/*',
        'Cache-Control': 'no-cache',
      },
    }),
    
    // Method 2: CORS Anywhere proxy
    () => fetch(`https://cors-anywhere.herokuapp.com/${CSV_URL}`, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    }),
    
    // Method 3: AllOrigins proxy
    () => fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(CSV_URL)}`),
    
    // Method 4: CORS.sh proxy
    () => fetch(`https://cors.sh/${CSV_URL}`, {
      headers: { 'x-cors-api-key': 'temp_key' }
    }),
    
    // Method 5: JSONProxy
    () => fetch(`https://jsonp.afeld.me/?url=${encodeURIComponent(CSV_URL)}`),
  ];

  let lastError: Error | null = null;

  for (let i = 0; i < fetchMethods.length; i++) {
    try {
      console.log(`Trying fetch method ${i + 1}...`);
      const response = await fetchMethods[i]();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let csvText: string;
      
      // Handle different response formats
      if (i === 2) { // AllOrigins returns JSON
        const data = await response.json();
        csvText = data.contents;
      } else {
        csvText = await response.text();
      }

      console.log(`Method ${i + 1} succeeded! CSV length:`, csvText.length);
      
      if (csvText.length < 100) {
        throw new Error('CSV data too short, might be an error page');
      }

      const tropes = parseTropeCSV(csvText);
      console.log(`Successfully parsed ${tropes.length} tropes`);
      
      if (tropes.length > 6) { // Only accept if we got more than fallback data
        return tropes;
      } else {
        throw new Error('Parsed data seems incomplete');
      }
      
    } catch (error) {
      console.warn(`Fetch method ${i + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      continue;
    }
  }

  // If all methods fail, try one more direct approach without CORS
  console.log('All proxy methods failed, trying raw GitHub content...');
  try {
    const rawUrl = CSV_URL.replace('github.io', 'githubusercontent.com').replace('/blob/', '/');
    const response = await fetch(rawUrl);
    if (response.ok) {
      const csvText = await response.text();
      if (csvText.length > 100) {
        const tropes = parseTropeCSV(csvText);
        if (tropes.length > 6) {
          console.log(`Raw GitHub method succeeded! Got ${tropes.length} tropes`);
          return tropes;
        }
      }
    }
  } catch (error) {
    console.warn('Raw GitHub method also failed:', error);
  }

  // If all methods fail, try local fallback CSV
  console.log('All remote methods failed, trying local fallback...');
  try {
    const response = await fetch(FALLBACK_CSV_URL);
    if (response.ok) {
      const csvText = await response.text();
      if (csvText.length > 100) {
        const tropes = parseTropeCSV(csvText);
        if (tropes.length > 6) {
          console.log(`Local fallback method succeeded! Got ${tropes.length} tropes`);
          return tropes;
        }
      }
    }
  } catch (error) {
    console.warn('Local fallback method also failed:', error);
  }
  
  // Last resort: return fallback data but with warning
  console.warn('All fetch methods failed, using fallback data');
  throw new Error(`Network error: ${lastError?.message || 'Unable to fetch CSV data'}. Using demo tropes.`);
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
export const getFallbackData = (): Trope[] => {
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