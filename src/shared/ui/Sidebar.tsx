import { useContext, useEffect, useState, type ReactNode } from 'react';
import { AuthContext, AuthProvider } from '@/app/providers/AuthProvider';
import { ROUTES, getLoginRedirectPath } from '@/shared/constants';
import { CommandSearch } from '@/widgets/command-search';
import { Icon, type IconName } from './Icon';
import { ThemeToggle } from './ThemeToggle';

import { Avatar } from './Avatar';

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
  const user = auth?.user;
  const username = user?.username || '';
  const avatarUrl = user?.avatarUrl || null;
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
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r border-geek-border/80 bg-geek-sidebar-bg/95 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all duration-300 lg:sticky lg:translate-x-0 ${
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
                <Avatar src={avatarUrl} alt={username} size="md" />
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
        <header className="sticky top-0 z-30 border-b border-geek-border/70 bg-geek-topbar-bg/88 backdrop-blur-xl">
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
              <ThemeToggle />
              <a
                href={createArticleHref}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-geek-accent-hover px-4 text-sm font-bold text-white transition-colors hover:bg-geek-accent focus-visible:ring-2 focus-visible:ring-geek-accent"
              >
                <Icon name="plus" className="h-4 w-4" />
                Crear
              </a>
              {authLoading ? (
                <span className="h-10 w-24 rounded-lg border border-geek-border/80 bg-geek-dark-secondary/70" aria-label="Cargando sesion" />
              ) : isAuthenticated ? (
                <>
                  <a
                    href={ROUTES.ACCOUNT}
                    aria-label="Notificaciones (proximamente)"
                    title="Notificaciones - Proximamente"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-geek-border/80 bg-geek-dark-secondary/70 text-geek-text-secondary transition-colors hover:border-geek-accent/60 hover:text-geek-text focus-visible:ring-2 focus-visible:ring-geek-accent"
                  >
                    <Icon name="bell" className="h-5 w-5" />
                  </a>
                  <a
                    href={ROUTES.ACCOUNT}
                    aria-label="Mensajes (proximamente)"
                    title="Mensajes - Proximamente"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-geek-border/80 bg-geek-dark-secondary/70 text-geek-text-secondary transition-colors hover:border-geek-accent/60 hover:text-geek-text focus-visible:ring-2 focus-visible:ring-geek-accent"
                  >
                    <Icon name="mail" className="h-5 w-5" />
                  </a>
                  <a href={profileHref} aria-label="Perfil">
                    <Avatar src={avatarUrl} alt={username} size="md" className="ring-2 ring-geek-accent/30" />
                  </a>
                </>
              ) : (
                <a
                  href={ROUTES.LOGIN}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-geek-accent px-4 text-sm font-bold text-white transition-colors hover:bg-geek-accent-hover focus-visible:ring-2 focus-visible:ring-geek-accent"
                >
                  Iniciar sesion
                </a>
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
