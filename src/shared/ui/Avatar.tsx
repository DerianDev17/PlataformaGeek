import { useState } from 'react';

interface AvatarProps {
  src: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export function Avatar({ src, alt, size = 'md', className = '' }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src && !hasError);

  const initials = alt
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const wrapperClasses = `relative inline-block overflow-hidden rounded-full flex-shrink-0 ${sizeClasses[size]} ${className}`;

  return (
    <span className={wrapperClasses} role="img" aria-label={alt}>
      {showImage && (
        <img
          src={src ?? undefined}
          alt=""
          className="absolute inset-0 h-full w-full rounded-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
      <span
        className={`rounded-full bg-geek-accent/20 text-geek-accent flex items-center justify-center font-bold w-full h-full ${
          showImage ? 'invisible' : ''
        }`}
        aria-hidden={showImage}
      >
        {initials || '?'}
      </span>
    </span>
  );
}
