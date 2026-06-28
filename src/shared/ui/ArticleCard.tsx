import { useState, useRef, useEffect } from 'react';
import { Badge } from './Badge';
import { timeAgo } from '@/shared/lib';

interface ArticleAuthor {
  username: string;
  avatarUrl: string | null;
}

interface ArticleCardData {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  author: ArticleAuthor;
  createdAt: string;
  universe?: { name: string; slug: string };
  readTime?: string;
}

interface ArticleCardProps {
  article: ArticleCardData;
  loading?: boolean;
  className?: string;
}

export function ArticleCard({ article, loading, className = '' }: ArticleCardProps) {
  if (loading) {
    return <ArticleCardSkeleton className={className} />;
  }

  return (
    <a
      href={`/articulos/${article.slug}`}
      className={`group block rounded-xl bg-geek-dark-secondary border border-geek-border overflow-hidden hover:border-geek-accent/50 hover:-translate-y-1 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-geek-accent focus-visible:ring-offset-2 focus-visible:ring-offset-geek-dark ${className}`}
    >
      <ArticleCardImage src={article.coverImage} alt={article.title} />

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {article.universe && (
            <Badge variant="info" size="sm">
              {article.universe.name}
            </Badge>
          )}
          {article.readTime && (
            <span className="text-xs text-geek-text-secondary/60">{article.readTime}</span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-geek-text font-heading group-hover:text-geek-accent transition-colors duration-200 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-sm text-geek-text-secondary mt-2 line-clamp-2">{article.excerpt}</p>

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-geek-border">
          <span className="w-6 h-6 rounded-full bg-geek-accent/20 flex items-center justify-center text-[10px] font-bold text-geek-accent">
            {article.author.username.charAt(0).toUpperCase()}
          </span>
          <span className="text-xs text-geek-text-secondary">{article.author.username}</span>
          <span className="text-xs text-geek-text-secondary/60">{timeAgo(article.createdAt)}</span>
        </div>
      </div>
    </a>
  );
}

function ArticleCardImage({ src, alt }: { src: string | null; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

  if (!src) {
    return (
      <div className="w-full h-44 bg-geek-dark-tertiary flex items-center justify-center">
        <span className="text-2xl" aria-hidden="true">📄</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-44 overflow-hidden bg-geek-dark-tertiary">
      <div className={`absolute inset-0 bg-geek-dark-tertiary animate-pulse transition-opacity duration-500 ${loaded ? 'opacity-0' : 'opacity-100'}`} />
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-44 object-cover transition-all duration-500 group-hover:scale-105 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

function ArticleCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl bg-geek-dark-secondary border border-geek-border overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="w-full h-44 bg-geek-dark-tertiary animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="w-12 h-5 rounded-full bg-geek-dark-tertiary animate-pulse" />
          <div className="w-16 h-5 rounded-full bg-geek-dark-tertiary animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="w-3/4 h-5 rounded bg-geek-dark-tertiary animate-pulse" />
          <div className="w-1/2 h-5 rounded bg-geek-dark-tertiary animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="w-full h-3 rounded bg-geek-dark-tertiary animate-pulse" />
          <div className="w-2/3 h-3 rounded bg-geek-dark-tertiary animate-pulse" />
        </div>
        <div className="flex items-center gap-3 pt-3 border-t border-geek-border">
          <div className="w-6 h-6 rounded-full bg-geek-dark-tertiary animate-pulse" />
          <div className="w-20 h-3 rounded bg-geek-dark-tertiary animate-pulse" />
          <div className="w-16 h-3 rounded bg-geek-dark-tertiary animate-pulse" />
        </div>
      </div>
    </div>
  );
}
