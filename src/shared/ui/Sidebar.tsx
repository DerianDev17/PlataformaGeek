import { useContext, useEffect, useState, type ReactNode } from 'react';
import { AuthContext, AuthProvider } from '@/app/providers/AuthProvider';
import { ROUTES, getLoginRedirectPath } from '@/shared/constants';
import { CommandSearch } from '@/widgets/command-search';
import { Avatar } from './Avatar';

type IconName =
  | 'home'
  | 'search'
  | 'planet'
  | 'user'
  | 'film'
  | 'gamepad'
  | 'book'
  | 'chip'
  | 'activity'
  | 'message'
  | 'calendar'
  | 'users'
  | 'trophy'
  | 'edit'
  | 'template'
  | 'guide'
  | 'help'
  | 'bell'
  | 'mail'
  | 'plus'
  | 'chevron';

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      { label: 'Inicio', href: ROUTES.HOME, icon: 'home' },
      { label: 'Explorar', href: ROUTES.EXPLORE, icon: 'search' },
      { label: 'Universos', href: ROUTES.UNIVERSES, icon: 'planet' },
      { label: 'Personajes', href: ROUTES.CHARACTERS, icon: 'users' },
      { label: 'Comics', href: ROUTES.COMICS, icon: 'book' },
      { label: 'Series', href: ROUTES.SERIES, icon: 'film' },
      { label: 'Peliculas', href: ROUTES.MOVIES, icon: 'film' },
      { label: 'Videojuegos', href: ROUTES.VIDEOGAMES, icon: 'gamepad' },
      { label: 'Tecnologia', href: ROUTES.TECHNOLOGY, icon: 'chip' },
      { label: 'Anime & Manga', href: ROUTES.ANIME, icon: 'planet' },
    ],
  },
  {
    title: 'Comunidad',
    items: [
      { label: 'Actividad', href: ROUTES.ACTIVITY, icon: 'activity' },
      { label: 'Foros', href: ROUTES.FORUMS, icon: 'message' },
      { label: 'Eventos', href: ROUTES.EVENTS, icon: 'calendar' },
      { label: 'Colaboradores', href: ROUTES.COLLABORATORS, icon: 'users' },
      { label: 'Ranking', href: ROUTES.RANKING, icon: 'trophy' },
    ],
  },
  {
    title: 'Herramientas',
    items: [
      { label: 'Crear articulo', href: ROUTES.CREATE_ARTICLE, icon: 'edit' },
      { label: 'Plantillas', href: `${ROUTES.SEARCH}?q=plantillas`, icon: 'template' },
      { label: 'Guias', href: `${ROUTES.SEARCH}?q=guias`, icon: 'guide' },
      { label: 'Ayuda', href: `${ROUTES.SEARCH}?q=ayuda`, icon: 'help' },
    ],
  },
];

function getNavHref(item: NavItem, isAuthenticated: boolean): string {
  if (item.href === ROUTES.CREATE_ARTICLE && !isAuthenticated) {
    return getLoginRedirectPath(ROUTES.CREATE_ARTICLE);
  }

  return item.href;
}

function parseHref(href: string): { pathname: string; search: string } {
  try {
    const url = new URL(href, 'http://nexogeek.local');
    return { pathname: url.pathname, search: url.search };
  } catch {
    return { pathname: href, search: '' };
  }
}

function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'home':
      return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></svg>;
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="M16.5 16.5 21 21" /></svg>;
    case 'planet':
      return <svg {...common}><circle cx="12" cy="12" r="5" /><path d="M3 12c3-5 15-8 18-3" /><path d="M4 15c4 3 13 4 17-2" /></svg>;
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.8-4 5-6 8-6s6.2 2 8 6" /></svg>;
    case 'film':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 4v16M16 4v16M4 8h4M16 8h4M4 16h4M16 16h4" /></svg>;
    case 'gamepad':
      return <svg {...common}><path d="M7 16h10l2 3c1 1.5 3 .7 2.6-1.1l-1.4-7A5 5 0 0 0 15.3 7H8.7a5 5 0 0 0-4.9 3.9l-1.4 7C2 19.7 4 20.5 5 19l2-3Z" /><path d="M8 11v3M6.5 12.5h3M15 12h.01M18 12h.01" /></svg>;
    case 'book':
      return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" /></svg>;
    case 'chip':
      return <svg {...common}><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" /></svg>;
    case 'activity':
      return <svg {...common}><path d="M4 13h4l2-7 4 14 2-7h4" /></svg>;
    case 'message':
      return <svg {...common}><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.6-5A8 8 0 1 1 21 12Z" /></svg>;
    case 'calendar':
      return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>;
    case 'users':
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></svg>;
    case 'trophy':
      return <svg {...common}><path d="M8 21h8M12 17v4" /><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3" /></svg>;
    case 'edit':
      return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>;
    case 'template':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9h16M9 9v11" /></svg>;
    case 'guide':
      return <svg {...common}><path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 0-4-4V4Z" /><path d="M9 8h6M9 12h5" /></svg>;
    case 'help':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.7 2.7 0 1 1 4.3 2.2c-.9.6-1.8 1.1-1.8 2.3" /><path d="M12 17h.01" /></svg>;
    case 'bell':
      return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>;
    case 'mail':
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
    case 'plus':
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case 'chevron':
      return <svg {...common}><path d="m15 6-6 6 6 6" /></svg>;
    default:
      return null;
  }
}

function IconButton({ label, icon }: { label: string; icon: IconName }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-lg border border-geek-border/80 bg-geek-dark-secondary/70 text-geek-text-secondary transition-colors hover:border-geek-accent/60 hover:text-geek-text focus-visible:ring-2 focus-visible:ring-geek-accent"
    >
      <Icon name={icon} className="h-5 w-5" />
    </button>
  );
}

export default function Sidebar({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SidebarShell>{children}</SidebarShell>
    </AuthProvider>
  );
}

function SidebarShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [locationState, setLocationState] = useState<{ pathname: string; search: string } | null>(null);
  const auth = useContext(AuthContext);
  const username = auth?.user?.username || '';
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const authLoading = auth?.loading ?? false;
  const createArticleHref = isAuthenticated ? ROUTES.CREATE_ARTICLE : getLoginRedirectPath(ROUTES.CREATE_ARTICLE);
  const profileHref = isAuthenticated && username ? ROUTES.PROFILE(username) : ROUTES.LOGIN;

  useEffect(() => {
    const syncLocation = () => {
      setLocationState({ pathname: window.location.pathname, search: window.location.search });
    };

    syncLocation();
    window.addEventListener('popstate', syncLocation);
    return () => window.removeEventListener('popstate', syncLocation);
  }, []);

  const isActive = (href: string) => {
    if (!locationState) return false;

    const target = parseHref(href);
    const current = locationState;

    if (target.search) {
      return current.pathname === target.pathname && current.search === target.search;
    }

    if (target.pathname === ROUTES.HOME) return current.pathname === ROUTES.HOME;
    return current.pathname === target.pathname || current.pathname.startsWith(`${target.pathname}/`);
  };

  return (
    <div className="flex min-h-screen bg-geek-dark text-geek-text">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menu"
        />
      )}

      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-3 z-50 grid h-10 w-10 place-items-center rounded-lg border border-geek-border bg-geek-dark-secondary text-geek-text lg:hidden"
        aria-label="Menu"
        aria-expanded={mobileOpen}
      >
        <span className="sr-only">Menu</span>
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {mobileOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      <nav
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r border-geek-border/80 bg-[#090d17]/95 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 lg:sticky lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[76px]' : 'w-[220px]'}`}
        aria-label="Navegacion principal"
      >
        <div className="flex h-16 items-center gap-3 border-b border-geek-border/80 px-4">
          <a href={ROUTES.HOME} className="flex min-w-0 items-center gap-3" aria-label="NexoGeek inicio">
            <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-geek-accent/15 text-geek-accent">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" strokeWidth="2.2" />
                <path d="M12 7.2 16.5 9.8v4.4L12 16.8l-4.5-2.6V9.8L12 7.2Z" fill="currentColor" opacity=".35" />
              </svg>
            </span>
            {!collapsed && (
              <span className="font-heading text-lg font-bold uppercase tracking-wide text-white">
                Nexo<span className="text-geek-accent">Geek</span>
              </span>
            )}
          </a>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden rounded-md p-1.5 text-geek-text-secondary transition-colors hover:bg-geek-dark-tertiary hover:text-geek-text lg:block"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <Icon name="chevron" className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title || `main-${sectionIndex}`} className={sectionIndex > 0 ? 'mt-5 border-t border-geek-border/70 pt-5' : ''}>
              {section.title && !collapsed && (
                <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-geek-text-secondary/70">
                  {section.title}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const href = getNavHref(item, isAuthenticated);
                  const active = isActive(item.href);
                  return (
                    <a
                      key={item.href}
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-geek-accent ${
                        active
                          ? 'bg-geek-accent/15 text-white shadow-inner shadow-geek-accent/10'
                          : 'text-geek-text-secondary hover:bg-geek-dark-tertiary/90 hover:text-geek-text'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon name={item.icon} className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-geek-border/80 p-3">
          {authLoading ? (
            <div
              className={`flex items-center gap-3 rounded-lg border border-geek-border/80 bg-geek-dark-secondary/70 p-3 ${
                collapsed ? 'justify-center p-2' : ''
              }`}
              aria-label="Cargando sesion"
            >
              <span className="h-10 w-10 rounded-full bg-geek-dark-tertiary" aria-hidden="true" />
              {!collapsed && (
                <span className="min-w-0 flex-1 space-y-2">
                  <span className="block h-3 w-24 rounded bg-geek-dark-tertiary" />
                  <span className="block h-2 w-16 rounded bg-geek-dark-tertiary" />
                </span>
              )}
            </div>
          ) : (
            <a
              href={profileHref}
              className={`flex items-center gap-3 rounded-lg border border-geek-border/80 bg-geek-dark-secondary/70 p-3 transition-colors hover:border-geek-accent/50 ${
                collapsed ? 'justify-center p-2' : ''
              }`}
            >
              {isAuthenticated ? (
                <Avatar src={null} alt={username} size="md" />
              ) : (
                <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-geek-accent/15 text-geek-accent">
                  <Icon name="user" className="h-5 w-5" />
                </span>
              )}
              {!collapsed && (
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-geek-text">
                    {isAuthenticated ? username : 'Iniciar sesion'}
                  </span>
                  <span className="block text-xs text-geek-text-secondary">
                    {isAuthenticated ? 'Perfil activo' : 'Accede a tu cuenta'}
                  </span>
                  {isAuthenticated && (
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-geek-dark">
                      <span className="block h-full w-2/3 rounded-full bg-gradient-to-r from-geek-accent to-geek-accent-secondary" />
                    </span>
                  )}
                </span>
              )}
            </a>
          )}
        </div>
      </nav>

      <main id="main-content" className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-geek-border/70 bg-[#080b13]/88 backdrop-blur-xl">
          <div className="page-container flex min-h-16 items-center gap-4 py-2 pl-16 lg:pl-8">
            <CommandSearch className="mx-auto w-full max-w-[520px]" />
            {!authLoading && !isAuthenticated && (
              <a
                href={ROUTES.LOGIN}
                aria-label="Iniciar sesion"
                className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg border border-geek-border/80 bg-geek-dark-secondary/70 text-geek-text-secondary transition-colors hover:border-geek-accent/60 hover:text-geek-text focus-visible:ring-2 focus-visible:ring-geek-accent md:hidden"
              >
                <Icon name="user" className="h-5 w-5" />
              </a>
            )}
            <div className="ml-auto hidden items-center gap-3 md:flex">
              <a
                href={createArticleHref}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-geek-accent-hover px-4 text-sm font-bold text-white transition-colors hover:bg-geek-accent focus-visible:ring-2 focus-visible:ring-geek-accent"
              >
                <Icon name="plus" className="h-4 w-4" />
                Crear
              </a>
              {authLoading ? (
                <span className="h-10 w-24 rounded-lg border border-geek-border/80 bg-geek-dark-secondary/70" aria-label="Cargando sesion" />
              ) : (
                <>
                  <IconButton label="Notificaciones" icon="bell" />
                  <IconButton label="Mensajes" icon="mail" />
                  <a href={profileHref} aria-label={isAuthenticated ? 'Perfil' : 'Iniciar sesion'}>
                    <Avatar src={null} alt={isAuthenticated ? username : 'Invitado'} size="md" className="ring-2 ring-geek-accent/30" />
                  </a>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="page-container py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
