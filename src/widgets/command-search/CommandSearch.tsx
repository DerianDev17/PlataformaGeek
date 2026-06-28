import { useEffect, useState } from 'react';
import { useSearch, type SearchResult } from '@/features/search-content';
import { Modal, Badge } from '@/shared/ui';
import { ROUTES } from '@/shared/constants';

const typeLabels: Record<SearchResult['type'], string> = {
  article: 'Articulo',
  universe: 'Universo',
  character: 'Personaje',
  theory: 'Teoria',
};

const typeUrls: Record<SearchResult['type'], (slug: string) => string> = {
  article: (slug: string) => ROUTES.ARTICLE_DETAIL(slug),
  universe: (slug: string) => ROUTES.UNIVERSE_DETAIL(slug),
  character: (slug: string) => ROUTES.CHARACTER_DETAIL(slug),
  theory: (slug: string) => `/teorias/${slug}`,
};

interface CommandSearchProps {
  className?: string;
}

export function CommandSearch({ className = '' }: CommandSearchProps) {
  const { query, results, loading, isOpen, open, close, handleQueryChange } = useSearch();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);

    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [open]);

  return (
    <>
      <div className={`relative ${className}`}>
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-geek-text-secondary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5 21 21" />
        </svg>
        <input
          type="text"
          readOnly
          onClick={open}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              open();
            }
          }}
          placeholder="Buscar en NexoGeek..."
          data-search-ready={hydrated ? 'true' : 'false'}
          className="h-11 w-full cursor-pointer rounded-lg border border-geek-border/80 bg-geek-dark-secondary/70 px-12 pr-20 text-sm text-geek-text placeholder:text-geek-text-secondary shadow-inner shadow-black/20 outline-none transition-colors hover:border-geek-accent/70 focus-visible:border-geek-accent focus-visible:ring-2 focus-visible:ring-geek-accent/25"
          aria-label="Buscar en NexoGeek"
          aria-haspopup="dialog"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded-md border border-geek-border bg-geek-dark-tertiary px-2 py-0.5 font-mono text-xs text-geek-text-secondary sm:inline-flex">
          Ctrl K
        </kbd>
      </div>

      <Modal isOpen={isOpen} onClose={close} size="lg">
        <div className="relative">
          <div className="flex items-center gap-3 px-1">
            <svg
              className="h-5 w-5 text-geek-text-secondary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5 21 21" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Buscar universos, personajes, articulos..."
              className="flex-1 bg-transparent py-2 text-sm text-geek-text outline-none placeholder:text-geek-text-secondary"
              autoFocus
              aria-label="Buscar en NexoGeek"
            />
            {loading && (
              <div
                className="h-4 w-4 animate-spin rounded-full border-2 border-geek-accent border-t-transparent"
                aria-hidden="true"
              />
            )}
          </div>

          {results.length > 0 && (
            <div className="mt-3 max-h-80 overflow-y-auto">
              {results.map((result, index) => (
                <a
                  key={`${result.type}-${result.slug}-${index}`}
                  href={typeUrls[result.type](result.slug)}
                  onClick={close}
                  className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-geek-dark-tertiary"
                >
                  {result.imageUrl && (
                    <img
                      src={result.imageUrl}
                      alt=""
                      className="h-10 w-10 flex-shrink-0 rounded object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-geek-text">{result.title}</span>
                      <Badge size="sm">{typeLabels[result.type]}</Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-geek-text-secondary">{result.description}</p>
                  </div>
                </a>
              ))}
            </div>
          )}

          {query && !loading && results.length === 0 && (
            <div className="py-8 text-center text-sm text-geek-text-secondary">
              No se encontraron resultados para "{query}"
            </div>
          )}

          {!query && (
            <div className="py-4 text-sm text-geek-text-secondary">
              Escribe para buscar en todo NexoGeek
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
