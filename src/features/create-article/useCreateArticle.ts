import { useState, useCallback } from 'react';
import { apiClient } from '@/shared/api';
import type { CreateArticleDTO, Article } from '@/entities/article';

export function useCreateArticle(token?: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: CreateArticleDTO): Promise<Article | null> => {
      setLoading(true);
      setError(null);
      try {
        const article = await apiClient.post<Article>('/articles', data, token);
        return article;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al crear artículo';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const saveDraft = useCallback(
    async (data: Partial<CreateArticleDTO>): Promise<Article | null> => {
      return create({ ...data, title: data.title || 'Sin título', summary: data.summary || '', content: data.content || '', universeId: data.universeId || '' });
    },
    [create]
  );

  return { create, saveDraft, loading, error };
}
