import { useState, useCallback } from 'react';
import { apiClient } from '@/shared/api';
import type { Article, UpdateArticleDTO } from '@/entities/article';

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export function useEditArticle(token?: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (articleId: string, data: UpdateArticleDTO): Promise<Article | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.patch<ApiEnvelope<Article>>(`/articles/${articleId}`, data, token);
        return response.data || null;
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
