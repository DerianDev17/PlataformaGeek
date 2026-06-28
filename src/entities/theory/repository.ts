import type { Theory, CreateTheoryDTO, TheoryStatus } from './types';

export interface TheoryRepository {
  findAll(params?: { universeId?: string; status?: TheoryStatus; page?: number; limit?: number }): Promise<Theory[]>;
  findById(id: string): Promise<Theory | null>;
  create(data: CreateTheoryDTO, authorId: string): Promise<Theory>;
  updateStatus(id: string, status: TheoryStatus): Promise<Theory>;
  delete(id: string): Promise<void>;
  vote(id: string, userId: string): Promise<Theory>;
  hasVoted(id: string, userId: string): Promise<boolean>;
}
