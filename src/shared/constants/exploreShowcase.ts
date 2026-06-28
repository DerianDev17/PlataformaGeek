import { HOME_IMAGES } from './homeShowcase';
import { MARVEL_EXPLORE_ITEMS, MARVEL_UNIVERSE } from './marvelShowcase';

export type ExploreCategory =
  | 'todos'
  | 'anime'
  | 'comics'
  | 'peliculas'
  | 'videojuegos'
  | 'fantasia'
  | 'tecnologia';

export interface ShowcaseUniverse {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  bannerImage: string;
  articleCount: number;
  characterCount: number;
  theoryCount: number;
  category: Exclude<ExploreCategory, 'todos'>;
  status: 'Activo' | 'Destacado' | 'Nuevo';
  momentum: string;
  editors: number;
  updatedAt: string;
}

export interface ExploreItem {
  id: string;
  type: 'Universo' | 'Articulo' | 'Guia' | 'Personaje';
  title: string;
  eyebrow: string;
  summary: string;
  href: string;
  image: string;
  category: Exclude<ExploreCategory, 'todos'>;
  metric: string;
  tag: string;
}

export interface ExploreCollection {
  title: string;
  summary: string;
  href: string;
  image: string;
  items: string;
  category: Exclude<ExploreCategory, 'todos'>;
}

export const EXPLORE_CATEGORIES: Array<{ label: string; value: ExploreCategory; description: string }> = [
  { label: 'Todos', value: 'todos', description: 'Todo el catalogo' },
  { label: 'Anime', value: 'anime', description: 'Sagas, arcos y escalas de poder' },
  { label: 'Comics', value: 'comics', description: 'Heroes, eventos y lineas editoriales' },
  { label: 'Peliculas', value: 'peliculas', description: 'Cine, sagas y cronologias' },
  { label: 'Videojuegos', value: 'videojuegos', description: 'Mundos, builds y jefes' },
  { label: 'Fantasia', value: 'fantasia', description: 'Magia, reinos y criaturas' },
  { label: 'Tecnologia', value: 'tecnologia', description: 'IA, hardware y cultura digital' },
];

export const FALLBACK_UNIVERSES: ShowcaseUniverse[] = [
  { ...MARVEL_UNIVERSE },
  {
    id: 'dc',
    name: 'DC',
    slug: 'dc',
    description: 'Gotham, Metropolis, la Liga de la Justicia y mitos modernos de heroes y villanos.',
    coverImage: HOME_IMAGES.articles[3],
    bannerImage: HOME_IMAGES.articles[3],
    articleCount: 1740,
    characterCount: 390,
    theoryCount: 58,
    category: 'comics',
    status: 'Activo',
    momentum: '+12% esta semana',
    editors: 66,
    updatedAt: '2026-06-26T13:30:00.000Z',
  },
  {
    id: 'star-wars',
    name: 'Star Wars',
    slug: 'star-wars',
    description: 'Planetas, ordenes, facciones y conflictos de una galaxia muy lejana.',
    coverImage: HOME_IMAGES.universes['star wars'],
    bannerImage: HOME_IMAGES.universes['star wars'],
    articleCount: 1987,
    characterCount: 312,
    theoryCount: 64,
    category: 'peliculas',
    status: 'Activo',
    momentum: '+11% esta semana',
    editors: 77,
    updatedAt: '2026-06-26T18:10:00.000Z',
  },
  {
    id: 'dragon-ball',
    name: 'Dragon Ball',
    slug: 'dragon-ball',
    description: 'Transformaciones, torneos, tecnicas y lineas temporales saiyajin.',
    coverImage: HOME_IMAGES.universes['dragon ball'],
    bannerImage: HOME_IMAGES.universes['dragon ball'],
    articleCount: 1876,
    characterCount: 280,
    theoryCount: 72,
    category: 'anime',
    status: 'Destacado',
    momentum: '+24% esta semana',
    editors: 83,
    updatedAt: '2026-06-27T08:35:00.000Z',
  },
  {
    id: 'one-piece',
    name: 'One Piece',
    slug: 'one-piece',
    description: 'Islas, tripulaciones, frutas del diablo, Poneglyphs y secretos del Siglo Vacio.',
    coverImage: HOME_IMAGES.articles[4],
    bannerImage: HOME_IMAGES.articles[4],
    articleCount: 1710,
    characterCount: 310,
    theoryCount: 95,
    category: 'anime',
    status: 'Destacado',
    momentum: '+27% esta semana',
    editors: 79,
    updatedAt: '2026-06-26T20:15:00.000Z',
  },
  {
    id: 'naruto',
    name: 'Naruto',
    slug: 'naruto',
    description: 'Aldeas, clanes, bijuu, guerras ninja y linajes que explican el mundo shinobi.',
    coverImage: HOME_IMAGES.articles[0],
    bannerImage: HOME_IMAGES.articles[0],
    articleCount: 1420,
    characterCount: 255,
    theoryCount: 63,
    category: 'anime',
    status: 'Activo',
    momentum: '+16% esta semana',
    editors: 58,
    updatedAt: '2026-06-25T09:00:00.000Z',
  },
  {
    id: 'harry-potter',
    name: 'Harry Potter',
    slug: 'harry-potter',
    description: 'Casas, hechizos, criaturas, reliquias y secretos del mundo magico.',
    coverImage: HOME_IMAGES.universes['harry potter'],
    bannerImage: HOME_IMAGES.universes['harry potter'],
    articleCount: 1234,
    characterCount: 205,
    theoryCount: 38,
    category: 'fantasia',
    status: 'Activo',
    momentum: '+7% esta semana',
    editors: 49,
    updatedAt: '2026-06-25T16:45:00.000Z',
  },
  {
    id: 'the-witcher',
    name: 'The Witcher',
    slug: 'the-witcher',
    description: 'Bestiario, reinos, escuelas de brujos y leyendas del Continente.',
    coverImage: HOME_IMAGES.universes['the witcher'],
    bannerImage: HOME_IMAGES.universes['the witcher'],
    articleCount: 987,
    characterCount: 160,
    theoryCount: 31,
    category: 'fantasia',
    status: 'Activo',
    momentum: '+9% esta semana',
    editors: 38,
    updatedAt: '2026-06-24T22:00:00.000Z',
  },
  {
    id: 'zelda',
    name: 'Zelda',
    slug: 'zelda',
    description: 'Hyrule, templos, cronologias, artefactos y linajes de heroes.',
    coverImage: HOME_IMAGES.universes.zelda,
    bannerImage: HOME_IMAGES.universes.zelda,
    articleCount: 1456,
    characterCount: 190,
    theoryCount: 44,
    category: 'videojuegos',
    status: 'Destacado',
    momentum: '+15% esta semana',
    editors: 61,
    updatedAt: '2026-06-27T12:05:00.000Z',
  },
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    slug: 'elden-ring',
    description: 'Tierras Intermedias, semidioses, builds, jefes y rutas de progreso.',
    coverImage: HOME_IMAGES.universes['elden ring'],
    bannerImage: HOME_IMAGES.universes['elden ring'],
    articleCount: 1640,
    characterCount: 154,
    theoryCount: 92,
    category: 'videojuegos',
    status: 'Nuevo',
    momentum: '+31% esta semana',
    editors: 68,
    updatedAt: '2026-06-27T13:10:00.000Z',
  },
  {
    id: 'dune',
    name: 'Dune',
    slug: 'dune',
    description: 'Casas nobles, especia, Bene Gesserit y politica del Imperio.',
    coverImage: HOME_IMAGES.articles[1],
    bannerImage: HOME_IMAGES.articles[1],
    articleCount: 742,
    characterCount: 118,
    theoryCount: 29,
    category: 'peliculas',
    status: 'Nuevo',
    momentum: '+19% esta semana',
    editors: 35,
    updatedAt: '2026-06-23T19:00:00.000Z',
  },
  {
    id: 'bleach',
    name: 'Bleach',
    slug: 'bleach',
    description: 'Shinigami, zanpakuto, divisiones, hollows y guerras espirituales.',
    coverImage: HOME_IMAGES.articles[0],
    bannerImage: HOME_IMAGES.articles[0],
    articleCount: 920,
    characterCount: 176,
    theoryCount: 41,
    category: 'anime',
    status: 'Activo',
    momentum: '+13% esta semana',
    editors: 44,
    updatedAt: '2026-06-22T20:15:00.000Z',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    slug: 'cyberpunk',
    description: 'Megacorporaciones, implantes, IA, netrunners y ciudades neon.',
    coverImage: HOME_IMAGES.articles[0],
    bannerImage: HOME_IMAGES.articles[0],
    articleCount: 638,
    characterCount: 95,
    theoryCount: 27,
    category: 'tecnologia',
    status: 'Activo',
    momentum: '+10% esta semana',
    editors: 31,
    updatedAt: '2026-06-21T15:30:00.000Z',
  },
];

export const EXPLORE_ITEMS: ExploreItem[] = [
  {
    id: 'cronologia-star-wars',
    type: 'Guia',
    title: 'Cronologia esencial de Star Wars',
    eyebrow: 'Orden de visionado',
    summary: 'Una ruta compacta para entender eras, trilogias, series y conflictos principales.',
    href: '/articulos/mapa-galactico',
    image: HOME_IMAGES.universes['star wars'],
    category: 'peliculas',
    metric: '7 min',
    tag: 'Canon',
  },
  {
    id: 'multiverso-marvel',
    type: 'Articulo',
    title: 'Eventos que cambiaron el multiverso Marvel',
    eyebrow: 'Comics',
    summary: 'Secret Wars, incursiones y realidades alternativas explicadas sin perder continuidad.',
    href: '/universos/marvel',
    image: HOME_IMAGES.universes.marvel,
    category: 'comics',
    metric: '15.2K vistas',
    tag: 'Popular',
  },
  ...MARVEL_EXPLORE_ITEMS,
  {
    id: 'builds-elden-ring',
    type: 'Guia',
    title: 'Builds para jefes de Elden Ring',
    eyebrow: 'Videojuegos',
    summary: 'Armas, estadisticas y rutas de mejora para avanzar sin romper el ritmo.',
    href: '/universos/elden-ring',
    image: HOME_IMAGES.universes['elden ring'],
    category: 'videojuegos',
    metric: '21.4K vistas',
    tag: 'Actualizado',
  },
  {
    id: 'saiyajin-escalas',
    type: 'Articulo',
    title: 'Escalas de poder saiyajin',
    eyebrow: 'Anime',
    summary: 'Transformaciones, tecnicas y saltos de poder comparados por arco.',
    href: '/universos/dragon-ball',
    image: HOME_IMAGES.universes['dragon ball'],
    category: 'anime',
    metric: '9.8K vistas',
    tag: 'Nuevo',
  },
  {
    id: 'bestario-witcher',
    type: 'Universo',
    title: 'Bestiario vivo de The Witcher',
    eyebrow: 'Fantasia oscura',
    summary: 'Monstruos, contratos, escuelas y regiones conectadas por lore.',
    href: '/universos/the-witcher',
    image: HOME_IMAGES.universes['the witcher'],
    category: 'fantasia',
    metric: '987 articulos',
    tag: 'Lore',
  },
  {
    id: 'ia-cultura-pop',
    type: 'Articulo',
    title: 'IA en la cultura pop reciente',
    eyebrow: 'Tecnologia',
    summary: 'De asistentes a antagonistas: patrones narrativos de la inteligencia artificial.',
    href: '/tecnologia',
    image: HOME_IMAGES.articles[0],
    category: 'tecnologia',
    metric: '6.3K vistas',
    tag: 'Analisis',
  },
];

export const EXPLORE_COLLECTIONS: ExploreCollection[] = [
  {
    title: 'Rutas para empezar',
    summary: 'Guias introductorias para entrar a una saga sin perder contexto.',
    href: '/peliculas',
    image: HOME_IMAGES.universes['star wars'],
    items: '18 rutas',
    category: 'peliculas',
  },
  {
    title: 'Lore profundo',
    summary: 'Teorias, cronologias y conexiones para lectores que quieren ir mas lejos.',
    href: '/explorar?categoria=fantasia',
    image: HOME_IMAGES.universes['the witcher'],
    items: '42 dossiers',
    category: 'fantasia',
  },
  {
    title: 'Builds y progreso',
    summary: 'Contenido practico para jugar mejor, comparar armas y planificar partidas.',
    href: '/videojuegos',
    image: HOME_IMAGES.universes['elden ring'],
    items: '26 guias',
    category: 'videojuegos',
  },
];

export const EXPLORE_TRENDS = [
  'OnePiece',
  'Marvel',
  'EldenRing',
  'StarWars',
  'Dune2',
  'DragonBall',
  'IA',
  'TheWitcher',
];

export function normalizeUniverseForShowcase(universe: any, index = 0): ShowcaseUniverse {
  const fallback = FALLBACK_UNIVERSES[index % FALLBACK_UNIVERSES.length];
  const matched = FALLBACK_UNIVERSES.find((item) => item.slug === universe?.slug || item.name === universe?.name);

  return {
    ...fallback,
    ...matched,
    id: universe?.id || matched?.id || fallback.id,
    name: universe?.name || matched?.name || fallback.name,
    slug: universe?.slug || matched?.slug || fallback.slug,
    description: universe?.description || matched?.description || fallback.description,
    coverImage: universe?.coverImage || matched?.coverImage || fallback.coverImage,
    bannerImage: universe?.bannerImage || universe?.coverImage || matched?.bannerImage || fallback.bannerImage,
    articleCount: universe?.articleCount ?? matched?.articleCount ?? fallback.articleCount,
    characterCount: universe?.characterCount ?? matched?.characterCount ?? fallback.characterCount,
    theoryCount: universe?.theoryCount ?? matched?.theoryCount ?? fallback.theoryCount,
    updatedAt: universe?.updatedAt || matched?.updatedAt || fallback.updatedAt,
  };
}

export function getFallbackUniverseBySlug(slug: string | undefined): ShowcaseUniverse | undefined {
  return FALLBACK_UNIVERSES.find((universe) => universe.slug === slug);
}

export function getUniverseTotals(universes: Array<Pick<ShowcaseUniverse, 'articleCount' | 'characterCount' | 'theoryCount'>>) {
  return universes.reduce(
    (totals, universe) => ({
      articles: totals.articles + universe.articleCount,
      characters: totals.characters + universe.characterCount,
      theories: totals.theories + universe.theoryCount,
    }),
    { articles: 0, characters: 0, theories: 0 }
  );
}
