export interface EncounterInput {
  id: string;
  location: string;
  fantasticalNature: string;
  currentState: string;
  situation: string;
  complication: string;
  npc: string;
  adversaries: string;
}

export interface GeneratedEncounter {
  location: string;
  fantasticalNature: string;
  currentState: string;
  situation: string;
  complication: string;
  npc: string;
  adversaries: string;
}

export type EncounterCategory = keyof Omit<EncounterInput, 'id'>;
