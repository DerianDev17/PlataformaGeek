import { useState, useCallback } from 'react';
import { apiClient, ApiError } from '@/shared/api';

export interface Comment {
  id: string;
  content: string;
  articleId: string;
  authorId: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  parentId: string | null;
  replies?: Comment[];
  createdAt: string;
  isHidden: boolean;
}

export function useComments(articleId: string, token?: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Comment[]>(`/articles/${articleId}/comments`);
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comentarios');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  const addComment = useCallback(
    async (content: string, parentId?: string): Promise<boolean> => {
      if (!token) return false;
      setError(null);
      try {
        await apiClient.post(`/articles/${articleId}/comments`, { content, parentId }, token);
        await fetchComments();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al comentar';
        setError(message);
        return false;
      }
    },
    [articleId, token, fetchComments]
  );

  const deleteComment = useCallback(
    async (commentId: string): Promise<boolean> => {
      if (!token) return false;
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
