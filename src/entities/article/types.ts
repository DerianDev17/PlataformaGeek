import type { Universe } from '@/entities/universe/types';
import type { User } from '@/entities/user/types';
import type { Category } from '@/entities/category/types';
import type { Tag } from '@/entities/tag/types';

export type ArticleStatus = 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected';

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string | null;
  status: ArticleStatus;
  views: number;
  universeId: string;
  universe?: Universe;
  authorId: string;
  author?: User;
  categories?: Category[];
  tags?: Tag[];
  relatedArticles?: Article[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface ArticleRevision {
  id: string;
  articleId: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  editorId: string;
  editor?: User;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface CreateArticleDTO {
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  universeId: string;
  categoryIds?: string[];
  tagNames?: string[];
}

export interface UpdateArticleDTO {
  title?: string;
  summary?: string;
  content?: string;
  coverImage?: string;
  universeId?: string;
  categoryIds?: string[];
  tagNames?: string[];
}

export type ArticleListParams = {
  status?: ArticleStatus;
  universeId?: string;
  categoryId?: string;
  tagId?: string;
  search?: string;
  authorId?: string;
  page?: number;
  limit?: number;
  sort?: 'recent' | 'popular' | 'trending';
};
