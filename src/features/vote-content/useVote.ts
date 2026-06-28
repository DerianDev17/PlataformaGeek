import { useState, useCallback } from 'react';
import { apiClient } from '@/shared/api';

export function useVote(token?: string | null) {
  const [loading, setLoading] = useState(false);

  const voteTheory = useCallback(
    async (theoryId: string): Promise<boolean> => {
      if (!token) return false;
      setLoading(true);
      try {
        await apiClient.post(`/theories/${theoryId}/vote`, {}, token);
        return true;
      } catch {
        return false;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { voteTheory, loading };
}
