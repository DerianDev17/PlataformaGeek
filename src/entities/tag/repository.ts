import type { Tag, CreateTagDTO } from './types';

export interface TagRepository {
  findAll(): Promise<Tag[]>;
  findById(id: string): Promise<Tag | null>;
  findBySlug(slug: string): Promise<Tag | null>;
  create(data: CreateTagDTO): Promise<Tag>;
  delete(id: string): Promise<void>;
}
