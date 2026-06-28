export interface Tag {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
  createdAt: string;
}

export interface CreateTagDTO {
  name: string;
}
