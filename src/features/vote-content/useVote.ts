import { useState, useCallback } from 'react';
import { apiClient } from '@/shared/api';

type VoteType = 'up' | 'down';
type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export function useVote(token?: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voteTheory = useCallback(
    async (theoryId: string, voteType: VoteType = 'up'): Promise<{ votes: number; status: string } | null> => {
      if (!token) return null;
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<ApiEnvelope<{ votes: number; status: string }>>(
          `/theories/${theoryId}/vote`,
          { voteType },
          token,
        );
        return response.data || null;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al votar';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { voteTheory, loading, error };
}
