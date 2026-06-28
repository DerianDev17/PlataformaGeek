import { HOME_IMAGES } from './homeShowcase';
import { ROUTES } from './routes';

export interface CharacterShowcase {
  id: string;
  name: string;
  slug: string;
  alias: string | null;
  description: string;
  imageUrl: string;
  universe: { name: string; slug: string };
  role: string;
  lane: string;
  alignment: string;
  powerScale: string;
  articleCount: number;
  updatedAt: string;
}

export interface CharacterRelationShowcase {
  from: string;
  to: string;
  type: 'ally' | 'enemy' | 'rival' | 'family' | 'mentor' | 'other';
  label: string;
  description: string;
}

export const FALLBACK_CHARACTERS: CharacterShowcase[] = [
  {
    id: 'goku',
    name: 'Goku',
    slug: 'goku',
    alias: 'Kakarot',
    description: 'Guerrero Saiyajin criado en la Tierra, eje de torneos, transformaciones y escalas de poder.',
    imageUrl: HOME_IMAGES.universes['dragon ball'],
    universe: { name: 'Dragon Ball', slug: 'dragon-ball' },
    role: 'Protagonista',
    lane: 'Poder',
    alignment: 'Heroe',
    powerScale: 'S+',
    articleCount: 48,
    updatedAt: '2026-06-27T08:30:00.000Z',
  },
  {
    id: 'vegeta',
    name: 'Vegeta',
    slug: 'vegeta',
    alias: 'Principe de los Saiyajin',
    description: 'Rival directo de Goku y una de las evoluciones de personaje mas seguidas del anime.',
    imageUrl: HOME_IMAGES.universes['dragon ball'],
    universe: { name: 'Dragon Ball', slug: 'dragon-ball' },
    role: 'Rival',
    lane: 'Poder',
    alignment: 'Antiheroe',
    powerScale: 'S',
    articleCount: 36,
    updatedAt: '2026-06-26T11:45:00.000Z',
  },
  {
    id: 'monkey-d-luffy',
    name: 'Monkey D. Luffy',
    slug: 'monkey-d-luffy',
    alias: 'Sombrero de Paja',
    description: 'Capitan pirata que conecta tripulacion, frutas del diablo y misterios del Siglo Vacio.',
    imageUrl: HOME_IMAGES.articles[4],
    universe: { name: 'One Piece', slug: 'one-piece' },
    role: 'Capitan',
    lane: 'Aventura',
    alignment: 'Heroe',
    powerScale: 'S',
    articleCount: 44,
    updatedAt: '2026-06-25T15:20:00.000Z',
  },
  {
    id: 'roronoa-zoro',
    name: 'Roronoa Zoro',
    slug: 'roronoa-zoro',
    alias: 'Cazador de Piratas',
    description: 'Espadachin de los Sombrero de Paja y referencia para tecnicas, duelos y promesas.',
    imageUrl: HOME_IMAGES.articles[4],
    universe: { name: 'One Piece', slug: 'one-piece' },
    role: 'Combatiente',
    lane: 'Tecnica',
    alignment: 'Heroe',
    powerScale: 'A+',
    articleCount: 29,
    updatedAt: '2026-06-24T16:10:00.000Z',
  },
  {
    id: 'naruto-uzumaki',
    name: 'Naruto Uzumaki',
    slug: 'naruto-uzumaki',
    alias: 'El Ninja Impredecible',
    description: 'Jinchuriki del Nueve Colas, centro de clanes, aldeas y grandes guerras ninja.',
    imageUrl: HOME_IMAGES.articles[0],
    universe: { name: 'Naruto', slug: 'naruto' },
    role: 'Protagonista',
    lane: 'Voluntad',
    alignment: 'Heroe',
    powerScale: 'S',
    articleCount: 40,
    updatedAt: '2026-06-23T10:00:00.000Z',
  },
  {
    id: 'sasuke-uchiha',
    name: 'Sasuke Uchiha',
    slug: 'sasuke-uchiha',
    alias: 'Ultimo Uchiha',
    description: 'Rival de Naruto y eje de venganzas, clanes, dojutsu y redenciones complejas.',
    imageUrl: HOME_IMAGES.articles[0],
    universe: { name: 'Naruto', slug: 'naruto' },
    role: 'Rival',
    lane: 'Legado',
    alignment: 'Antiheroe',
    powerScale: 'S',
    articleCount: 33,
    updatedAt: '2026-06-23T09:15:00.000Z',
  },
  {
    id: 'darth-vader',
    name: 'Darth Vader',
    slug: 'darth-vader',
    alias: 'Anakin Skywalker',
    description: 'Lord Sith que sostiene la tragedia central de Star Wars entre caida, poder y redencion.',
    imageUrl: HOME_IMAGES.universes['star wars'],
    universe: { name: 'Star Wars', slug: 'star-wars' },
    role: 'Antagonista',
    lane: 'Tragedia',
    alignment: 'Villano',
    powerScale: 'S',
    articleCount: 52,
    updatedAt: '2026-06-27T13:25:00.000Z',
  },
  {
    id: 'luke-skywalker',
    name: 'Luke Skywalker',
    slug: 'luke-skywalker',
    alias: 'Maestro Jedi',
    description: 'Heroe rebelde y pieza clave para entender la Fuerza, la Nueva Republica y el legado Jedi.',
    imageUrl: HOME_IMAGES.universes['star wars'],
    universe: { name: 'Star Wars', slug: 'star-wars' },
    role: 'Heroe',
    lane: 'Legado',
    alignment: 'Heroe',
    powerScale: 'A+',
    articleCount: 38,
    updatedAt: '2026-06-26T17:10:00.000Z',
  },
  {
    id: 'geralt-de-rivia',
    name: 'Geralt de Rivia',
    slug: 'geralt-de-rivia',
    alias: 'El Lobo Blanco',
    description: 'Brujo mutante que conecta bestiarios, reinos, contratos y dilemas morales del Continente.',
    imageUrl: HOME_IMAGES.universes['the witcher'],
    universe: { name: 'The Witcher', slug: 'the-witcher' },
    role: 'Cazador',
    lane: 'Bestiario',
    alignment: 'Neutral',
    powerScale: 'A',
    articleCount: 27,
    updatedAt: '2026-06-22T19:00:00.000Z',
  },
  {
    id: 'link',
    name: 'Link',
    slug: 'link',
    alias: 'Heroe del Tiempo',
    description: 'Portador recurrente de la Espada Maestra y punto de entrada a cronologias de Hyrule.',
    imageUrl: HOME_IMAGES.universes.zelda,
    universe: { name: 'Zelda', slug: 'zelda' },
    role: 'Heroe',
    lane: 'Aventura',
    alignment: 'Heroe',
    powerScale: 'A',
    articleCount: 31,
    updatedAt: '2026-06-21T12:40:00.000Z',
  },
  {
    id: 'princesa-zelda',
    name: 'Princesa Zelda',
    slug: 'princesa-zelda',
    alias: 'Portadora de la Trifuerza',
    description: 'Figura real, sabia y magica que articula eras, linajes y amenazas de Hyrule.',
    imageUrl: HOME_IMAGES.universes.zelda,
    universe: { name: 'Zelda', slug: 'zelda' },
    role: 'Soberana',
    lane: 'Magia',
    alignment: 'Heroe',
    powerScale: 'A',
    articleCount: 24,
    updatedAt: '2026-06-21T11:20:00.000Z',
  },
  {
    id: 'doctor-doom',
    name: 'Doctor Doom',
    slug: 'doctor-doom',
    alias: 'Victor Von Doom',
    description: 'Monarca de Latveria, cientifico y hechicero; una amenaza politica, tecnologica y mistica.',
    imageUrl: HOME_IMAGES.universes.marvel,
    universe: { name: 'Marvel', slug: 'marvel' },
    role: 'Villano',
    lane: 'Poder politico',
    alignment: 'Villano',
    powerScale: 'S',
    articleCount: 47,
    updatedAt: '2026-06-27T14:00:00.000Z',
  },
  {
    id: 'spider-man',
    name: 'Spider-Man',
    slug: 'spider-man',
    alias: 'Peter Parker',
    description: 'El trepamuros de Nueva York, ideal para arcos de barrio, multiverso y responsabilidad.',
    imageUrl: HOME_IMAGES.articles[0],
    universe: { name: 'Marvel', slug: 'marvel' },
    role: 'Heroe',
    lane: 'Barrio',
    alignment: 'Heroe',
    powerScale: 'A',
    articleCount: 43,
    updatedAt: '2026-06-23T16:40:00.000Z',
  },
  {
    id: 'iron-man',
    name: 'Iron Man',
    slug: 'iron-man',
    alias: 'Tony Stark',
    description: 'Inventor y eje tecnologico de los Vengadores, con arcos de legado, armaduras y sacrificio.',
    imageUrl: HOME_IMAGES.articles[1],
    universe: { name: 'Marvel', slug: 'marvel' },
    role: 'Inventor',
    lane: 'Tecnologia',
    alignment: 'Heroe',
    powerScale: 'A',
    articleCount: 35,
    updatedAt: '2026-06-24T21:30:00.000Z',
  },
  {
    id: 'thor',
    name: 'Thor',
    slug: 'thor',
    alias: 'Dios del Trueno',
    description: 'Principe de Asgard y puente entre mitologia, cosmos, magia y conflictos de los Vengadores.',
    imageUrl: HOME_IMAGES.articles[2],
    universe: { name: 'Marvel', slug: 'marvel' },
    role: 'Dios',
    lane: 'Cosmico',
    alignment: 'Heroe',
    powerScale: 'S',
    articleCount: 32,
    updatedAt: '2026-06-25T17:10:00.000Z',
  },
  {
    id: 'capitan-america',
    name: 'Capitan America',
    slug: 'capitan-america',
    alias: 'Steve Rogers',
    description: 'Supersoldado y lider moral, clave para politica, guerra, simbolos y el equipo Vengador.',
    imageUrl: HOME_IMAGES.articles[3],
    universe: { name: 'Marvel', slug: 'marvel' },
    role: 'Lider',
    lane: 'Estrategia',
    alignment: 'Heroe',
    powerScale: 'A',
    articleCount: 30,
    updatedAt: '2026-06-22T12:00:00.000Z',
  },
  {
    id: 'batman',
    name: 'Batman',
    slug: 'batman',
    alias: 'Bruce Wayne',
    description: 'Detective de Gotham y referencia para vigilancia, trauma, villanos urbanos y planes imposibles.',
    imageUrl: HOME_IMAGES.articles[3],
    universe: { name: 'DC', slug: 'dc' },
    role: 'Detective',
    lane: 'Estrategia',
    alignment: 'Heroe',
    powerScale: 'A',
    articleCount: 41,
    updatedAt: '2026-06-20T22:30:00.000Z',
  },
  {
    id: 'superman',
    name: 'Superman',
    slug: 'superman',
    alias: 'Clark Kent / Kal-El',
    description: 'El ultimo hijo de Krypton, centro de debates sobre esperanza, poder y responsabilidad.',
    imageUrl: HOME_IMAGES.articles[2],
    universe: { name: 'DC', slug: 'dc' },
    role: 'Icono',
    lane: 'Esperanza',
    alignment: 'Heroe',
    powerScale: 'S+',
    articleCount: 39,
    updatedAt: '2026-06-20T21:00:00.000Z',
  },
];

export const CHARACTER_RELATIONS: CharacterRelationShowcase[] = [
  {
    from: 'goku',
    to: 'vegeta',
    type: 'rival',
    label: 'Rivalidad saiyajin',
    description: 'Dos guerreros que convierten competencia y orgullo en crecimiento constante.',
  },
  {
    from: 'naruto-uzumaki',
    to: 'sasuke-uchiha',
    type: 'rival',
    label: 'Vinculo de clanes',
    description: 'Amigos, rivales y opuestos ideologicos dentro de la historia ninja.',
  },
  {
    from: 'darth-vader',
    to: 'luke-skywalker',
    type: 'family',
    label: 'Caida y redencion',
    description: 'La relacion familiar que sostiene el conflicto emocional de la trilogia original.',
  },
  {
    from: 'batman',
    to: 'superman',
    type: 'ally',
    label: 'Pilares de la Liga',
    description: 'Dos ideas opuestas de heroismo que funcionan como eje de DC.',
  },
  {
    from: 'doctor-doom',
    to: 'iron-man',
    type: 'rival',
    label: 'Tecnologia contra soberania',
    description: 'Choque entre inventores, egos y visiones opuestas del control mundial.',
  },
];

export const CHARACTER_RELATED_ARTICLES: Record<string, Array<{ title: string; slug: string; summary: string }>> = {
  goku: [
    {
      title: 'Linea temporal de Dragon Ball Z',
      slug: 'linea-temporal-de-dragon-ball-z',
      summary: 'Arcos, saltos de poder y transformaciones principales de la era Z.',
    },
  ],
  'doctor-doom': [
    {
      title: 'Quien es Doctor Doom?',
      slug: 'quien-es-doctor-doom',
      summary: 'Historia completa de Victor Von Doom, ciencia, magia y Latveria.',
    },
  ],
  'spider-man': [
    {
      title: 'Spider-Man: historia y legado del trepamuros',
      slug: 'spider-man-historia-y-legado-del-trepamuros',
      summary: 'Evolucion de Peter Parker y los arcos que definieron su mito.',
    },
  ],
  'darth-vader': [
    {
      title: 'Que es la Fuerza',
      slug: 'que-es-la-fuerza',
      summary: 'Conceptos esenciales para entender Jedi, Sith y equilibrio.',
    },
  ],
};

export const COMIC_PAGE_STATS = [
  { label: 'Guias curadas', value: '34', detail: 'lecturas para empezar' },
  { label: 'Heroes y villanos', value: '180+', detail: 'perfiles conectados' },
  { label: 'Eventos', value: '22', detail: 'crossovers y sagas' },
  { label: 'Lineas', value: '616', detail: 'canon y variantes' },
];

export const COMIC_READING_LANES = [
  {
    title: 'Quien es Doctor Doom?',
    eyebrow: 'Villanos esenciales',
    summary: 'Una entrada directa al peso politico, cientifico y mistico de Victor Von Doom.',
    href: ROUTES.ARTICLE_DETAIL('quien-es-doctor-doom'),
    image: HOME_IMAGES.universes.marvel,
    metric: '18.3K vistas',
  },
  {
    title: 'Cronologia basica del UCM',
    eyebrow: 'Marvel Studios',
    summary: 'Orden temporal para conectar fases, sagas, series y eventos centrales.',
    href: ROUTES.ARTICLE_DETAIL('cronologia-basica-del-ucm'),
    image: HOME_IMAGES.articles[1],
    metric: '14.1K vistas',
  },
  {
    title: 'Gemas del Infinito explicadas',
    eyebrow: 'Objetos cosmicos',
    summary: 'Poder, origen y apariciones clave de cada gema dentro de la Saga del Infinito.',
    href: ROUTES.ARTICLE_DETAIL('las-gemas-del-infinito-explicadas'),
    image: HOME_IMAGES.articles[2],
    metric: '12.8K vistas',
  },
];

export const COMIC_EVENT_STACK = [
  {
    title: 'Secret Wars e incursiones',
    status: 'Multiverso',
    summary: 'Realidades en colision, variantes y consecuencias editoriales de alto impacto.',
    href: ROUTES.UNIVERSE_DETAIL('marvel'),
  },
  {
    title: 'La Saga del Infinito',
    status: 'Cosmico',
    summary: 'Thanos, gemas y el hilo que conecta equipos, amenazas y sacrificios.',
    href: ROUTES.ARTICLE_DETAIL('thanos-el-titan-loco-y-su-plan-maestro'),
  },
  {
    title: 'Los Vengadores',
    status: 'Equipo',
    summary: 'Miembros, alineaciones y momentos clave del grupo mas visible de Marvel.',
    href: ROUTES.ARTICLE_DETAIL('los-vengadores-guia-completa-del-equipo'),
  },
];

export const COMIC_CHARACTER_SLUGS = ['doctor-doom', 'spider-man', 'iron-man', 'thor', 'capitan-america', 'batman'];

export const SERIES_PAGE_STATS = [
  { label: 'Ordenes', value: '12', detail: 'cronologias listas' },
  { label: 'Sagas', value: '28', detail: 'arcos por temporada' },
  { label: 'Universos', value: '9', detail: 'series y spin-offs' },
  { label: 'Guias', value: '64', detail: 'episodios clave' },
];

export const SERIES_SPOTLIGHTS = [
  {
    title: 'Star Wars en orden cronologico',
    universe: 'Star Wars',
    format: 'Orden de visionado',
    summary: 'Trilogias, series animadas y live action conectadas por eras de la galaxia.',
    href: ROUTES.ARTICLE_DETAIL('orden-cronologico-de-star-wars'),
    image: HOME_IMAGES.universes['star wars'],
    pace: 'Canon principal',
  },
  {
    title: 'The Witcher: reinos y contratos',
    universe: 'The Witcher',
    format: 'Mapa de temporada',
    summary: 'Personajes, monstruos y politica del Continente ordenados para seguir cada arco.',
    href: ROUTES.UNIVERSE_DETAIL('the-witcher'),
    image: HOME_IMAGES.universes['the witcher'],
    pace: 'Fantasia oscura',
  },
  {
    title: 'Dune: casas, especia e imperio',
    universe: 'Dune',
    format: 'Dossier de saga',
    summary: 'Una lectura para ubicar Bene Gesserit, Fremen, Atreides y Harkonnen.',
    href: ROUTES.UNIVERSE_DETAIL('dune'),
    image: HOME_IMAGES.articles[1],
    pace: 'Politica espacial',
  },
];

export const SERIES_WATCH_PATHS = [
  {
    step: '01',
    title: 'Entrada rapida',
    detail: 'Empieza por una guia de orden y una ficha de universo antes de saltar a teorias.',
  },
  {
    step: '02',
    title: 'Arcos principales',
    detail: 'Agrupa temporadas por conflicto, faccion y protagonista para evitar perdida de contexto.',
  },
  {
    step: '03',
    title: 'Canon y variantes',
    detail: 'Separa adaptaciones, spin-offs y continuidad principal cuando una saga cambia de medio.',
  },
  {
    step: '04',
    title: 'Debate editorial',
    detail: 'Contrasta teorias con episodios clave, fuentes internas y cronologias de la comunidad.',
  },
];

export const SERIES_RADAR = [
  { label: 'Star Wars', href: ROUTES.UNIVERSE_DETAIL('star-wars'), count: '18 rutas' },
  { label: 'The Witcher', href: ROUTES.UNIVERSE_DETAIL('the-witcher'), count: '11 dossiers' },
  { label: 'Dune', href: ROUTES.UNIVERSE_DETAIL('dune'), count: '8 claves' },
  { label: 'Harry Potter', href: ROUTES.UNIVERSE_DETAIL('harry-potter'), count: '14 conexiones' },
];

export const MOVIES_PAGE_STATS = [
  { label: 'Sagas', value: '18', detail: 'cronologias y arcos' },
  { label: 'Guias', value: '52', detail: 'ordenes de visionado' },
  { label: 'Universos', value: '11', detail: 'cine y adaptaciones' },
  { label: 'Dossiers', value: '29', detail: 'personajes y eventos' },
];

export const MOVIES_SPOTLIGHTS = [
  {
    title: 'Orden cronologico de Star Wars',
    universe: 'Star Wars',
    format: 'Cronologia de cine',
    summary: 'Una ruta para conectar precuelas, trilogia original, secuelas y material esencial.',
    href: ROUTES.ARTICLE_DETAIL('orden-cronologico-de-star-wars'),
    image: HOME_IMAGES.universes['star wars'],
    tag: 'Saga espacial',
  },
  {
    title: 'Dune: casas, especia y profecia',
    universe: 'Dune',
    format: 'Dossier de pelicula',
    summary: 'Contexto rapido para ubicar Arrakis, Fremen, Atreides y Bene Gesserit.',
    href: ROUTES.UNIVERSE_DETAIL('dune'),
    image: HOME_IMAGES.articles[1],
    tag: 'Ciencia ficcion',
  },
  {
    title: 'Cronologia basica del UCM',
    universe: 'Marvel',
    format: 'Mapa de fases',
    summary: 'Fases, sagas y eventos centrales para seguir el cine de Marvel sin perder continuidad.',
    href: ROUTES.ARTICLE_DETAIL('cronologia-basica-del-ucm'),
    image: HOME_IMAGES.universes.marvel,
    tag: 'Superheroes',
  },
];

export const MOVIES_VIEWING_PATHS = [
  {
    step: '01',
    title: 'Orden de estreno',
    detail: 'Ideal para sentir revelaciones y cambios de tono como los vivio la audiencia original.',
  },
  {
    step: '02',
    title: 'Orden cronologico',
    detail: 'Agrupa eventos internos por fecha de la historia, aunque mezcle eras y producciones.',
  },
  {
    step: '03',
    title: 'Ruta esencial',
    detail: 'Reduce una saga a peliculas imprescindibles, especiales y articulos puente.',
  },
  {
    step: '04',
    title: 'Contexto expandido',
    detail: 'Anade universos, personajes y objetos cuando la pelicula depende de lore externo.',
  },
];

export const MOVIES_RADAR = [
  { label: 'Star Wars', href: ROUTES.UNIVERSE_DETAIL('star-wars'), count: '9 peliculas base' },
  { label: 'Marvel', href: ROUTES.UNIVERSE_DETAIL('marvel'), count: 'fases y sagas' },
  { label: 'Dune', href: ROUTES.UNIVERSE_DETAIL('dune'), count: 'casas nobles' },
  { label: 'Harry Potter', href: ROUTES.UNIVERSE_DETAIL('harry-potter'), count: 'mundo magico' },
];

export const VIDEOGAME_PAGE_STATS = [
  { label: 'Guias', value: '46', detail: 'rutas, builds y jefes' },
  { label: 'Mundos', value: '14', detail: 'mapas y regiones' },
  { label: 'Personajes', value: '190+', detail: 'fichas jugables' },
  { label: 'Retos', value: '31', detail: 'bosses y eventos' },
];

export const VIDEOGAME_SPOTLIGHTS = [
  {
    title: 'Guia de las Tierras Intermedias',
    universe: 'Elden Ring',
    format: 'Ruta de progreso',
    summary: 'Zonas, semidioses, armas y progreso recomendado para orientarte en el mapa.',
    href: ROUTES.ARTICLE_DETAIL('guia-de-las-tierras-intermedias'),
    image: HOME_IMAGES.universes['elden ring'],
    tag: 'Soulslike',
  },
  {
    title: 'Que es el Anillo de Elden',
    universe: 'Elden Ring',
    format: 'Lore central',
    summary: 'Conceptos base para entender runas, dioses externos y la ruptura del orden.',
    href: ROUTES.ARTICLE_DETAIL('que-es-el-anillo-de-elden'),
    image: HOME_IMAGES.articles[2],
    tag: 'Lore',
  },
  {
    title: 'Zelda: cronologias de Hyrule',
    universe: 'Zelda',
    format: 'Mapa de aventura',
    summary: 'Templos, artefactos, linajes y lineas temporales para comparar cada era.',
    href: ROUTES.UNIVERSE_DETAIL('zelda'),
    image: HOME_IMAGES.universes.zelda,
    tag: 'Aventura',
  },
];

export const VIDEOGAME_PLAYBOOK = [
  {
    step: 'Build',
    title: 'Define estilo de juego',
    detail: 'Agrupa armas, habilidades y estadisticas antes de recomendar rutas.',
  },
  {
    step: 'Mapa',
    title: 'Ordena regiones',
    detail: 'Separa zonas iniciales, opcionales y de alto riesgo para evitar saltos bruscos.',
  },
  {
    step: 'Jefes',
    title: 'Conecta debilidades',
    detail: 'Documenta patrones, recompensas y prerequisitos de cada combate importante.',
  },
  {
    step: 'Lore',
    title: 'Explica consecuencias',
    detail: 'Relaciona finales, facciones y objetos sin convertir la guia en una lista suelta.',
  },
];

export const VIDEOGAME_RADAR = [
  { label: 'Elden Ring', href: ROUTES.UNIVERSE_DETAIL('elden-ring'), count: '21 builds' },
  { label: 'Zelda', href: ROUTES.UNIVERSE_DETAIL('zelda'), count: '12 templos' },
  { label: 'Cyberpunk', href: ROUTES.UNIVERSE_DETAIL('cyberpunk'), count: '9 rutas' },
  { label: 'The Witcher', href: ROUTES.UNIVERSE_DETAIL('the-witcher'), count: 'bestias y contratos' },
];

export const TECHNOLOGY_PAGE_STATS = [
  { label: 'Analisis', value: '24', detail: 'IA, hardware y cultura' },
  { label: 'Guias', value: '39', detail: 'conceptos explicados' },
  { label: 'Tendencias', value: '17', detail: 'temas monitoreados' },
  { label: 'Universos', value: '6', detail: 'ficcion y tecnologia' },
];

export const TECHNOLOGY_SPOTLIGHTS = [
  {
    title: 'Cyberpunk: implantes, IA y megacorporaciones',
    universe: 'Cyberpunk',
    format: 'Dossier tecnologico',
    summary: 'Una entrada para entender netrunners, aumentos, ciudades neon y poder corporativo.',
    href: ROUTES.UNIVERSE_DETAIL('cyberpunk'),
    image: HOME_IMAGES.articles[0],
    tag: 'Cybercultura',
  },
  {
    title: 'IA en cultura pop reciente',
    universe: 'Especial',
    format: 'Analisis de tendencia',
    summary: 'Patrones narrativos de asistentes, replicas digitales y antagonistas algoritmicos.',
    href: `${ROUTES.EXPLORE}?categoria=tecnologia&q=IA`,
    image: HOME_IMAGES.articles[0],
    tag: 'IA',
  },
  {
    title: 'Iron Man: armaduras y legado tecnico',
    universe: 'Marvel',
    format: 'Perfil tecnico',
    summary: 'Tecnologia, energia, armaduras y decisiones que definen el mito de Tony Stark.',
    href: ROUTES.CHARACTER_DETAIL('iron-man'),
    image: HOME_IMAGES.articles[1],
    tag: 'Hardware ficticio',
  },
];

export const TECHNOLOGY_WORKFLOWS = [
  {
    step: '01',
    title: 'Separar ficcion y concepto',
    detail: 'Identifica que parte pertenece al universo narrativo y que parte explica tecnologia real.',
  },
  {
    step: '02',
    title: 'Definir impacto cultural',
    detail: 'Relaciona el tema con debates, esteticas y usos dentro de la comunidad geek.',
  },
  {
    step: '03',
    title: 'Conectar fuentes internas',
    detail: 'Vincula universos, personajes y articulos que usen la misma idea tecnica.',
  },
  {
    step: '04',
    title: 'Actualizar tendencias',
    detail: 'Mantiene temas vivos como IA, hardware, realidad extendida y ciberseguridad narrativa.',
  },
];

export const TECHNOLOGY_RADAR = [
  { label: 'Cyberpunk', href: ROUTES.UNIVERSE_DETAIL('cyberpunk'), count: 'implantes e IA' },
  { label: 'Marvel tech', href: ROUTES.CHARACTER_DETAIL('iron-man'), count: 'armaduras' },
  { label: 'IA', href: `${ROUTES.SEARCH}?q=IA`, count: 'tendencia' },
  { label: 'Videojuegos', href: ROUTES.VIDEOGAMES, count: 'sistemas y builds' },
];

export const ANIME_PAGE_STATS = [
  { label: 'Arcos', value: '42', detail: 'sagas y cronologias' },
  { label: 'Universos', value: '11', detail: 'shonen, seinen y fantasia' },
  { label: 'Personajes', value: '210+', detail: 'heroes, rivales y villanos' },
  { label: 'Guias', value: '58', detail: 'ordenes y poder' },
];

export const ANIME_SPOTLIGHTS = [
  {
    title: 'Linea temporal de Dragon Ball Z',
    universe: 'Dragon Ball',
    format: 'Cronologia de poder',
    summary: 'Arcos, transformaciones y saltos de escala para ubicar Saiyajins, Namek y la saga de Cell.',
    href: ROUTES.ARTICLE_DETAIL('linea-temporal-de-dragon-ball-z'),
    image: HOME_IMAGES.universes['dragon ball'],
    tag: 'Shonen',
  },
  {
    title: 'Historia del Siglo Vacio',
    universe: 'One Piece',
    format: 'Misterio central',
    summary: 'Poneglyphs, Gobierno Mundial y pistas que sostienen las teorias mas importantes de la serie.',
    href: ROUTES.ARTICLE_DETAIL('historia-del-siglo-vacio'),
    image: HOME_IMAGES.articles[5],
    tag: 'Aventura',
  },
  {
    title: 'Aizen Sousuke',
    universe: 'Bleach',
    format: 'Perfil de villano',
    summary: 'Una ruta para entender manipulacion, Sociedad de Almas y escalada espiritual.',
    href: ROUTES.UNIVERSE_DETAIL('bleach'),
    image: HOME_IMAGES.articles[0],
    tag: 'Seinen action',
  },
];

export const ANIME_ARCS = [
  {
    step: 'Saga',
    title: 'Ordena por arco',
    detail: 'Separa introduccion, torneo, guerra y epilogo antes de comparar poder o canon.',
  },
  {
    step: 'Canon',
    title: 'Marca adaptaciones',
    detail: 'Distingue manga, anime, peliculas y relleno para que cada guia sea confiable.',
  },
  {
    step: 'Poder',
    title: 'Explica escalas',
    detail: 'Conecta transformaciones, tecnicas y limitaciones sin perder la evolucion del personaje.',
  },
  {
    step: 'Teoria',
    title: 'Aterriza misterios',
    detail: 'Cruza pistas, capitulos y objetos recurrentes antes de publicar conclusiones.',
  },
];

export const ANIME_RADAR = [
  { label: 'Dragon Ball', href: ROUTES.UNIVERSE_DETAIL('dragon-ball'), count: 'transformaciones' },
  { label: 'One Piece', href: ROUTES.UNIVERSE_DETAIL('one-piece'), count: 'misterios' },
  { label: 'Naruto', href: ROUTES.UNIVERSE_DETAIL('naruto'), count: 'clanes y guerras' },
  { label: 'Bleach', href: ROUTES.UNIVERSE_DETAIL('bleach'), count: 'sociedades' },
];

export const ACTIVITY_PAGE_STATS = [
  { label: 'Movimientos', value: '128', detail: 'en las ultimas 24h' },
  { label: 'Ediciones', value: '64', detail: 'articulos actualizados' },
  { label: 'Debates', value: '31', detail: 'hilos con respuesta' },
  { label: 'Alertas', value: '9', detail: 'revisiones pendientes' },
];

export const ACTIVITY_FEED_ITEMS = [
  {
    user: 'AnimeFan',
    action: 'actualizo',
    target: 'Aizen Sousuke',
    href: ROUTES.ARTICLE_DETAIL('aizen-sousuke'),
    time: 'Hace 5 min',
    status: 'Revision',
    detail: 'Agrego relaciones con la Sociedad de Almas y marco spoilers por arco.',
  },
  {
    user: 'TheDarkEditor',
    action: 'creo un articulo',
    target: 'Batman: Tierra-1',
    href: `${ROUTES.SEARCH}?q=Batman%20Tierra-1`,
    time: 'Hace 1 h',
    status: 'Nuevo',
    detail: 'Nueva entrada para continuidad alternativa, aliados y tono editorial.',
  },
  {
    user: 'Mugiwara',
    action: 'comento en',
    target: 'Historia del Siglo Vacio',
    href: ROUTES.ARTICLE_DETAIL('historia-del-siglo-vacio'),
    time: 'Hace 2 h',
    status: 'Debate',
    detail: 'Propuso separar teorias confirmadas de especulacion de comunidad.',
  },
  {
    user: 'NekoGirl',
    action: 'agrego imagenes a',
    target: 'Elden Ring',
    href: ROUTES.UNIVERSE_DETAIL('elden-ring'),
    time: 'Hace 3 h',
    status: 'Media',
    detail: 'Actualizo portada de zona y referencias visuales para jefes principales.',
  },
];

export const ACTIVITY_LANES = [
  {
    title: 'Ediciones recientes',
    metric: '64 cambios',
    detail: 'Articulos con ajustes de canon, enlaces internos, imagenes o estructura.',
    href: `${ROUTES.SEARCH}?q=ediciones`,
  },
  {
    title: 'Comentarios activos',
    metric: '31 hilos',
    detail: 'Debates que necesitan cierre editorial, fuentes internas o moderacion.',
    href: ROUTES.FORUMS,
  },
  {
    title: 'Pendientes de revision',
    metric: '9 alertas',
    detail: 'Entradas con spoilers, duplicados o inconsistencias de continuidad.',
    href: `${ROUTES.SEARCH}?q=revision`,
  },
];

export const ACTIVITY_RADAR = [
  { label: 'Comics', href: ROUTES.COMICS, count: '18 cambios' },
  { label: 'Anime', href: ROUTES.ANIME, count: '27 cambios' },
  { label: 'Videojuegos', href: ROUTES.VIDEOGAMES, count: '14 cambios' },
  { label: 'Foros', href: ROUTES.FORUMS, count: '31 debates' },
];

export const FORUM_PAGE_STATS = [
  { label: 'Hilos activos', value: '31', detail: 'con respuesta reciente' },
  { label: 'Categorias', value: '8', detail: 'lore, canon y teorias' },
  { label: 'Moderadores', value: '6', detail: 'cubriendo debates' },
  { label: 'Soluciones', value: '17', detail: 'marcadas esta semana' },
];

export const FORUM_THREADS = [
  {
    title: 'El Siglo Vacio ya tiene fecha interna?',
    category: 'One Piece',
    replies: '48',
    lastActive: 'Hace 12 min',
    state: 'Teoria',
    summary: 'Comparacion de Poneglyphs, flashbacks y pistas sobre Joy Boy.',
    href: ROUTES.ARTICLE_DETAIL('historia-del-siglo-vacio'),
  },
  {
    title: 'Orden correcto para ver Star Wars con series',
    category: 'Star Wars',
    replies: '36',
    lastActive: 'Hace 28 min',
    state: 'Guia',
    summary: 'Debate entre orden cronologico, estreno y ruta esencial para nuevos usuarios.',
    href: ROUTES.ARTICLE_DETAIL('orden-cronologico-de-star-wars'),
  },
  {
    title: 'Builds de sangrado despues del parche',
    category: 'Elden Ring',
    replies: '22',
    lastActive: 'Hace 1 h',
    state: 'Soporte',
    summary: 'Ajustes de armas, talismanes y progresion recomendada para jefes tardios.',
    href: ROUTES.ARTICLE_DETAIL('guia-de-las-tierras-intermedias'),
  },
  {
    title: 'Doom es villano, antiheroe o monarca pragmatico?',
    category: 'Marvel',
    replies: '41',
    lastActive: 'Hace 2 h',
    state: 'Debate',
    summary: 'Lectura politica y mistica de Victor Von Doom a traves de sagas clave.',
    href: ROUTES.ARTICLE_DETAIL('quien-es-doctor-doom'),
  },
];

export const FORUM_GUIDELINES = [
  {
    title: 'Marca spoilers',
    detail: 'Incluye arco, temporada o capitulo cuando un hilo discute revelaciones importantes.',
  },
  {
    title: 'Cita el universo',
    detail: 'Conecta la discusion con articulos, personajes o cronologias existentes.',
  },
  {
    title: 'Separa teoria y canon',
    detail: 'Las conclusiones deben distinguir evidencia confirmada de lectura especulativa.',
  },
];

export const FORUM_RADAR = [
  { label: 'Teorias calientes', href: `${ROUTES.SEARCH}?q=teorias`, count: '12 hilos' },
  { label: 'Guias en revision', href: `${ROUTES.SEARCH}?q=guias`, count: '7 hilos' },
  { label: 'Soporte editorial', href: `${ROUTES.SEARCH}?q=revision`, count: '9 casos' },
  { label: 'Ranking semanal', href: ROUTES.RANKING, count: 'top 20' },
];

export const EVENT_PAGE_STATS = [
  { label: 'Eventos', value: '18', detail: 'programados' },
  { label: 'Convenciones', value: '7', detail: 'con agenda geek' },
  { label: 'Torneos', value: '5', detail: 'gaming y trivia' },
  { label: 'Charlas', value: '24', detail: 'lore y creacion' },
];

export const EVENT_CARDS = [
  {
    title: 'Convencion Geek Quito',
    month: 'Jul',
    day: '12',
    type: 'Convencion',
    location: 'Centro de eventos',
    summary: 'Paneles de anime, comics, cosplay y mesas de teoria con colaboradores invitados.',
    href: `${ROUTES.SEARCH}?q=convencion%20geek`,
    image: HOME_IMAGES.hero,
  },
  {
    title: 'Torneo de lore: Elden Ring',
    month: 'Jul',
    day: '24',
    type: 'Gaming',
    location: 'Online',
    summary: 'Ronda de preguntas por regiones, semidioses, finales y objetos clave.',
    href: ROUTES.ARTICLE_DETAIL('guia-de-las-tierras-intermedias'),
    image: HOME_IMAGES.universes['elden ring'],
  },
  {
    title: 'Mesa de lectura: Secret Wars',
    month: 'Ago',
    day: '08',
    type: 'Comics',
    location: 'Discord',
    summary: 'Lectura guiada de incursiones, variantes y consecuencias multiversales.',
    href: ROUTES.COMICS,
    image: HOME_IMAGES.universes.marvel,
  },
];

export const EVENT_TRACKS = [
  {
    step: '01',
    title: 'Agenda principal',
    detail: 'Convenciones, estrenos, torneos y charlas ordenadas por fecha.',
  },
  {
    step: '02',
    title: 'Cobertura editorial',
    detail: 'Cada evento puede generar notas, resumenes, galerias o guias de seguimiento.',
  },
  {
    step: '03',
    title: 'Participacion',
    detail: 'Colaboradores pueden proponer mesas, moderar debates y publicar recapitulaciones.',
  },
];

export const EVENT_RADAR = [
  { label: 'Convenciones', href: `${ROUTES.SEARCH}?q=convencion`, count: '7 fechas' },
  { label: 'Torneos', href: `${ROUTES.SEARCH}?q=torneo`, count: '5 activos' },
  { label: 'Lecturas', href: ROUTES.COMICS, count: '4 clubes' },
  { label: 'Foros', href: ROUTES.FORUMS, count: 'agenda abierta' },
];

export const COLLABORATOR_PAGE_STATS = [
  { label: 'Colaboradores', value: '450+', detail: 'activos este mes' },
  { label: 'Editores', value: '38', detail: 'con permisos avanzados' },
  { label: 'Guias', value: '210', detail: 'publicadas por comunidad' },
  { label: 'XP semanal', value: '86K', detail: 'ganado en conjunto' },
];

export const COLLABORATOR_PROFILES = [
  {
    username: 'AnimeFan',
    displayName: 'AnimeFan',
    role: 'Curadora anime',
    focus: 'Bleach, Dragon Ball y arcos shonen',
    summary: 'Ordena perfiles, transformaciones y relaciones entre sagas de anime.',
    xp: 14250,
    level: 28,
    articleCount: 84,
    rank: 1,
    badge: 'Canon',
    href: ROUTES.PROFILE('AnimeFan'),
  },
  {
    username: 'TheDarkEditor',
    displayName: 'TheDarkEditor',
    role: 'Editor de continuidad',
    focus: 'Batman, Dune y cronologias',
    summary: 'Revisa coherencia de sagas extensas y rutas de lectura para nuevos usuarios.',
    xp: 11230,
    level: 26,
    articleCount: 71,
    rank: 2,
    badge: 'Editor',
    href: ROUTES.PROFILE('TheDarkEditor'),
  },
  {
    username: 'Mugiwara',
    displayName: 'Mugiwara',
    role: 'Analista de teorias',
    focus: 'One Piece y misterios de largo plazo',
    summary: 'Convierte debates de comunidad en articulos con evidencia y enlaces internos.',
    xp: 9870,
    level: 24,
    articleCount: 62,
    rank: 3,
    badge: 'Teorias',
    href: ROUTES.PROFILE('Mugiwara'),
  },
  {
    username: 'NekoGirl',
    displayName: 'NekoGirl',
    role: 'Archivista visual',
    focus: 'Galerias, fichas y multimedia',
    summary: 'Mantiene imagenes, portadas y referencias limpias para paginas de alto trafico.',
    xp: 8450,
    level: 22,
    articleCount: 55,
    rank: 4,
    badge: 'Media',
    href: ROUTES.PROFILE('NekoGirl'),
  },
  {
    username: 'DerianDev',
    displayName: 'DerianDev',
    role: 'Guia de sistemas',
    focus: 'Videojuegos, builds y tecnologia',
    summary: 'Publica rutas jugables, ajustes de balance y explicaciones de sistemas.',
    xp: 8450,
    level: 23,
    articleCount: 49,
    rank: 5,
    badge: 'Guias',
    href: ROUTES.PROFILE('DerianDev'),
  },
];

export const COLLABORATOR_PROGRAMS = [
  {
    title: 'Editor destacado',
    metric: '+600 XP',
    detail: 'Se otorga por mejoras de estructura, enlaces internos y revision de continuidad.',
  },
  {
    title: 'Curador visual',
    metric: '+420 XP',
    detail: 'Premia portadas, galerias y fichas que mejoran la lectura en paginas clave.',
  },
  {
    title: 'Moderador de debate',
    metric: '+360 XP',
    detail: 'Reconoce cierres de hilos, separacion de spoilers y soporte a nuevos usuarios.',
  },
];

export const RANKING_TIERS = [
  { label: 'Top 3', detail: 'Mayor XP y contribuciones recientes', href: ROUTES.COLLABORATORS },
  { label: 'Editores', detail: 'Revision, canon y calidad editorial', href: `${ROUTES.SEARCH}?q=editores` },
  { label: 'Guias', detail: 'Rutas de lectura, builds y ordenes', href: `${ROUTES.SEARCH}?q=guias` },
  { label: 'Debate', detail: 'Foros resueltos y teorias documentadas', href: ROUTES.FORUMS },
];

export function getFallbackCharacterBySlug(slug: string | undefined): CharacterShowcase | undefined {
  return FALLBACK_CHARACTERS.find((character) => character.slug === slug);
}

export function normalizeCharacterForShowcase(character: any, index = 0): CharacterShowcase {
  const fallback = FALLBACK_CHARACTERS[index % FALLBACK_CHARACTERS.length];
  const matched = FALLBACK_CHARACTERS.find((item) => item.slug === character?.slug || item.name === character?.name);

  return {
    ...fallback,
    ...matched,
    id: character?.id || matched?.id || fallback.id,
    name: character?.name || matched?.name || fallback.name,
    slug: character?.slug || matched?.slug || fallback.slug,
    alias: character?.alias ?? matched?.alias ?? fallback.alias,
    description: character?.description || matched?.description || fallback.description,
    imageUrl: character?.imageUrl || matched?.imageUrl || fallback.imageUrl,
    universe: character?.universe || matched?.universe || fallback.universe,
    articleCount: character?.articleCount ?? matched?.articleCount ?? fallback.articleCount,
    updatedAt: character?.updatedAt || matched?.updatedAt || fallback.updatedAt,
  };
}
