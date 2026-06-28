import { memo } from 'react';
import { Card, Skeleton } from '@/shared/ui';
import { timeAgo } from '@/shared/lib';
import { ROUTES } from '@/shared/constants';

interface Activity {
  id: string;
  type: string;
  title: string;
  slug: string;
  username: string;
  timestamp: string;
}

interface TrendingSidebarProps {
  activities?: Activity[];
  loading?: boolean;
}

export const TrendingSidebar = memo(function TrendingSidebar({ activities = [], loading }: TrendingSidebarProps) {
  return (
    <aside className="space-y-6">
      <Card>
        <h3 className="text-sm font-semibold text-geek-text-secondary uppercase tracking-wider mb-3">
          Actividad reciente
        </h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-full h-3" />
                  <Skeleton className="w-1/2 h-3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-geek-text-secondary">Sin actividad reciente</p>
        ) : (
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li key={activity.id} className="flex gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-geek-accent mt-2 flex-shrink-0" />
                <div>
                  <a
                    href={ROUTES.ARTICLE_DETAIL(activity.slug)}
                    className="text-geek-text hover:text-geek-accent transition-colors line-clamp-1"
                  >
                    {activity.title}
                  </a>
                  <p className="text-xs text-geek-text-secondary">
                    {activity.username} · {timeAgo(activity.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-geek-text-secondary uppercase tracking-wider mb-3">
          Contribuye
        </h3>
        <p className="text-sm text-geek-text-secondary mb-3">
          ¿Eres experto en algún universo? Comparte tu conocimiento con la comunidad.
        </p>
        <a
          href={ROUTES.CREATE_ARTICLE}
          className="text-sm text-geek-accent hover:text-geek-accent-hover font-medium"
        >
          Crear artículo →
        </a>
      </Card>
    </aside>
  );
});
