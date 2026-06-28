export interface Universe {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
  bannerImage: string | null;
  articleCount: number;
  characterCount: number;
  theoryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUniverseDTO {
  name: string;
  description: string;
  coverImage?: string;
  bannerImage?: string;
}
