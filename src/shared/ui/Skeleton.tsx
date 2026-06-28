interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'image';
}

const skeletonVariantClasses: Record<string, string> = {
  avatar: 'rounded-full w-10 h-10',
  image: 'rounded-lg w-full h-40',
  text: 'rounded h-4 w-full',
};

export function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  if (variant === 'card') {
    return (
      <div className="rounded-xl bg-geek-dark-secondary border border-geek-border p-4" aria-hidden="true">
        <div className="skeleton rounded-lg w-full h-40 mb-3" />
        <div className="skeleton rounded w-3/4 h-5 mb-2" />
        <div className="skeleton rounded w-full h-4 mb-1" />
        <div className="skeleton rounded w-2/3 h-4" />
      </div>
    );
  }

  const variantClass = skeletonVariantClasses[variant] || skeletonVariantClasses.text;

  return (
    <div className={`skeleton ${variantClass} ${className}`} aria-hidden="true" />
  );
}

export function SkeletonLine({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Cargando">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={i === count - 1 ? 'w-2/3' : 'w-full'} />
      ))}
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
