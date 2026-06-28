import { Badge, SkeletonLine, Avatar } from '@/shared/ui';
import { formatDate } from '@/shared/lib';
import type { Article } from '@/entities/article';

interface ArticleReaderProps {
  article: Article | null;
  loading?: boolean;
}

export function ArticleReader({ article, loading }: ArticleReaderProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton rounded w-3/4 h-8" />
        <div className="flex gap-3">
          <div className="skeleton rounded-full w-8 h-8" />
          <div className="skeleton rounded w-32 h-4" />
        </div>
        <div className="skeleton rounded-lg w-full h-64" />
        <SkeletonLine count={5} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-16 rounded-xl bg-geek-dark-secondary border border-geek-border">
        <div className="text-4xl mb-4">📄</div>
        <p className="text-geek-text-secondary text-lg">Artículo no disponible</p>
        <p className="text-geek-text-secondary/50 text-sm mt-1">El artículo que buscas no existe o fue eliminado</p>
      </div>
    );
  }

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-geek-text font-heading leading-tight">
          {article.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-geek-text-secondary">
          {article.author && (
            <div className="flex items-center gap-2">
              <Avatar src={article.author.avatarUrl} alt={article.author.displayName} size="sm" />
              <span>{article.author.displayName}</span>
            </div>
          )}
          <span>·</span>
          <time dateTime={article.publishedAt || article.createdAt}>
            {formatDate(article.publishedAt || article.createdAt)}
          </time>
          <span>·</span>
          <span>{article.views} vistas</span>
        </div>
        {article.categories && article.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {article.categories.map((cat) => (
              <a key={cat.id} href={`/categorias/${cat.slug}`}>
                <Badge variant="info">{cat.name}</Badge>
              </a>
            ))}
          </div>
        )}
      </header>

      {article.coverImage && (
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full rounded-xl object-cover max-h-96 mb-8"
        />
      )}

      <div className="prose prose-invert max-w-none text-geek-text leading-relaxed" dangerouslySetInnerHTML={{ __html: article.content }} />
    </article>
  );
}
