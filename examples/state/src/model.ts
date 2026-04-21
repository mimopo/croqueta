export interface Character {
  id: number;
  age: number;
  birthdate: string;
  gender: string;
  name: string;
  occupation: string;
  portrait_path: string;
  phrases: string[];
  status: string;
}

export interface ApiCharactersResponse {
  count: number;
  next: string | null;
  prev: string | null;
  pages: number;
  results: Character[];
}

export interface CharactersFeatureState {
  characters: Character[];
  page: number;
  total: number;
  status: 'idle' | 'loading' | 'completed';
}
