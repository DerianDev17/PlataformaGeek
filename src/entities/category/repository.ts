import type { Category, CreateCategoryDTO } from './types';

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  create(data: CreateCategoryDTO): Promise<Category>;
  update(id: string, data: Partial<CreateCategoryDTO>): Promise<Category>;
  delete(id: string): Promise<void>;
}
