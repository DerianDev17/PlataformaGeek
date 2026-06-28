import { forwardRef, useRef, useState, useEffect, useCallback, type ReactNode } from 'react';

type CardVariant = 'default' | 'featured' | 'compact';

interface InteractiveCardProps {
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  href?: string;
}

const variantBases: Record<CardVariant, string> = {
  default: 'border-geek-border p-5',
  featured: 'border-transparent p-5',
  compact: 'border-geek-border p-4',
};

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>): (node: T | null) => void {
  return (node) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    });
  };
}

export const InteractiveCard = forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ variant = 'default', className = '', children, onClick, href }, ref) => {
    const cardRef = useRef<HTMLDivElement | HTMLAnchorElement | null>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const reducedMotion = useRef(false);

    useEffect(() => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotion.current = mq.matches;
      const handler = (e: MediaQueryListEvent) => {
        reducedMotion.current = e.matches;
        if (e.matches) {
          setTilt({ x: 0, y: 0 });
        }
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (reducedMotion.current) return;
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: y * -10, y: x * 10 });
      },
      []
    );

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
      setTilt({ x: 0, y: 0 });
    }, []);

    const baseClasses = [
      'relative rounded-xl bg-geek-dark-secondary overflow-hidden transition-all duration-300',
      'focus-visible:ring-2 focus-visible:ring-geek-accent focus-visible:ring-offset-2 focus-visible:ring-offset-geek-dark',
      variant === 'featured'
        ? 'before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-gradient-to-br before:from-geek-accent before:to-geek-accent-secondary before:-z-10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300'
        : '',
      variantBases[variant],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const Component = href ? 'a' : 'div';

    return (
      <Component
        ref={mergeRefs(cardRef, ref)}
        href={href}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setIsHovered(true)}
        onBlur={() => {
          setIsHovered(false);
          setTilt({ x: 0, y: 0 });
        }}
        className={baseClasses}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.02 : 1})`,
          boxShadow:
            isHovered && variant !== 'compact'
              ? '0 20px 40px -12px rgba(99,102,241,0.25), 0 0 0 1px rgba(99,102,241,0.2)'
              : '0 4px 12px rgba(0,0,0,0.1)',
          transition: reducedMotion.current ? 'none' : undefined,
        }}
        role={onClick && !href ? 'button' : undefined}
        tabIndex={onClick && !href ? 0 : undefined}
        onKeyDown={
          onClick && !href
            ? (e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        {children}
      </Component>
    );
  }
);

InteractiveCard.displayName = 'InteractiveCard';
