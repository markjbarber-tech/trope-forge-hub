import { Trope } from '@/types/trope';

export const parseCSV = (csvText: string): Trope[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const tropes: Trope[] = [];

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  console.log('Parsing CSV with', lines.length, 'lines');
  console.log('First few lines:', lines.slice(0, 3));

  // Parse header to identify column positions
  const headerLine = lines[0];
  const headerParts = parseCSVLine(headerLine);
  console.log('Header parts:', headerParts);
  
  // Find column indices
  let idColumnIndex = -1;
  let nameColumnIndex = -1;
  let detailColumnIndex = -1;
  
  headerParts.forEach((header, index) => {
    const cleanHeader = header.toLowerCase().trim();
    if (cleanHeader.includes('#') || cleanHeader.includes('id') || cleanHeader.includes('number')) {
      idColumnIndex = index;
    } else if (cleanHeader.includes('trope name') || cleanHeader.includes('name')) {
      nameColumnIndex = index;
    } else if (cleanHeader.includes('trope detail') || cleanHeader.includes('detail')) {
      detailColumnIndex = index;
    }
  });
  
  console.log('Column indices - ID:', idColumnIndex, 'Name:', nameColumnIndex, 'Detail:', detailColumnIndex);
  
  // If we can't find proper headers, assume standard order: ID, Name, Detail
  if (nameColumnIndex === -1 || detailColumnIndex === -1) {
    console.log('Headers not found, using standard order: [ID, Name, Detail]');
    idColumnIndex = 0;
    nameColumnIndex = 1;
    detailColumnIndex = 2;
  }
  
  // Parse data rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = parseCSVLine(line);
    console.log(`Row ${i} parts:`, parts);
    
    // Ensure we have enough columns
    if (parts.length <= Math.max(nameColumnIndex, detailColumnIndex)) {
      console.warn(`Row ${i} doesn't have enough columns:`, parts);
      continue;
    }
    
    const id = (idColumnIndex >= 0 && parts[idColumnIndex]) ? parts[idColumnIndex].trim() : `trope-${i}`;
    const name = parts[nameColumnIndex]?.trim() || '';
    const detail = parts[detailColumnIndex]?.trim() || '';
    
    console.log(`Row ${i} - ID: "${id}", Name: "${name}", Detail: "${detail}"`);
    
    // Only add if we have both name and detail
    if (name && detail && name !== 'Unknown Trope' && detail !== 'No details available') {
      tropes.push({ id, name, detail });
    } else {
      console.warn(`Row ${i} skipped - missing name or detail:`, { name, detail });
    }
  }

  console.log('Parsed tropes:', tropes.length, tropes.slice(0, 3));

  if (tropes.length === 0) {
    throw new Error('No valid trope data found in CSV');
  }

  return tropes;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Handle escaped quotes
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current);
  
  // Clean up fields - remove surrounding quotes and trim
  return result.map(field => {
    let cleaned = field.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }
    return cleaned;
  });
};

export const generateRandomTropes = (tropes: Trope[], count: number): Trope[] => {
  const shuffled = [...tropes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, tropes.length));
};