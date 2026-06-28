import { useState, useEffect, useRef, type ReactNode } from 'react';

interface StatCardProps {
  value: number;
  label: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

function AnimatedCounter({
  end,
  reducedMotion,
  triggered,
}: {
  end: number;
  reducedMotion: boolean;
  triggered: boolean;
}) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!triggered) return;
    if (reducedMotion) {
      setCount(end);
      return;
    }

    const startTime = performance.now();
    const duration = 2000;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, triggered, reducedMotion]);

  return <>{count.toLocaleString('es-ES')}</>;
}

const trendConfig = {
  up: { arrow: '↑', color: 'text-geek-success' },
  down: { arrow: '↓', color: 'text-geek-danger' },
  neutral: { arrow: '→', color: 'text-geek-text-secondary' },
};

export function StatCard({
  value,
  label,
  icon,
  trend = 'neutral',
  trendValue,
  className = '',
}: StatCardProps) {
  const [triggered, setTriggered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || triggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggered]);

  const { arrow, color } = trendConfig[trend];

  const fullLabel = [
    value.toLocaleString('es-ES'),
    label,
    trendValue ? `tendencia ${trend === 'up' ? '+' : ''}${trendValue}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-xl bg-geek-dark-secondary border border-geek-border p-5 group hover:border-geek-accent/50 hover:scale-[1.02] transition-all duration-300 ${className}`}
      aria-label={fullLabel}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-geek-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        {icon && (
          <div className="text-2xl mb-2" aria-hidden="true">
            {icon}
          </div>
        )}

        <div className="text-2xl font-bold text-geek-text font-mono tabular-nums">
          <AnimatedCounter end={value} reducedMotion={reducedMotion} triggered={triggered} />
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-geek-text-secondary font-medium uppercase tracking-wider">
            {label}
          </span>
          {trendValue && (
            <span className={`text-xs font-mono font-medium ${color}`}>
              {arrow} {trendValue}
            </span>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-geek-accent/0 via-geek-accent/40 to-geek-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}
