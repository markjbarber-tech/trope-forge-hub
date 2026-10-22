import requirements from './oneShotRequirements.md?raw';
import { buildCampaignContext, type CampaignDocument } from './campaignContext';
import type { Trope } from '@/types/trope';

interface OneShotPromptInput {
  tropes: Trope[];
  loreSection?: string;
  history?: string;
  historyDocuments?: CampaignDocument[];
  characters?: string;
  characterDocuments?: CampaignDocument[];
}

// Both clipboard export and direct generation use this complete prompt.
export const buildOneShotPrompt = ({ tropes, loreSection = '', history = '', historyDocuments = [], characters = '', characterDocuments = [] }: OneShotPromptInput): string => {
  const table = tropes.map((element, index) => `| ${index + 1} | ${element.name} | ${element.detail || '(No description provided)'} |`).join('\n');
  return `# 🎯 PROMPT: ONE-SHOT ADVENTURE BUILDER

Create a complete D&D 5e one-shot adventure based on the following story tropes.

## TROPES TABLE

| # | Trope Name | Trope Description |
|---|------------|-------------------|
${table}
${loreSection}
${buildCampaignContext(history, historyDocuments, 'history', 'adventure')}
${buildCampaignContext(characters, characterDocuments, 'characters', 'adventure')}

${requirements.trim()}`;
};
