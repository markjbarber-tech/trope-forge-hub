import { Trope } from '@/types/trope';

export const exportTropesToText = (tropes: Trope[]): void => {
  const content = tropes.map(trope => 
    `${trope.name}\n${'='.repeat(trope.name.length)}\n${trope.detail}\n\n`
  ).join('');

  downloadTextFile(content, 'dnd-tropes.txt');
};

export const exportPromptTemplate = (tropes: Trope[]): void => {
  const tropeList = tropes.map((trope, index) => `- ${trope.name}`).join('\n');
  
  const template = `D&D FANTASY ADVENTURE TEMPLATE USING STORY TROPES
==================================================

INSTRUCTIONS:
Insert 1–6 tropes from TVTropes.org or similar into the section below. Then follow the prompts to build your campaign structure.

TROPES SELECTED:
${tropeList}

--------------------------------------------------

CAMPAIGN TITLE AND PREMISE
--------------------------
[Insert a compelling fantasy campaign title]

Summary:
[1–2 paragraph summary. Show how the selected tropes intersect to shape the world and conflict.]

--------------------------------------------------

ADVENTURE HOOKS
---------------
[List 3–5 quest hooks that draw the players into the campaign. Each should reflect the tone and theme of the selected tropes.]

1.
2.
3.
4.
5.

--------------------------------------------------

KEY LOCATIONS
-------------
[Describe at least 3 major locations. For each, include a name, description, significance, and any magical/supernatural effects.]

- Location 1:
  Description:
  Importance:
  Unusual Effects/Inhabitants:

- Location 2:
  Description:
  Importance:
  Unusual Effects/Inhabitants:

- Location 3:
  Description:
  Importance:
  Unusual Effects/Inhabitants:

--------------------------------------------------

IMPORTANT NPCs
--------------
[Describe 3–5 memorable NPCs. Include name, role, personal agenda, what they want from the PCs, and roleplaying tips.]

- NPC 1:
  Role:
  Agenda:
  Wants:
  RP Tips:

- NPC 2:
  Role:
  Agenda:
  Wants:
  RP Tips:

- NPC 3:
  Role:
  Agenda:
  Wants:
  RP Tips:

--------------------------------------------------

SITUATIONAL STRUCTURE
----------------------
[List 4–6 key situations the players might face. These are not in strict order but are major non-linear challenges.]

- Situation 1: [Short Title]
  Setup:
  Choices/Conflict:
  Linked Tropes:

- Situation 2: [Short Title]
  Setup:
  Choices/Conflict:
  Linked Tropes:

- Situation 3: [Short Title]
  Setup:
  Choices/Conflict:
  Linked Tropes:

- Situation 4: [Short Title]
  Setup:
  Choices/Conflict:
  Linked Tropes:

--------------------------------------------------

RECURRING THEMES
----------------
[List 2–3 overarching themes or philosophical ideas that emerge from the tropes selected.]

1.
2.
3.

--------------------------------------------------

OPTIONAL ADD-ONS
----------------
Would you like to generate:
- Midjourney prompts for any NPC or location?
- A player-facing handout or summary?
- Mechanical elements like sanity rolls, corruption, magical effects, or custom monsters?`;

  downloadTextFile(template, 'dnd-campaign-template.txt');
};

const downloadTextFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};