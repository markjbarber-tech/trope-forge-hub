import { Trope } from '@/types/trope';

export const parseCSV = (csvText: string): Trope[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const tropes: Trope[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = parseCSVLine(line);
    
    if (parts.length >= 3) {
      tropes.push({
        id: parts[0] || `trope-${i}`,
        name: parts[1] || 'Unknown Trope',
        detail: parts[2] || 'No details available'
      });
    }
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
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

export const generateRandomTropes = (tropes: Trope[], count: number): Trope[] => {
  const shuffled = [...tropes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, tropes.length));
};