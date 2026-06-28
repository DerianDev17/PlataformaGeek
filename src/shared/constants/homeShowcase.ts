export const HOME_IMAGES = {
  hero: '/images/home/hero-multiverse.webp',
  contactSheet: '/images/home/thumbnail-contact-sheet.webp',
  universes: {
    marvel: '/images/home/cosmic-heroes.webp',
    'star wars': '/images/home/space-opera.webp',
    'dragon ball': '/images/home/energy-arena.webp',
    'harry potter': '/images/home/magic-castle.webp',
    'the witcher': '/images/home/dark-fantasy.webp',
    zelda: '/images/home/adventure-kingdom.webp',
    'elden ring': '/images/home/eclipse-battle.webp',
  },
  articles: [
    '/images/home/cyber-editor.webp',
    '/images/home/eclipse-battle.webp',
    '/images/home/dark-fantasy.webp',
    '/images/home/magic-castle.webp',
    '/images/home/energy-arena.webp',
    '/images/home/space-opera.webp',
  ],
} as const;

export const FALLBACK_HOME_DATA = {
  stats: {
    universes: 280,
    articles: 15000,
    characters: 12000,
    users: 45000,
    theories: 3200,
  },
  featuredUniverses: [
    {
      id: 'marvel',
      name: 'Marvel',
      slug: 'marvel',
      description: 'Heroes, villanos y eventos multiversales.',
      coverImage: HOME_IMAGES.universes.marvel,
      articleCount: 2345,
      characterCount: 420,
      theoryCount: 86,
    },
    {
      id: 'star-wars',
      name: 'Star Wars',
      slug: 'star-wars',
      description: 'Sagas, planetas, ordenes y cronologias.',
      coverImage: HOME_IMAGES.universes['star wars'],
      articleCount: 1987,
      characterCount: 312,
      theoryCount: 64,
    },
    {
      id: 'dragon-ball',
      name: 'Dragon Ball',
      slug: 'dragon-ball',
      description: 'Transformaciones, torneos y lineas temporales.',
      coverImage: HOME_IMAGES.universes['dragon ball'],
      articleCount: 1876,
      characterCount: 280,
      theoryCount: 72,
    },
    {
      id: 'harry-potter',
      name: 'Harry Potter',
      slug: 'harry-potter',
      description: 'Magia, casas, hechizos y misterios.',
      coverImage: HOME_IMAGES.universes['harry potter'],
      articleCount: 1234,
      characterCount: 205,
      theoryCount: 38,
    },
    {
      id: 'the-witcher',
      name: 'The Witcher',
      slug: 'the-witcher',
      description: 'Bestiarios, reinos y leyendas del continente.',
      coverImage: HOME_IMAGES.universes['the witcher'],
      articleCount: 987,
      characterCount: 160,
      theoryCount: 31,
    },
    {
      id: 'zelda',
      name: 'Zelda',
      slug: 'zelda',
      description: 'Hyrule, templos, cronologias y artefactos.',
      coverImage: HOME_IMAGES.universes.zelda,
      articleCount: 1456,
      characterCount: 190,
      theoryCount: 44,
    },
  ],
  trendingArticles: [
    {
      id: 'aizen-sousuke',
      title: 'Aizen Sousuke',
      slug: 'aizen-sousuke',
      summary: 'Capitan de la 5ta Division y ex-capitan de la Sociedad de Almas.',
      coverImage: HOME_IMAGES.articles[0],
      views: 15200,
      universe: { name: 'Bleach', slug: 'bleach' },
      author: { username: 'AnimeFan', avatarUrl: null },
      createdAt: '2026-06-27T14:10:00.000Z',
    },
    {
      id: 'dune-parte-2',
      title: 'Dune: Parte 2',
      slug: 'dune-parte-2',
      summary: 'La epica continuacion de la saga de Paul Atreides.',
      coverImage: HOME_IMAGES.articles[1],
      views: 8700,
      universe: { name: 'Dune', slug: 'dune' },
      author: { username: 'TheDarkEditor', avatarUrl: null },
      createdAt: '2026-06-26T22:30:00.000Z',
    },
    {
      id: 'elden-ring',
      title: 'Elden Ring',
      slug: 'elden-ring',
      summary: 'Guia completa de jefes, armas y builds.',
      coverImage: HOME_IMAGES.articles[2],
      views: 21400,
      universe: { name: 'Elden Ring', slug: 'elden-ring' },
      author: { username: 'DerianDev', avatarUrl: null },
      createdAt: '2026-06-25T20:00:00.000Z',
    },
  ],
  recentArticles: [
    {
      id: 'lugares-iconicos',
      title: 'Lugares iconicos',
      slug: 'lugares-iconicos',
      summary: 'Explora los lugares mas memorables del cine, series y videojuegos.',
      coverImage: HOME_IMAGES.articles[3],
      views: 12100,
      universe: { name: 'Especial', slug: 'especial' },
      author: { username: 'NekoGirl', avatarUrl: null },
      createdAt: '2026-06-27T09:45:00.000Z',
    },
    {
      id: 'torneos-saiyajin',
      title: 'Torneos Saiyajin',
      slug: 'torneos-saiyajin',
      summary: 'Reglas, peleadores y escalas de poder para entender cada arco.',
      coverImage: HOME_IMAGES.articles[4],
      views: 9800,
      universe: { name: 'Dragon Ball', slug: 'dragon-ball' },
      author: { username: 'Mugiwara', avatarUrl: null },
      createdAt: '2026-06-24T15:20:00.000Z',
    },
    {
      id: 'mapa-galactico',
      title: 'Mapa galactico',
      slug: 'mapa-galactico',
      summary: 'Rutas, facciones y conflictos en una galaxia muy lejana.',
      coverImage: HOME_IMAGES.articles[5],
      views: 7600,
      universe: { name: 'Star Wars', slug: 'star-wars' },
      author: { username: 'LoreKeeper', avatarUrl: null },
      createdAt: '2026-06-23T12:00:00.000Z',
    },
  ],
  topContributors: [
    { id: 'animefan', username: 'AnimeFan', displayName: 'AnimeFan', avatarUrl: null, xp: 14250, level: 28, articleCount: 84 },
    { id: 'darkeditor', username: 'TheDarkEditor', displayName: 'TheDarkEditor', avatarUrl: null, xp: 11230, level: 26, articleCount: 71 },
    { id: 'mugiwara', username: 'Mugiwara', displayName: 'Mugiwara', avatarUrl: null, xp: 9870, level: 24, articleCount: 62 },
    { id: 'nekogirl', username: 'NekoGirl', displayName: 'NekoGirl', avatarUrl: null, xp: 8450, level: 22, articleCount: 55 },
    { id: 'deriandev', username: 'DerianDev', displayName: 'DerianDev', avatarUrl: null, xp: 8450, level: 23, articleCount: 49 },
  ],
};

export function isPlaceholderImage(src: string | null | undefined): boolean {
  return !src || src.includes('placehold.co') || src.includes('placeholder');
}

export function getUniverseShowcaseImage(name: string, fallback?: string | null): string {
  const key = name.toLowerCase() as keyof typeof HOME_IMAGES.universes;
  return HOME_IMAGES.universes[key] || (isPlaceholderImage(fallback) ? HOME_IMAGES.articles[0] : fallback) || HOME_IMAGES.articles[0];
}

export function getArticleShowcaseImage(title: string, fallback: string | null | undefined, index = 0): string {
  if (!isPlaceholderImage(fallback)) return fallback!;
  const normalized = title.toLowerCase();
  if (normalized.includes('elden')) return HOME_IMAGES.articles[2];
  if (normalized.includes('dune')) return HOME_IMAGES.articles[1];
  if (normalized.includes('lugar')) return HOME_IMAGES.articles[3];
  if (normalized.includes('dragon') || normalized.includes('saiyajin')) return HOME_IMAGES.articles[4];
  return HOME_IMAGES.articles[index % HOME_IMAGES.articles.length];
}
