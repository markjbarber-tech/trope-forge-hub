import { Trope } from '@/types/trope';

export const parseCSV = (csvText: string): Trope[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const tropes: Trope[] = [];

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Skip header row if it exists
  const startIndex = lines[0].toLowerCase().includes('trope') || lines[0].includes('#') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = parseCSVLine(line);
    
    // Ensure we have at least 3 columns (ID, Name, Detail)
    if (parts.length >= 3) {
      const id = parts[0]?.trim() || `trope-${i}`;
      const name = parts[1]?.trim() || 'Unknown Trope';
      const detail = parts[2]?.trim() || 'No details available';
      
      // Only add if we have actual content
      if (name && name !== 'Unknown Trope' && detail && detail !== 'No details available') {
        tropes.push({ id, name, detail });
      }
    } else if (parts.length === 2) {
      // Handle case where there's no ID column
      const name = parts[0]?.trim() || 'Unknown Trope';
      const detail = parts[1]?.trim() || 'No details available';
      
      if (name && detail) {
        tropes.push({
          id: `trope-${i}`,
          name,
          detail
        });
      }
    }
  }

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