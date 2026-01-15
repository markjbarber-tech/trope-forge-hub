import { useState, useEffect, useCallback } from 'react';
import { EncounterCategory } from '@/types/encounter';

interface CustomInput {
  value: string;
  category: EncounterCategory;
  addedAt: number; // timestamp
}

const STORAGE_KEY = 'custom-encounter-inputs';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const useCustomEncounterInputs = () => {
  const [customInputs, setCustomInputs] = useState<CustomInput[]>([]);

  // Load from localStorage on mount and filter out expired entries
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: CustomInput[] = JSON.parse(stored);
        const now = Date.now();
        const valid = parsed.filter(input => now - input.addedAt < THIRTY_DAYS_MS);
        setCustomInputs(valid);
        // Update storage with filtered list
        localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
      } catch (e) {
        console.error('Failed to parse custom inputs:', e);
      }
    }
  }, []);

  // Save to localStorage whenever customInputs changes
  const saveToStorage = useCallback((inputs: CustomInput[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, []);

  const addCustomInput = useCallback((category: EncounterCategory, value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return false;

    // Check for duplicates in the same category
    const exists = customInputs.some(
      input => input.category === category && input.value.toLowerCase() === trimmedValue.toLowerCase()
    );
    if (exists) return false;

    const newInput: CustomInput = {
      value: trimmedValue,
      category,
      addedAt: Date.now(),
    };

    const updated = [...customInputs, newInput];
    setCustomInputs(updated);
    saveToStorage(updated);
    return true;
  }, [customInputs, saveToStorage]);

  const removeCustomInput = useCallback((category: EncounterCategory, value: string) => {
    const updated = customInputs.filter(
      input => !(input.category === category && input.value === value)
    );
    setCustomInputs(updated);
    saveToStorage(updated);
  }, [customInputs, saveToStorage]);

  const getCustomInputsForCategory = useCallback((category: EncounterCategory): string[] => {
    return customInputs
      .filter(input => input.category === category)
      .map(input => input.value);
  }, [customInputs]);

  const exportCustomInputs = useCallback(() => {
    const categoryLabels: Record<EncounterCategory, string> = {
      location: 'Location',
      fantasticalNature: 'Fantastical Nature',
      currentState: 'Current State',
      situation: 'Situation',
      complication: 'Complication',
      npc: 'NPC',
      adversaries: 'Adversaries',
    };

    const groupedByCategory: Record<string, CustomInput[]> = {};
    
    customInputs.forEach(input => {
      const label = categoryLabels[input.category];
      if (!groupedByCategory[label]) {
        groupedByCategory[label] = [];
      }
      groupedByCategory[label].push(input);
    });

    let content = '# Custom Encounter Inputs\n';
    content += `# Exported: ${new Date().toLocaleString()}\n`;
    content += `# Total entries: ${customInputs.length}\n\n`;

    Object.entries(groupedByCategory).forEach(([category, inputs]) => {
      content += `## ${category}\n`;
      inputs.forEach(input => {
        const date = new Date(input.addedAt).toLocaleDateString();
        content += `- ${input.value} (added: ${date})\n`;
      });
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-encounter-inputs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [customInputs]);

  const clearAllCustomInputs = useCallback(() => {
    setCustomInputs([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    customInputs,
    addCustomInput,
    removeCustomInput,
    getCustomInputsForCategory,
    exportCustomInputs,
    clearAllCustomInputs,
    totalCount: customInputs.length,
  };
};
