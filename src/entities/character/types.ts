import type { Universe } from '@/entities/universe/types';

export interface Character {
  id: string;
  name: string;
  slug: string;
  alias: string | null;
  description: string;
  imageUrl: string | null;
  universeId: string;
  universe?: Universe;
  relationships?: CharacterRelation[];
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterRelation {
  id: string;
  characterId: string;
  relatedCharacterId: string;
  relatedCharacter?: Character;
  relationType: 'ally' | 'enemy' | 'rival' | 'family' | 'mentor' | 'other';
  description: string;
}

export interface CreateCharacterDTO {
  name: string;
  alias?: string;
  description: string;
  imageUrl?: string;
  universeId: string;
}
