import type { Article, ArticleRevision, CreateArticleDTO, UpdateArticleDTO, ArticleListParams } from './types';

export interface ArticleRepository {
  findAll(params?: ArticleListParams): Promise<Article[]>;
  findBySlug(slug: string): Promise<Article | null>;
  findById(id: string): Promise<Article | null>;
  create(data: CreateArticleDTO, authorId: string): Promise<Article>;
  update(id: string, data: UpdateArticleDTO, editorId: string): Promise<Article>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
  getRevisions(articleId: string): Promise<ArticleRevision[]>;
  createRevision(articleId: string, data: UpdateArticleDTO, editorId: string): Promise<ArticleRevision>;
  approveRevision(revisionId: string, reviewerId: string): Promise<void>;
  rejectRevision(revisionId: string, reviewerId: string, reason: string): Promise<void>;
}
