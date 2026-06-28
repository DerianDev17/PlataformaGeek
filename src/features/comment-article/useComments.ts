import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/shared/api';

export interface Comment {
  id: string;
  articleId: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export function useComments(articleId: string, token?: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!articleId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiEnvelope<Comment[]>>(`/articles/${articleId}/comments`, token);
      setComments(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  }, [articleId, token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = useCallback(
    async (content: string): Promise<Comment | null> => {
      if (!token) {
        setError('Necesitas iniciar sesion para comentar');
        return null;
      }
      setError(null);
      try {
        const response = await apiClient.post<ApiEnvelope<Comment>>(
          `/articles/${articleId}/comments`,
          { content },
          token
        );
        if (response.data) {
          setComments((prev) => [...prev, response.data!]);
          return response.data;
        }
        return null;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al publicar comentario');
        return null;
      }
    },
    [articleId, token]
  );

  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      if (!token) return false;
      setError(null);
      try {
        await apiClient.delete(`/comments/${commentId}`, token);
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar comentario');
        return false;
      }
    },
    [token]
  );

  return { comments, loading, error, fetchComments, addComment, deleteComment };
}
