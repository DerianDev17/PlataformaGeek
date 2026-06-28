import { memo } from 'react';
import { Card, CardImage, CardTitle, CardDescription, Skeleton } from '@/shared/ui';
import type { Universe } from '@/entities/universe';
import { ROUTES } from '@/shared/constants';

interface UniverseGridProps {
  universes: Universe[];
  loading?: boolean;
}

export const UniverseGrid = memo(function UniverseGrid({ universes, loading }: UniverseGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {universes.length === 0 ? (
        <div className="col-span-full text-center py-12 text-geek-text-secondary">
          <div className="text-3xl mb-3">🌌</div>
          <p className="text-lg">No hay universos disponibles</p>
          <p className="text-sm mt-1">Explora más tarde para descubrir nuevos universos</p>
        </div>
      ) : (
        universes.map((universe) => (
        <a key={universe.id} href={ROUTES.UNIVERSE_DETAIL(universe.slug)}>
          <Card hover>
            {universe.coverImage && (
              <CardImage src={universe.coverImage} alt={universe.name} />
            )}
            <CardTitle>{universe.name}</CardTitle>
            <CardDescription>{universe.description}</CardDescription>
            <div className="flex gap-3 mt-3 text-xs text-geek-text-secondary">
              <span>{universe.articleCount} artículos</span>
              <span>{universe.characterCount} personajes</span>
            </div>
          </Card>
        </a>
      ))
      )}
    </div>
  );
});
