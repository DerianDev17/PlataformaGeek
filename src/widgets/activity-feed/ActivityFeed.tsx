import { memo, type ReactNode } from 'react';
import { Avatar } from '@/shared/ui';
import { FALLBACK_HOME_DATA, ROUTES } from '@/shared/constants';
import { timeAgo } from '@/shared/lib';

interface HomeData {
  stats: { universes: number; articles: number; characters: number; users: number; theories: number };
  featuredUniverses: any[];
  trendingArticles: any[];
  recentArticles: any[];
  topContributors: any[];
}

const events = [
  { day: '12', month: 'JUL', title: 'Convencion Geek Quito 2026', meta: 'Centro de Convenciones', tag: 'Convencion', color: 'bg-geek-accent-hover' },
  { day: '20', month: 'JUL', title: 'Torneo de Smash Ultimate', meta: 'Gaming House - 16:00', tag: 'Torneo', color: 'bg-blue-600' },
  { day: '08', month: 'AGO', title: 'Charla: Diseno de Personajes', meta: 'Virtual - 18:00', tag: 'Charla', color: 'bg-cyan-700' },
];

const trends = ['OnePiece', 'Marvel', 'EldenRing', 'StarWars', 'Dune2', 'Batman', 'GenshinImpact', 'DragonBall'];

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-geek-border bg-geek-dark-secondary/75 p-4 shadow-xl shadow-black/10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-heading text-base font-bold text-white">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-xs font-medium text-geek-accent-text transition-colors hover:text-geek-accent-secondary">
      {children}
    </a>
  );
}

function ActivityIcon({ index }: { index: number }) {
  const icons = [
    <path key="edit" d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />,
    <path key="plus" d="M12 5v14M5 12h14" />,
    <path key="comment" d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.6-5A8 8 0 1 1 21 12Z" />,
    <path key="image" d="M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5" />,
  ];

  return (
    <svg className="h-4 w-4 text-geek-accent-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[index % icons.length]}
    </svg>
  );
}

interface ActivityFeedProps {
  data?: HomeData | null;
}

export const ActivityFeed = memo(function ActivityFeed({ data }: ActivityFeedProps) {
  const viewData = data || FALLBACK_HOME_DATA;
  const recentArticles = viewData.recentArticles?.length ? viewData.recentArticles : FALLBACK_HOME_DATA.recentArticles;
  const contributors = viewData.topContributors?.length ? viewData.topContributors : FALLBACK_HOME_DATA.topContributors;

  return (
    <aside className="space-y-4 xl:sticky xl:top-24">
      <Panel title="Actividad reciente" action={<ActionLink href={ROUTES.ARTICLES}>Ver todo</ActionLink>}>
        <div className="space-y-4">
          {recentArticles.slice(0, 4).map((article: any, index: number) => (
            <a key={article.id} href={ROUTES.ARTICLE_DETAIL(article.slug)} className="flex items-start gap-3 rounded-lg transition-colors hover:bg-geek-dark-tertiary/60">
              <Avatar src={article.author?.avatarUrl || null} alt={article.author?.username || 'Usuario'} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-white">
                  {article.author?.username || 'Usuario'} <span className="font-normal text-geek-text-secondary">edito</span> {article.title}
                </span>
                <span className="mt-0.5 block text-xs text-geek-text-secondary">{timeAgo(article.createdAt)}</span>
              </span>
              <ActivityIcon index={index} />
            </a>
          ))}
        </div>
      </Panel>

      <Panel title="Eventos proximos" action={<ActionLink href="/eventos">Ver calendario</ActionLink>}>
        <div className="space-y-3">
          {events.map((event) => (
            <a key={`${event.day}-${event.title}`} href="/eventos" className="flex items-center gap-3 rounded-lg transition-colors hover:bg-geek-dark-tertiary/60">
              <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-lg border border-geek-border bg-geek-dark text-center font-mono">
                <span className="block text-lg font-bold leading-none text-white">{event.day}</span>
                <span className="block text-[11px] text-geek-text-secondary">{event.month}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{event.title}</span>
                <span className="block truncate text-xs text-geek-text-secondary">{event.meta}</span>
              </span>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold text-white ${event.color}`}>{event.tag}</span>
            </a>
          ))}
        </div>
      </Panel>

      <Panel title="Top colaboradores" action={<ActionLink href={ROUTES.RANKING}>Ver ranking</ActionLink>}>
        <div className="space-y-3">
          {contributors.slice(0, 5).map((user: any, index: number) => (
            <a key={user.id} href={ROUTES.PROFILE(user.username)} className="grid grid-cols-[24px_1fr_auto] items-center gap-3 rounded-lg transition-colors hover:bg-geek-dark-tertiary/60">
              <span className="font-mono text-sm text-geek-text-secondary">{index + 1}.</span>
              <span className="flex min-w-0 items-center gap-3">
                <Avatar src={user.avatarUrl || null} alt={user.displayName || user.username} size="sm" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-white">{user.displayName || user.username}</span>
                  <span className="block text-xs text-geek-text-secondary">Nivel {user.level}</span>
                </span>
              </span>
              <span className="font-mono text-xs text-geek-accent-text">{Number(user.xp || 0).toLocaleString('es-ES')} XP</span>
            </a>
          ))}
        </div>
      </Panel>

      <Panel title="Tendencias">
        <div className="flex flex-wrap gap-2">
          {trends.map((trend) => (
            <a
              key={trend}
              href={`${ROUTES.SEARCH}?q=${encodeURIComponent(trend)}`}
              className="rounded-md border border-geek-border bg-geek-dark-tertiary px-2.5 py-1 text-xs font-medium text-geek-accent-text transition-colors hover:border-geek-accent/60"
            >
              #{trend}
            </a>
          ))}
        </div>
      </Panel>
    </aside>
  );
});
