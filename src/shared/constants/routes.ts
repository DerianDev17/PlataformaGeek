export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explorar',
  UNIVERSES: '/universos',
  UNIVERSE_DETAIL: (slug: string) => `/universos/${slug}`,
  CHARACTERS: '/personajes',
  CHARACTER_DETAIL: (slug: string) => `/personajes/${slug}`,
  ARTICLES: '/articulos',
  ARTICLE_DETAIL: (slug: string) => `/articulos/${slug}`,
  COMICS: '/comics',
  SERIES: '/series',
  MOVIES: '/peliculas',
  VIDEOGAMES: '/videojuegos',
  TECHNOLOGY: '/tecnologia',
  ANIME: '/anime-manga',
  ACTIVITY: '/actividad',
  FORUMS: '/foros',
  EVENTS: '/eventos',
  COLLABORATORS: '/colaboradores',
  CREATE_ARTICLE: '/crear/articulo',
  EDIT_ARTICLE: (slug: string) => `/editar/articulo/${slug}`,
  LOGIN: '/login',
  REGISTER: '/registro',
  PROFILE: (username: string) => `/perfil/${username}`,
  RANKING: '/ranking',
  ADMIN: '/admin',
  SEARCH: '/buscar',
} as const;

export const PROTECTED_ROUTES = [
  '/crear',
  '/editar',
  '/admin',
];

export function isSafeInternalPath(path: string | null | undefined): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//');
}

export function getLoginRedirectPath(targetPath: string): string {
  const safeTarget = isSafeInternalPath(targetPath) ? targetPath : ROUTES.HOME;
  return `${ROUTES.LOGIN}?redirect=${encodeURIComponent(safeTarget)}`;
}

export function getSafeRedirectPath(search: string): string {
  const redirect = new URLSearchParams(search).get('redirect');
  return isSafeInternalPath(redirect) ? redirect : ROUTES.HOME;
}
