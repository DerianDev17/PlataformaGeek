import { HOME_IMAGES, ROUTES } from '@/shared/constants';
import { formatCompact } from '@/shared/lib';

interface HeroStats {
  universes: number;
  articles: number;
  characters: number;
  users: number;
  theories: number;
}

interface HeroHomeProps {
  stats?: HeroStats;
}

const defaultStats: HeroStats = {
  universes: 280,
  articles: 15000,
  characters: 12000,
  users: 45000,
  theories: 3200,
};

function StatIcon({ type }: { type: 'articles' | 'universes' | 'characters' | 'users' }) {
  const common = {
    className: 'h-5 w-5',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (type === 'articles') {
    return <svg {...common}><path d="M6 3h9l3 3v15H6V3Z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></svg>;
  }

  if (type === 'universes') {
    return <svg {...common}><circle cx="12" cy="12" r="5" /><path d="M3 12c3-5 15-8 18-3" /><path d="M4 15c4 3 13 4 17-2" /></svg>;
  }

  if (type === 'characters') {
    return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></svg>;
  }

  return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.8-4 5-6 8-6s6.2 2 8 6" /></svg>;
}

export function HeroHome({ stats = defaultStats }: HeroHomeProps) {
  const items = [
    { label: 'Articulos', value: stats.articles, type: 'articles' as const },
    { label: 'Universos', value: stats.universes, type: 'universes' as const },
    { label: 'Personajes', value: stats.characters, type: 'characters' as const },
    { label: 'Colaboradores', value: stats.users, type: 'users' as const },
  ];

  return (
    <section className="relative mb-5 min-h-[370px] overflow-hidden rounded-lg border border-geek-border bg-geek-dark-secondary shadow-2xl shadow-black/25">
      <img
        src={HOME_IMAGES.hero}
        alt=""
        width="1200"
        height="630"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        fetchPriority="high"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#080A12] via-[#080A12]/78 to-[#080A12]/18" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080A12]/86 via-transparent to-black/20" aria-hidden="true" />

      <div className="relative z-10 flex min-h-[370px] max-w-2xl flex-col justify-center px-6 py-8 sm:px-9 lg:px-12">
        <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-geek-accent/30 bg-geek-accent/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-geek-accent-secondary" role="status">
          <span className="h-2 w-2 rounded-full bg-geek-success" aria-hidden="true" />
          Comunidad activa
        </div>

        <h1 className="font-heading text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
          Tu universo geek,
          <span className="block bg-gradient-to-r from-geek-accent via-violet-300 to-geek-accent-secondary bg-clip-text text-transparent">
            sin limites.
          </span>
        </h1>

        <p className="mt-5 max-w-lg text-base leading-7 text-geek-text-secondary sm:text-lg">
          Explora, aprende y construye el conocimiento de lo que mas te apasiona.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href={ROUTES.UNIVERSES}
            className="btn-primary"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <path d="M3 12c3-5 15-8 18-3" />
              <path d="M4 15c4 3 13 4 17-2" />
            </svg>
            Explorar universos
          </a>
          <a
            href={ROUTES.CREATE_ARTICLE}
            className="btn-secondary"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Crear articulo
          </a>
        </div>

        <div className="mt-7 grid max-w-[610px] grid-cols-2 overflow-hidden rounded-lg border border-geek-border/80 bg-geek-dark/58 backdrop-blur-md sm:grid-cols-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3 border-geek-border/70 px-4 py-3 odd:border-r sm:border-r sm:last:border-r-0">
              <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-geek-accent/10 text-geek-accent">
                <StatIcon type={item.type} />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-sm font-bold text-white" aria-label={`${item.label}: ${item.value.toLocaleString('es-ES')}`}>
                  {formatCompact(item.value)}+
                </span>
                <span className="block truncate text-xs leading-tight text-geek-text-secondary">{item.label}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
