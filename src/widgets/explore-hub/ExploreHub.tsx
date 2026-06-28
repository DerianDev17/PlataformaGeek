import { memo, useEffect, useMemo, useState } from 'react';
import {
  EXPLORE_CATEGORIES,
  EXPLORE_COLLECTIONS,
  EXPLORE_ITEMS,
  EXPLORE_TRENDS,
  FALLBACK_UNIVERSES,
  normalizeUniverseForShowcase,
  type ExploreCategory,
  type ExploreItem,
  type ShowcaseUniverse,
} from '@/shared/constants';
import { ROUTES } from '@/shared/constants';

interface ExploreHubProps {
  universes?: unknown[];
  initialQuery?: string;
  initialCategory?: string;
  title?: string;
  kicker?: string;
  description?: string;
}

function isCategory(value: string | undefined): value is ExploreCategory {
  return Boolean(value && EXPLORE_CATEGORIES.some((category) => category.value === value));
}

function getCategoryLabel(category: ExploreCategory): string {
  return EXPLORE_CATEGORIES.find((item) => item.value === category)?.label || 'Todos';
}

function formatCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return value.toString();
}

function buildUniverseItems(universes: ShowcaseUniverse[]): ExploreItem[] {
  return universes.map((universe) => ({
    id: `universe-${universe.id}`,
    type: 'Universo',
    title: universe.name,
    eyebrow: getCategoryLabel(universe.category),
    summary: universe.description,
    href: ROUTES.UNIVERSE_DETAIL(universe.slug),
    image: universe.coverImage,
    category: universe.category,
    metric: `${formatCompact(universe.articleCount)} articulos`,
    tag: universe.status,
  }));
}

export const ExploreHub = memo(function ExploreHub({
  universes = [],
  initialQuery = '',
  initialCategory,
  title = 'Explorar',
  kicker = 'Descubrimiento',
  description = 'Encuentra universos, guias, articulos y rutas editoriales sin salir del tablero principal de NexoGeek.',
}: ExploreHubProps) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<ExploreCategory>(isCategory(initialCategory) ? initialCategory : 'todos');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryParam = initialQuery || params.get('q') || '';
    const categoryParam = initialCategory || params.get('categoria') || '';

    setQuery(queryParam);
    if (isCategory(categoryParam)) setCategory(categoryParam);
  }, [initialQuery, initialCategory]);

  const normalizedUniverses = useMemo(() => {
    const normalized = universes.map((universe, index) => normalizeUniverseForShowcase(universe, index));
    return normalized.length > 0 ? normalized : FALLBACK_UNIVERSES;
  }, [universes]);

  const allItems = useMemo(() => [...EXPLORE_ITEMS, ...buildUniverseItems(normalizedUniverses)], [normalizedUniverses]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return allItems.filter((item) => {
      const matchesCategory = category === 'todos' || item.category === category;
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.summary.toLowerCase().includes(normalizedQuery) ||
        item.eyebrow.toLowerCase().includes(normalizedQuery) ||
        item.tag.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [allItems, category, query]);

  const featured = normalizedUniverses[0];
  const categoryCounts = EXPLORE_CATEGORIES.filter((item) => item.value !== 'todos').map((item) => ({
    ...item,
    count: allItems.filter((content) => content.category === item.value).length,
  }));

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-lg border border-geek-border bg-geek-dark-secondary">
        <img src={featured.bannerImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-geek-dark via-geek-dark/86 to-geek-dark/50" aria-hidden="true" />
        <div className="relative grid min-h-[340px] gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:p-10">
          <div className="flex max-w-3xl flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-lg border border-geek-accent/30 bg-geek-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-geek-accent">
              {kicker}
            </span>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-geek-text-secondary md:text-lg">
              {description}
            </p>

            <div className="mt-6 max-w-2xl rounded-lg border border-geek-border bg-geek-dark/82 p-2">
              <div className="relative">
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
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar sagas, personajes, guias..."
                  className="h-12 w-full rounded-md border border-transparent bg-geek-dark-secondary px-12 text-sm text-geek-text outline-none transition-colors placeholder:text-geek-text-secondary focus:border-geek-accent"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-geek-text-secondary transition-colors hover:bg-geek-dark-tertiary hover:text-geek-text"
                    aria-label="Limpiar busqueda"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="self-end rounded-lg border border-geek-border bg-geek-dark/78 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-geek-text-secondary">En tendencia</p>
            <h2 className="mt-1 text-xl font-bold text-geek-text">{featured.name}</h2>
            <p className="mt-2 text-sm leading-6 text-geek-text-secondary">{featured.description}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <HeroStat label="Items" value={allItems.length.toString()} />
              <HeroStat label="Universos" value={normalizedUniverses.length.toString()} />
              <HeroStat label="Guias" value={EXPLORE_COLLECTIONS.length.toString()} />
            </div>
          </div>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" aria-label="Filtros de exploracion">
        {EXPLORE_CATEGORIES.map((item) => {
          const active = item.value === category;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={`h-10 flex-shrink-0 rounded-lg border px-4 text-sm font-semibold transition-colors ${
                active
                  ? 'border-geek-accent bg-geek-accent text-white'
                  : 'border-geek-border bg-geek-dark-secondary text-geek-text-secondary hover:border-geek-accent/60 hover:text-geek-text'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0 space-y-8">
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-geek-text">Resultados destacados</h2>
                <p className="text-sm text-geek-text-secondary">
                  {filteredItems.length} resultados{category !== 'todos' ? ` en ${getCategoryLabel(category)}` : ''}
                </p>
              </div>
              {(query || category !== 'todos') && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setCategory('todos');
                  }}
                  className="text-sm font-semibold text-geek-accent transition-colors hover:text-geek-accent-secondary"
                >
                  Reiniciar
                </button>
              )}
            </div>

            {filteredItems.length === 0 ? (
              <div className="rounded-lg border border-geek-border bg-geek-dark-secondary px-6 py-16 text-center">
                <h3 className="text-lg font-bold text-geek-text">Sin resultados</h3>
                <p className="mt-2 text-sm text-geek-text-secondary">Prueba con otro termino o categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {filteredItems.map((item) => (
                  <ExploreCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-geek-text">Colecciones editoriales</h2>
              <a href={ROUTES.UNIVERSES} className="text-sm font-semibold text-geek-accent transition-colors hover:text-geek-accent-secondary">
                Ver universos
              </a>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {EXPLORE_COLLECTIONS.map((collection) => (
                <a
                  key={collection.title}
                  href={collection.href}
                  className="group overflow-hidden rounded-lg border border-geek-border bg-geek-dark-secondary transition-colors hover:border-geek-accent/60"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img src={collection.image} alt={collection.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-geek-dark-secondary to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-md bg-geek-dark/75 px-2 py-1 text-xs font-semibold text-geek-accent">
                      {collection.items}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-geek-text group-hover:text-geek-accent">{collection.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-geek-text-secondary">{collection.summary}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </main>

        <aside className="space-y-4">
          <section className="rounded-lg border border-geek-border bg-geek-dark-secondary/70 p-4">
            <h2 className="text-base font-bold text-geek-text">Categorias</h2>
            <div className="mt-4 space-y-2">
              {categoryCounts.map((item) => (
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
          </section>

          <section className="rounded-lg border border-geek-border bg-geek-dark-secondary/70 p-4">
            <h2 className="text-base font-bold text-geek-text">Tendencias</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {EXPLORE_TRENDS.map((trend) => (
                <a
                  key={trend}
                  href={`${ROUTES.SEARCH}?q=${encodeURIComponent(trend)}`}
                  className="rounded-md border border-geek-border bg-geek-dark px-2.5 py-1.5 text-xs font-medium text-geek-accent transition-colors hover:border-geek-accent/60"
                >
                  #{trend}
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-geek-border bg-geek-dark-secondary/70 p-4">
            <h2 className="text-base font-bold text-geek-text">Rutas rapidas</h2>
            <div className="mt-4 grid gap-2">
              <QuickLink href={ROUTES.UNIVERSES} label="Universos" detail="Catalogo completo" />
              <QuickLink href={ROUTES.ARTICLES} label="Articulos" detail="Lecturas recientes" />
              <QuickLink href={ROUTES.CHARACTERS} label="Personajes" detail="Perfiles y fichas" />
              <QuickLink href={ROUTES.RANKING} label="Ranking" detail="Colaboradores activos" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
});

function ExploreCard({ item }: { item: ExploreItem }) {
  return (
    <a
      href={item.href}
      className="group overflow-hidden rounded-lg border border-geek-border bg-geek-dark-secondary transition-colors hover:border-geek-accent/60 focus-visible:ring-2 focus-visible:ring-geek-accent"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-geek-dark-secondary via-geek-dark-secondary/20 to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-md bg-geek-accent px-2 py-1 text-xs font-bold text-white">{item.tag}</span>
          <span className="rounded-md border border-geek-border bg-geek-dark/75 px-2 py-1 text-xs font-medium text-geek-text">{item.type}</span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-geek-accent">{item.eyebrow}</p>
        <h3 className="mt-1 line-clamp-2 text-lg font-bold text-geek-text group-hover:text-geek-accent">{item.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-geek-text-secondary">{item.summary}</p>
        <div className="mt-4 flex items-center justify-between border-t border-geek-border pt-3 text-xs text-geek-text-secondary">
          <span>{item.metric}</span>
          <span className="font-semibold text-geek-accent">Abrir</span>
        </div>
      </div>
    </a>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-geek-border bg-geek-dark-secondary/80 p-3">
      <span className="block text-lg font-bold text-geek-text">{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-geek-text-secondary">{label}</span>
    </span>
  );
}

function QuickLink({ href, label, detail }: { href: string; label: string; detail: string }) {
  return (
    <a href={href} className="flex items-center justify-between rounded-lg border border-geek-border bg-geek-dark px-3 py-3 transition-colors hover:border-geek-accent/60">
      <span>
        <span className="block text-sm font-semibold text-geek-text">{label}</span>
        <span className="text-xs text-geek-text-secondary">{detail}</span>
      </span>
      <svg className="h-4 w-4 text-geek-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}
