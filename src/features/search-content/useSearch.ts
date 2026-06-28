import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '@/shared/api';
import type { Article } from '@/entities/article';
import type { Universe } from '@/entities/universe';
import type { Character } from '@/entities/character';

export interface SearchResult {
  type: 'article' | 'universe' | 'character' | 'theory';
  slug: string;
  title: string;
  description: string;
  imageUrl?: string;
}

const DEBOUNCE_MS = 300;

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await apiClient.get<{
        articles: Article[];
        universes: Universe[];
        characters: Character[];
      }>(`/search?q=${encodeURIComponent(q)}`);

      const mapped: SearchResult[] = [
        ...(data.articles || []).map((a) => ({
          type: 'article' as const,
          slug: a.slug,
          title: a.title,
          description: a.summary,
          imageUrl: a.coverImage || undefined,
        })),
        ...(data.universes || []).map((u) => ({
          type: 'universe' as const,
          slug: u.slug,
          title: u.name,
          description: u.description,
          imageUrl: u.coverImage || undefined,
        })),
        ...(data.characters || []).map((c) => ({
          type: 'character' as const,
          slug: c.slug,
          title: c.name,
          description: c.description,
          imageUrl: c.imageUrl || undefined,
        })),
      ];
      setResults(mapped);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback(
    (q: string) => {
      setQuery(q);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => search(q), DEBOUNCE_MS);
    },
    [search]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  }, []);

  return {
    query,
    results,
    loading,
    isOpen,
    open,
    close,
    handleQueryChange,
  };
}
