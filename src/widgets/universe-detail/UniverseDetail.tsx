import { ROUTES } from '@/shared/constants';

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  views: number;
  createdAt: string;
}

interface CharacterItem {
  id: string;
  name: string;
  slug: string;
  alias: string | null;
  imageUrl: string | null;
  description: string;
}

interface TheoryItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  votes: number;
  createdAt: string;
  author: { username: string; avatarUrl: string | null };
}

interface UniverseData {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
  bannerImage: string | null;
  articleCount: number;
  characterCount: number;
  theoryCount: number;
  recentArticles?: ArticleItem[];
  featuredCharacters?: CharacterItem[];
  popularTheories?: TheoryItem[];
  momentum?: string;
  editors?: number;
}

interface UniverseDetailProps {
  universe: UniverseData | null;
  loading?: boolean;
}

const statusLabels: Record<string, string> = {
  open: 'Abierta',
  debated: 'En debate',
  confirmed: 'Confirmada',
  rejected: 'Descartada',
};

function formatCompact(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return value.toString();
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function UniverseDetail({ universe, loading }: UniverseDetailProps) {
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-96 animate-pulse rounded-lg border border-geek-border bg-geek-dark-secondary" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-56 animate-pulse rounded-lg border border-geek-border bg-geek-dark-secondary" />
          ))}
        </div>
      </div>
    );
  }

  if (!universe) {
    return (
      <div className="rounded-lg border border-geek-border bg-geek-dark-secondary px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-geek-text">Universo no encontrado</h1>
        <p className="mt-2 text-geek-text-secondary">El universo que buscas no existe o fue eliminado.</p>
      </div>
    );
  }

  const articles = universe.recentArticles || [];
  const characters = universe.featuredCharacters || [];
  const theories = universe.popularTheories || [];
  const heroImage = universe.bannerImage || universe.coverImage;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-lg border border-geek-border bg-geek-dark-secondary">
        {heroImage && <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" aria-hidden="true" />}
        <div className="absolute inset-0 bg-gradient-to-r from-geek-dark via-geek-dark/84 to-geek-dark/45" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-geek-dark-secondary to-transparent" aria-hidden="true" />

        <div className="relative grid min-h-[420px] gap-6 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:p-10">
          <div className="flex max-w-3xl flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-lg border border-geek-accent/30 bg-geek-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-geek-accent">
              Universo
            </span>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">{universe.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-geek-text-secondary md:text-lg">{universe.description}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#articles"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-geek-accent-hover px-5 text-sm font-bold text-white transition-colors hover:bg-geek-accent focus-visible:ring-2 focus-visible:ring-geek-accent"
              >
                Leer articulos
              </a>
              <a
                href={ROUTES.CREATE_ARTICLE}
                className="inline-flex h-11 items-center rounded-lg border border-geek-border bg-geek-dark-secondary/80 px-5 text-sm font-semibold text-geek-text transition-colors hover:border-geek-accent/70 hover:bg-geek-dark-tertiary focus-visible:ring-2 focus-visible:ring-geek-accent"
              >
                Crear aporte
              </a>
            </div>
          </div>

          <aside className="self-end rounded-lg border border-geek-border bg-geek-dark/78 p-4 backdrop-blur">
            <h2 className="text-base font-bold text-geek-text">Resumen editorial</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <HeroStat label="Artículos" value={formatCompact(universe.articleCount)} />
              <HeroStat label="Personajes" value={formatCompact(universe.characterCount)} />
              <HeroStat label="Teorías" value={formatCompact(universe.theoryCount)} />
              <HeroStat label="Editores" value={(universe.editors || 24).toString()} />
            </div>
            <p className="mt-4 rounded-lg border border-geek-border bg-geek-dark-secondary/80 px-3 py-2 text-sm text-geek-text-secondary">
              {universe.momentum || 'Actualizado por la comunidad esta semana'}
            </p>
          </aside>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <section id="articles">
            <SectionHeader title="Artículos recientes" href={`/articulos?universe=${universe.slug}`} linkLabel="Ver todos" />
            {articles.length === 0 ? (
              <EmptyPanel title="Sin articulos todavia" detail="Crea el primer aporte para este universo." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>

          <section id="characters">
            <SectionHeader title="Personajes destacados" href={ROUTES.CHARACTERS} linkLabel="Ver personajes" />
            {characters.length === 0 ? (
              <EmptyPanel title="Sin personajes destacados" detail="Agrega fichas para completar este universo." />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {characters.map((character) => (
                  <CharacterCard key={character.id} character={character} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-geek-border bg-geek-dark-secondary/70 p-4">
            <h2 className="text-base font-bold text-geek-text">Teorías populares</h2>
            <div className="mt-4 space-y-3">
              {theories.length === 0 ? (
                <p className="text-sm text-geek-text-secondary">Aun no hay teorias activas.</p>
              ) : (
                theories.map((theory) => <TheoryCard key={theory.id} theory={theory} />)
              )}
            </div>
          </section>

          <section className="rounded-lg border border-geek-border bg-geek-dark-secondary/70 p-4">
            <h2 className="text-base font-bold text-geek-text">Acciones rapidas</h2>
            <div className="mt-4 grid gap-2">
              <QuickLink href={ROUTES.EXPLORE} label="Explorar mas" detail="Contenido relacionado" />
              <QuickLink href={ROUTES.UNIVERSES} label="Volver a universos" detail="Catalogo completo" />
              <QuickLink href={ROUTES.CREATE_ARTICLE} label="Crear articulo" detail="Publicar una guia" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-geek-border bg-geek-dark-secondary/80 p-3" aria-label={`${label}: ${value}`}>
      <span className="block text-xl font-bold text-geek-text">{value}</span>
      <span className="block text-[11px] uppercase tracking-wide text-geek-text-secondary">{label}</span>
    </span>
  );
}

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-xl font-bold text-geek-text">{title}</h2>
      <a href={href} className="text-sm font-semibold text-geek-accent transition-colors hover:text-geek-accent-secondary">
        {linkLabel}
      </a>
    </div>
  );
}

function ArticleCard({ article }: { article: ArticleItem }) {
  return (
    <a href={ROUTES.ARTICLE_DETAIL(article.slug)} className="group overflow-hidden rounded-lg border border-geek-border bg-geek-dark-secondary transition-colors hover:border-geek-accent/60">
      {article.coverImage && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={article.coverImage} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-geek-dark-secondary to-transparent" />
        </div>
      )}
      <div className="p-4">
        <h3 className="line-clamp-2 text-lg font-bold text-geek-text group-hover:text-geek-accent">{article.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-geek-text-secondary">{article.summary}</p>
        <div className="mt-4 flex items-center justify-between border-t border-geek-border pt-3 text-xs text-geek-text-secondary">
          <span>{formatCompact(article.views)} vistas</span>
          <span>{formatDate(article.createdAt)}</span>
        </div>
      </div>
    </a>
  );
}

function CharacterCard({ character }: { character: CharacterItem }) {
  return (
    <a href={ROUTES.CHARACTER_DETAIL(character.slug)} className="group overflow-hidden rounded-lg border border-geek-border bg-geek-dark-secondary transition-colors hover:border-geek-accent/60">
      {character.imageUrl && (
        <div className="aspect-[4/3] overflow-hidden">
          <img src={character.imageUrl} alt={character.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-geek-text group-hover:text-geek-accent">{character.name}</h3>
        {character.alias && <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-geek-accent">{character.alias}</p>}
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-geek-text-secondary">{character.description}</p>
      </div>
    </a>
  );
}

function TheoryCard({ theory }: { theory: TheoryItem }) {
  return (
    <a href={`/teorias/${theory.slug}`} className="block rounded-lg border border-geek-border bg-geek-dark p-3 transition-colors hover:border-geek-accent/60">
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-sm font-bold text-geek-text">{theory.title}</h3>
        <span className="flex-shrink-0 rounded-md bg-geek-accent/10 px-2 py-1 text-[11px] font-semibold text-geek-accent">
          {statusLabels[theory.status] || theory.status}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-geek-text-secondary">{theory.content}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-geek-text-secondary">
        <span>{theory.author.username}</span>
        <span>{theory.votes} votos</span>
      </div>
    </a>
  );
}

function QuickLink({ href, label, detail }: { href: string; label: string; detail: string }) {
  return (
    <a href={href} className="flex items-center justify-between rounded-lg border border-geek-border bg-geek-dark px-3 py-3 transition-colors hover:border-geek-accent/60">
      <span>
        <span className="block text-sm font-semibold text-geek-text">{label}</span>
        <span className="text-xs text-geek-text-secondary">{detail}</span>
      </span>
      <svg className="h-4 w-4 text-geek-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}

function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-geek-border bg-geek-dark-secondary px-6 py-12 text-center">
      <h3 className="text-lg font-bold text-geek-text">{title}</h3>
      <p className="mt-2 text-sm text-geek-text-secondary">{detail}</p>
    </div>
  );
}
