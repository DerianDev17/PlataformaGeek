import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-geek-dark-secondary border border-geek-border p-4 ${
        hover ? 'hover:border-geek-accent hover:bg-geek-dark-tertiary transition-colors cursor-pointer' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  );
}

export function CardImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg mb-3 ${className}`}>
      <img
        src={src}
        alt={alt}
        className="w-full h-40 object-cover"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%23161822" width="400" height="200"/><text fill="%2394A3B8" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">Sin imagen</text></svg>';
        }}
      />
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`text-lg font-semibold text-geek-text font-heading ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-sm text-geek-text-secondary mt-1 line-clamp-2 ${className}`}>{children}</p>;
}
