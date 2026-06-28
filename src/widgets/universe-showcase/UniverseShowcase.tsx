import { memo } from 'react';
import { ROUTES, getUniverseShowcaseImage } from '@/shared/constants';
import { Skeleton } from '@/shared/ui';

interface UniverseItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
  articleCount: number;
  characterCount: number;
  theoryCount?: number;
}

interface UniverseShowcaseProps {
  universes: UniverseItem[];
  loading?: boolean;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const UniverseCard = memo(function UniverseCard({ universe }: { universe: UniverseItem }) {
  const image = getUniverseShowcaseImage(universe.name, universe.coverImage);

  return (
    <a
      href={ROUTES.UNIVERSE_DETAIL(universe.slug)}
      className="group relative block min-h-[150px] overflow-hidden rounded-lg border border-geek-border bg-geek-dark-secondary focus-visible:ring-2 focus-visible:ring-geek-accent"
    >
      <img
        src={image}
        alt={`Universo ${universe.name}`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080A12] via-[#080A12]/40 to-transparent" aria-hidden="true" />
      <div className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-md border border-white/15 bg-geek-dark/60 text-[11px] font-bold text-geek-accent-secondary backdrop-blur-sm">
        {initials(universe.name)}
      </div>
      <div className="relative z-10 flex min-h-[150px] flex-col justify-end p-3">
        <h3 className="line-clamp-1 font-heading text-base font-bold text-white transition-colors group-hover:text-geek-accent-secondary">
          {universe.name}
        </h3>
        <p className="mt-1 text-xs text-geek-text-secondary">
          {universe.articleCount.toLocaleString('es-ES')} articulos
        </p>
      </div>
    </a>
  );
});

export const UniverseShowcase = memo(function UniverseShowcase({ universes, loading }: UniverseShowcaseProps) {
  if (loading) {
    return (
      <section className="mb-7">
        <SectionHeader />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[150px] rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (universes.length === 0) {
    return (
      <section className="mb-7">
        <SectionHeader />
        <div className="rounded-lg border border-geek-border bg-geek-dark-secondary p-8 text-center text-sm text-geek-text-secondary">
          No hay universos disponibles.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-7">
      <SectionHeader />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {universes.slice(0, 6).map((universe) => (
          <UniverseCard key={universe.id} universe={universe} />
        ))}
      </div>
    </section>
  );
});

function SectionHeader() {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 className="font-heading text-xl font-bold text-white">Explora por universos</h2>
      <a href={ROUTES.UNIVERSES} className="text-sm font-medium text-geek-accent-text transition-colors hover:text-geek-accent-secondary">
        Ver todos
      </a>
    </div>
  );
}
