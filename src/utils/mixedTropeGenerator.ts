import { Trope } from '@/types/trope';

export const generateMixedTropes = (
  defaultTropes: Trope[], 
  personalTropes: Trope[], 
  totalCount: number
): Trope[] => {
  if (personalTropes.length === 0) {
    // No personal data, just use default
    return generateRandomTropes(defaultTropes, totalCount);
  }

  if (totalCount === 1) {
    // If only 1 trope requested, always use personal
    return generateRandomTropes(personalTropes, 1);
  }

  // Ensure at least 1 from personal, rest from combined pool
  const personalCount = 1;
  const remainingCount = totalCount - personalCount;

  // Get 1 random from personal
  const selectedPersonal = generateRandomTropes(personalTropes, personalCount);
  
  // Get remaining from combined pool (excluding already selected)
  const combinedPool = [...defaultTropes, ...personalTropes].filter(
    trope => !selectedPersonal.some(selected => selected.id === trope.id)
  );
  
  const remainingTropes = generateRandomTropes(combinedPool, remainingCount);
  
  // Combine and shuffle the final result
  const result = [...selectedPersonal, ...remainingTropes];
  return shuffleArray(result);
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

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};