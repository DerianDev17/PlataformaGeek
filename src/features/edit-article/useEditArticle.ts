import { useState, useCallback } from 'react';
import { apiClient } from '@/shared/api';
import type { Article, UpdateArticleDTO } from '@/entities/article';

export function useEditArticle(token?: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (articleId: string, data: UpdateArticleDTO): Promise<Article | null> => {
      setLoading(true);
      setError(null);
      try {
        const article = await apiClient.patch<Article>(`/articles/${articleId}`, data, token);
        return article;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al editar artículo';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { update, loading, error };
}
