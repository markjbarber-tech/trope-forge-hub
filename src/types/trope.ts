export interface Trope {
  id: string;
  name: string;
  detail: string;
  source?: 'default' | 'personal' | 'custom';
}

export interface GeneratedTropes {
  tropes: Trope[];
  count: number;
}