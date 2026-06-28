import { memo, useEffect, useMemo, useState } from 'react';
import { formatCompact } from '@/shared/lib';
import {
  EXPLORE_CATEGORIES,
  FALLBACK_UNIVERSES,
  getUniverseTotals,
  normalizeUniverseForShowcase,
  type ExploreCategory,
  type ShowcaseUniverse,
} from '@/shared/constants';
import { ROUTES } from '@/shared/constants';

interface UniverseBrowserProps {
  universes: unknown[];
  loading?: boolean;
}

const sortOptions = [
  { value: 'activity', label: 'Actividad' },
  { value: 'articles', label: 'Articulos' },
  { value: 'characters', label: 'Personajes' },
  { value: 'name', label: 'Nombre' },
] as const;

type SortKey = (typeof sortOptions)[number]['value'];

const statusStyles: Record<ShowcaseUniverse['status'], string> = {
  Activo: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  Destacado: 'border-geek-accent/40 bg-geek-accent/15 text-violet-100',
  Nuevo: 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100',
};

function getCategoryLabel(category: ExploreCategory): string {
  return EXPLORE_CATEGORIES.find((item) => item.value === category)?.label || 'Todos';
}

function sortUniverses(items: ShowcaseUniverse[], sortBy: SortKey): ShowcaseUniverse[] {
  const sorted = [...items];

  if (sortBy === 'articles') return sorted.sort((a, b) => b.articleCount - a.articleCount);
  if (sortBy === 'characters') return sorted.sort((a, b) => b.characterCount - a.characterCount);
  if (sortBy === 'name') return sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'));

  return sorted.sort((a, b) => {
    const featuredWeight = Number(b.status === 'Destacado') - Number(a.status === 'Destacado');
    if (featuredWeight !== 0) return featuredWeight;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

export const UniverseBrowser = memo(function UniverseBrowser({ universes, loading }: UniverseBrowserProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ExploreCategory>('todos');
  const [sortBy, setSortBy] = useState<SortKey>('activity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const sourceUniverses = useMemo(() => {
    const normalized = universes.map((universe, index) => normalizeUniverseForShowcase(universe, index));
    return normalized.length > 0 ? normalized : FALLBACK_UNIVERSES;
  }, [universes]);

  const filteredUniverses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = sourceUniverses.filter((universe) => {
      const matchesCategory = category === 'todos' || universe.category === category;
      const matchesQuery =
        !normalizedQuery ||
        universe.name.toLowerCase().includes(normalizedQuery) ||
        universe.description.toLowerCase().includes(normalizedQuery) ||
        universe.status.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });

    return sortUniverses(filtered, sortBy);
  }, [sourceUniverses, category, query, sortBy]);

  const totals = useMemo(() => getUniverseTotals(sourceUniverses), [sourceUniverses]);
  const categoryStats = useMemo(
    () =>
      EXPLORE_CATEGORIES.filter((item) => item.value !== 'todos').map((item) => ({
        ...item,
        count: sourceUniverses.filter((universe) => universe.category === item.value).length,
      })),
    [sourceUniverses]
  );

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-lg border border-geek-border bg-geek-dark-secondary" />
          ))}
        </div>
        <div className="hidden h-80 animate-pulse rounded-lg border border-geek-border bg-geek-dark-secondary lg:block" />
      </div>
    );
  }

  return (
    <section className="space-y-6" aria-label="Explorador de universos">
      <div className="rounded-lg border border-geek-border bg-geek-dark-secondary/70 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-geek-text-secondary"
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
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filtrar universos..."
              data-universe-browser-ready={hydrated ? 'true' : 'false'}
              className="h-11 w-full rounded-lg border border-geek-border bg-geek-dark px-10 text-sm text-geek-text outline-none transition-colors placeholder:text-geek-text-secondary focus:border-geek-accent focus:ring-2 focus:ring-geek-accent/25"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortKey)}
              className="h-11 rounded-lg border border-geek-border bg-geek-dark px-3 text-sm text-geek-text outline-none transition-colors focus:border-geek-accent"
              aria-label="Ordenar universos"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="inline-grid h-11 grid-cols-2 rounded-lg border border-geek-border bg-geek-dark p-1" role="group" aria-label="Modo de vista">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`grid h-9 w-10 place-items-center rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-geek-accent text-white' : 'text-geek-text-secondary hover:text-geek-text'
                }`}
                aria-label="Vista en cuadricula"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`grid h-9 w-10 place-items-center rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-geek-accent text-white' : 'text-geek-text-secondary hover:text-geek-text'
                }`}
                aria-label="Vista en lista"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="list" aria-label="Categorias">
          {EXPLORE_CATEGORIES.map((item) => {
            const active = item.value === category;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                className={`h-9 flex-shrink-0 rounded-lg border px-3 text-sm font-medium transition-colors ${
                  active
                    ? 'border-geek-accent bg-geek-accent text-white'
                    : 'border-geek-border bg-geek-dark text-geek-text-secondary hover:border-geek-accent/60 hover:text-geek-text'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-geek-text">Catalogo de universos</h2>
              <p className="text-sm text-geek-text-secondary">
                {filteredUniverses.length} de {sourceUniverses.length} universos
                {category !== 'todos' ? ` en ${getCategoryLabel(category)}` : ''}
              </p>
            </div>
            {(query || category !== 'todos') && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCategory('todos');
                }}
                className="text-sm font-medium text-geek-accent transition-colors hover:text-geek-accent-secondary"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {filteredUniverses.length === 0 ? (
            <div className="rounded-lg border border-geek-border bg-geek-dark-secondary/70 px-6 py-16 text-center">
              <h3 className="text-lg font-bold text-geek-text">No hay coincidencias</h3>
              <p className="mt-2 text-sm text-geek-text-secondary">Ajusta la busqueda o cambia de categoria.</p>
            </div>
          ) : (
            <div
              data-testid="universe-results"
              className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3' : 'grid grid-cols-1 gap-3'}
            >
              {filteredUniverses.map((universe) =>
                viewMode === 'grid' ? (
                  <UniverseCard key={universe.id} universe={universe} />
                ) : (
                  <UniverseRow key={universe.id} universe={universe} />
                )
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-geek-border bg-geek-dark-secondary/70 p-4">
            <h2 className="text-base font-bold text-geek-text">Mapa del catalogo</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="Universos" value={sourceUniverses.length.toString()} />
              <MiniStat label="Articulos" value={formatCompact(totals.articles)} />
              <MiniStat label="Personajes" value={formatCompact(totals.characters)} />
            </div>
            <div className="mt-4 space-y-3">
              {categoryStats.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  className="flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-geek-border hover:bg-geek-dark"
                >
                  <span>
                    <span className="block text-sm font-medium text-geek-text">{item.label}</span>
                    <span className="text-xs text-geek-text-secondary">{item.description}</span>
                  </span>
                  <span className="rounded-md bg-geek-accent/10 px-2 py-1 text-xs font-semibold text-geek-accent">
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-geek-border bg-geek-dark-secondary/70 p-4">
            <h2 className="text-base font-bold text-geek-text">Radar editorial</h2>
            <div className="mt-4 space-y-3">
              {sourceUniverses.slice(0, 4).map((universe, index) => (
                <a key={universe.id} href={ROUTES.UNIVERSE_DETAIL(universe.slug)} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-geek-dark">
                  <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-geek-accent/10 text-xs font-bold text-geek-accent">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-geek-text">{universe.name}</span>
                    <span className="text-xs text-geek-text-secondary">{universe.momentum}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>

          <a
            href={ROUTES.CREATE_ARTICLE}
            className="block rounded-lg border border-geek-accent/30 bg-geek-accent/10 p-4 transition-colors hover:border-geek-accent/60 hover:bg-geek-accent/15"
          >
            <span className="text-base font-bold text-geek-text">Publica una guia</span>
            <span className="mt-1 block text-sm text-geek-text-secondary">Conecta personajes, eventos y teorias de tu universo favorito.</span>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-geek-accent">
              Crear articulo
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </a>
        </aside>
      </div>
    </section>
  );
});

function UniverseCard({ universe }: { universe: ShowcaseUniverse }) {
  return (
    <a
      href={ROUTES.UNIVERSE_DETAIL(universe.slug)}
      className="group overflow-hidden rounded-lg border border-geek-border bg-geek-dark-secondary transition-colors hover:border-geek-accent/60 focus-visible:ring-2 focus-visible:ring-geek-accent"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={universe.coverImage}
          alt={universe.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-geek-dark-secondary via-geek-dark-secondary/35 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${statusStyles[universe.status]}`}>
            {universe.status}
          </span>
          <span className="rounded-md border border-geek-border bg-geek-dark/70 px-2 py-1 text-xs font-medium text-geek-text">
            {getCategoryLabel(universe.category)}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white">{universe.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-geek-text-secondary">{universe.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-geek-border">
        <CardStat label="Articulos" value={formatCompact(universe.articleCount)} />
        <CardStat label="Personajes" value={formatCompact(universe.characterCount)} />
        <CardStat label="Editores" value={universe.editors.toString()} />
      </div>
    </a>
  );
}

function UniverseRow({ universe }: { universe: ShowcaseUniverse }) {
  return (
    <a
      href={ROUTES.UNIVERSE_DETAIL(universe.slug)}
      className="group grid grid-cols-[88px_minmax(0,1fr)] gap-4 rounded-lg border border-geek-border bg-geek-dark-secondary p-3 transition-colors hover:border-geek-accent/60 sm:grid-cols-[112px_minmax(0,1fr)_auto]"
    >
      <img src={universe.coverImage} alt={universe.name} className="h-20 w-full rounded-md object-cover sm:h-24" loading="lazy" />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-bold text-geek-text group-hover:text-geek-accent">{universe.name}</span>
          <span className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${statusStyles[universe.status]}`}>{universe.status}</span>
        </span>
        <span className="mt-1 block line-clamp-2 text-sm text-geek-text-secondary">{universe.description}</span>
        <span className="mt-3 flex flex-wrap gap-3 text-xs text-geek-text-secondary">
          <span>{formatCompact(universe.articleCount)} articulos</span>
          <span>{formatCompact(universe.characterCount)} personajes</span>
          <span>{universe.momentum}</span>
        </span>
      </span>
      <span className="hidden self-center rounded-lg border border-geek-border px-3 py-2 text-sm font-semibold text-geek-accent transition-colors group-hover:border-geek-accent/60 sm:block">
        Abrir
      </span>
    </a>
  );
}

function CardStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="border-r border-geek-border px-3 py-3 last:border-r-0">
      <span className="block text-sm font-bold text-geek-text">{value}</span>
      <span className="block text-[11px] uppercase tracking-wide text-geek-text-secondary">{label}</span>
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-geek-border bg-geek-dark p-3">
      <span className="block text-lg font-bold text-geek-text">{value}</span>
      <span className="block text-[11px] uppercase tracking-wide text-geek-text-secondary">{label}</span>
    </span>
  );
}
