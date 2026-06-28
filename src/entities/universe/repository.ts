import type { Universe, CreateUniverseDTO } from './types';

export interface UniverseRepository {
  findAll(params?: { categoryId?: string; sort?: string; page?: number; limit?: number }): Promise<Universe[]>;
  findBySlug(slug: string): Promise<Universe | null>;
  findById(id: string): Promise<Universe | null>;
  create(data: CreateUniverseDTO): Promise<Universe>;
  update(id: string, data: Partial<CreateUniverseDTO>): Promise<Universe>;
  delete(id: string): Promise<void>;
}
