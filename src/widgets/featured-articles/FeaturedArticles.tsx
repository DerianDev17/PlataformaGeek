import { memo, useMemo, useState } from 'react';
import { ROUTES, getArticleShowcaseImage } from '@/shared/constants';
import { Skeleton } from '@/shared/ui';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  views: number;
  universe?: { name: string; slug: string };
  author?: { username: string; avatarUrl: string | null };
  createdAt: string;
}

interface FeaturedArticlesProps {
  articles: ArticleItem[];
  loading?: boolean;
}

type TabId = 'popular' | 'recent' | 'trending' | 'new';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'popular', label: 'Popular' },
  { id: 'recent', label: 'Recientes' },
  { id: 'trending', label: 'En tendencia' },
  { id: 'new', label: 'Nuevos' },
];

const labels = [
  { text: 'Popular', className: 'bg-geek-accent-hover text-white' },
  { text: 'Nuevo', className: 'bg-emerald-700 text-white' },
  { text: 'Actualizado', className: 'bg-blue-600 text-white' },
  { text: 'Especial', className: 'bg-geek-dark-tertiary text-geek-text' },
];

function MetricIcon({ type }: { type: 'views' | 'comments' }) {
  const common = {
    className: 'h-4 w-4',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (type === 'views') {
    return <svg {...common}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="3" /></svg>;
  }

  return <svg {...common}><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.6-5A8 8 0 1 1 21 12Z" /></svg>;
}

function ArticleCard({ article, index }: { article: ArticleItem; index: number }) {
  const image = getArticleShowcaseImage(article.title, article.coverImage, index);
  const label = labels[index % labels.length];
  const comments = Math.max(48, Math.round((article.views || 0) / 95));

  return (
    <a
      href={ROUTES.ARTICLE_DETAIL(article.slug)}
      className="group block overflow-hidden rounded-lg border border-geek-border bg-geek-dark-secondary transition-colors hover:border-geek-accent/70 focus-visible:ring-2 focus-visible:ring-geek-accent"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={image}
          alt={`Portada de ${article.title}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A12]/88 via-transparent to-black/10" aria-hidden="true" />
        <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold ${label.className}`}>
          {label.text}
        </span>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 font-heading text-lg font-bold text-white transition-colors group-hover:text-geek-accent-secondary">
          {article.title}
        </h3>
        <p className="mt-1 text-sm text-geek-text-secondary">{article.universe?.name || 'Especial'}</p>
        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-geek-text-secondary/90">
          {article.summary}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-geek-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <MetricIcon type="views" />
            {(article.views || 0).toLocaleString('es-ES')} vistas
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MetricIcon type="comments" />
            {comments}
          </span>
        </div>
      </div>
    </a>
  );
}

export const FeaturedArticles = memo(function FeaturedArticles({ articles, loading }: FeaturedArticlesProps) {
  const [activeTab, setActiveTab] = useState<TabId>('popular');

  const visibleArticles = useMemo(() => {
    const sorted = [...articles];
    switch (activeTab) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'trending':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'new':
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return sorted
          .filter((article) => new Date(article.createdAt).getTime() >= sevenDaysAgo)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'popular':
      default:
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
  }, [articles, activeTab]);

  if (loading) {
    return (
      <section className="mb-7">
        <SectionHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[320px] rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="mb-7">
        <SectionHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="rounded-lg border border-geek-border bg-geek-dark-secondary p-10 text-center">
          <p className="text-sm text-geek-text-secondary">No hay articulos destacados todavia.</p>
          <a href={ROUTES.CREATE_ARTICLE} className="mt-3 inline-flex text-sm font-semibold text-geek-accent hover:text-geek-accent-secondary">
            Crear primer articulo
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-7">
      <SectionHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {visibleArticles.slice(0, 4).map((article, index) => (
          <ArticleCard key={article.id} article={article} index={index} />
        ))}
      </div>
    </section>
  );
});

function SectionHeader({ activeTab, onTabChange }: { activeTab: TabId; onTabChange: (id: TabId) => void }) {
  return (
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-xl font-bold text-white">Articulos destacados</h2>
        <div role="tablist" aria-label="Filtros de articulos" className="flex rounded-full border border-geek-border bg-geek-dark-secondary p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-geek-accent focus-visible:ring-offset-2 focus-visible:ring-offset-geek-dark ${
                  isActive ? 'bg-geek-accent/18 text-geek-accent-text' : 'text-geek-text-secondary hover:text-geek-text'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <a href={ROUTES.ARTICLES} className="text-sm font-medium text-geek-accent-text transition-colors hover:text-geek-accent-secondary">
        Ver todos
      </a>
    </div>
  );
}
