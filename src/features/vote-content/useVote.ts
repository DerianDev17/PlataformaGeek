import { useState, useCallback } from 'react';
import { apiClient } from '@/shared/api';
import type { TheoryStatus } from '@/entities/theory';

type VoteType = 'up' | 'down';
type ApiEnvelope<T> = { success: boolean; data: T; message?: string };
type TheoryVoteResult = { votes: number; status: TheoryStatus };

export function useVote(token?: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voteTheory = useCallback(
    async (theoryId: string, voteType: VoteType = 'up'): Promise<TheoryVoteResult | null> => {
      if (!token) return null;
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.post<ApiEnvelope<TheoryVoteResult>>(
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
