import type { ApiCharactersResponse } from './model';

export class ApiService {
  public async getCharacters(page: number): Promise<ApiCharactersResponse> {
    const response = await fetch(`https://thesimpsonsapi.com/api/characters?page=${page}`);
    return response.json();
  }
}
