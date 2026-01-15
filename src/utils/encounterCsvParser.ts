import Papa from 'papaparse';
import { EncounterInput, GeneratedEncounter, EncounterCategory } from '@/types/encounter';

const normalizeHeader = (s: string) =>
  s
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

interface CategoryData {
  location: string[];
  fantasticalNature: string[];
  currentState: string[];
  situation: string[];
  complication: string[];
  npc: string[];
  adversaries: string[];
}

export const parseEncounterCSV = (csvText: string): CategoryData => {
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

  // Map normalized headers to original headers
  const locationHeader = headerMap.get('location');
  const fantasticalHeader = headerMap.get('fantastical nature');
  const stateHeader = headerMap.get('current state of location');
  const situationHeader = headerMap.get('situation');
  const complicationHeader = headerMap.get('complication');
  const npcHeader = headerMap.get('npc');
  const adversariesHeader = headerMap.get('adversaries');

  console.log('Detected encounter headers:', {
    locationHeader,
    fantasticalHeader,
    stateHeader,
    situationHeader,
    complicationHeader,
    npcHeader,
    adversariesHeader,
    allHeaders: fields,
  });

  const rows = (result.data as Record<string, unknown>[]) || [];

  // Collect unique non-empty values for each category
  const categoryData: CategoryData = {
    location: [],
    fantasticalNature: [],
    currentState: [],
    situation: [],
    complication: [],
    npc: [],
    adversaries: [],
  };

  rows.forEach((row) => {
    const getValue = (header: string | undefined): string => {
      if (!header) return '';
      const value = row[header];
      return value == null ? '' : String(value).replace(/\r\n?/g, '\n').trim();
    };

    const location = getValue(locationHeader);
    const fantasticalNature = getValue(fantasticalHeader);
    const currentState = getValue(stateHeader);
    const situation = getValue(situationHeader);
    const complication = getValue(complicationHeader);
    const npc = getValue(npcHeader);
    const adversaries = getValue(adversariesHeader);

    if (location && !categoryData.location.includes(location)) {
      categoryData.location.push(location);
    }
    if (fantasticalNature && !categoryData.fantasticalNature.includes(fantasticalNature)) {
      categoryData.fantasticalNature.push(fantasticalNature);
    }
    if (currentState && !categoryData.currentState.includes(currentState)) {
      categoryData.currentState.push(currentState);
    }
    if (situation && !categoryData.situation.includes(situation)) {
      categoryData.situation.push(situation);
    }
    if (complication && !categoryData.complication.includes(complication)) {
      categoryData.complication.push(complication);
    }
    if (npc && !categoryData.npc.includes(npc)) {
      categoryData.npc.push(npc);
    }
    if (adversaries && !categoryData.adversaries.includes(adversaries)) {
      categoryData.adversaries.push(adversaries);
    }
  });

  console.log('Parsed category data:', {
    locations: categoryData.location.length,
    fantasticalNatures: categoryData.fantasticalNature.length,
    currentStates: categoryData.currentState.length,
    situations: categoryData.situation.length,
    complications: categoryData.complication.length,
    npcs: categoryData.npc.length,
    adversaries: categoryData.adversaries.length,
  });

  return categoryData;
};

export const generateRandomEncounter = (categoryData: CategoryData): GeneratedEncounter => {
  const getRandomItem = (items: string[]): string => {
    if (items.length === 0) return '';
    return items[Math.floor(Math.random() * items.length)];
  };

  return {
    location: getRandomItem(categoryData.location),
    fantasticalNature: getRandomItem(categoryData.fantasticalNature),
    currentState: getRandomItem(categoryData.currentState),
    situation: getRandomItem(categoryData.situation),
    complication: getRandomItem(categoryData.complication),
    npc: getRandomItem(categoryData.npc),
    adversaries: getRandomItem(categoryData.adversaries),
  };
};

export type { CategoryData };
