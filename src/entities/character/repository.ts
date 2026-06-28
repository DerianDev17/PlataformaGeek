import type { Character, CreateCharacterDTO } from './types';

export interface CharacterRepository {
  findAll(params?: { universeId?: string; search?: string; page?: number; limit?: number }): Promise<Character[]>;
  findBySlug(slug: string): Promise<Character | null>;
  findById(id: string): Promise<Character | null>;
  create(data: CreateCharacterDTO): Promise<Character>;
  update(id: string, data: Partial<CreateCharacterDTO>): Promise<Character>;
  delete(id: string): Promise<void>;
}
