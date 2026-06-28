import { useState, useEffect, useRef, memo } from 'react';

interface StatItem {
  label: string;
  value: number;
  icon: string;
  suffix?: string;
}

interface StatsBannerProps {
  stats: { universes: number; articles: number; characters: number; users: number; theories: number };
}

function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          started.current = true;
          const startTime = performance.now();
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
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString('es-ES')}</span>;
}

const statConfigs: StatItem[] = [
  { label: 'Universos', value: 0, icon: '🌌' },
  { label: 'Artículos', value: 0, icon: '📄' },
  { label: 'Personajes', value: 0, icon: '🦸' },
  { label: 'Usuarios', value: 0, icon: '👥' },
  { label: 'Teorías', value: 0, icon: '💭' },
];

export const StatsBanner = memo(function StatsBanner({ stats }: StatsBannerProps) {
  const items: StatItem[] = [
    { ...statConfigs[0], value: stats.universes },
    { ...statConfigs[1], value: stats.articles },
    { ...statConfigs[2], value: stats.characters },
    { ...statConfigs[3], value: stats.users },
    { ...statConfigs[4], value: stats.theories },
  ];

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
      {items.map((item) => (
        <div
          key={item.label}
          className="relative overflow-hidden rounded-xl bg-geek-dark-secondary border border-geek-border p-4 group hover:border-geek-accent/50 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-geek-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <span className="text-2xl mb-2 block" aria-hidden="true">{item.icon}</span>
            <div className="text-2xl font-bold text-geek-text font-mono tabular-nums" aria-label={`${item.label}: ${item.value.toLocaleString('es-ES')}`}>
              <AnimatedCounter end={item.value} />
              {item.suffix}
            </div>
            <div className="text-xs text-geek-text-secondary mt-1 font-medium uppercase tracking-wider">
              {item.label}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-geek-accent/0 via-geek-accent/40 to-geek-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ))}
    </section>
  );
});
