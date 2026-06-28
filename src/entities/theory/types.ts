import type { User } from '@/entities/user/types';
import type { Universe } from '@/entities/universe/types';

export type TheoryStatus = 'open' | 'debated' | 'confirmed' | 'rejected';

export interface Theory {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: TheoryStatus;
  votes: number;
  universeId: string;
  universe?: Universe;
  authorId: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTheoryDTO {
  title: string;
  content: string;
  universeId: string;
}
