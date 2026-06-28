export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  articleCount: number;
  createdAt: string;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  parentId?: string;
}
