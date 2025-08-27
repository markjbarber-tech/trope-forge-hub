export interface Trope {
  id: string;
  name: string;
  detail: string;
}

export interface GeneratedTropes {
  tropes: Trope[];
  count: number;
}