# NexoGeek

> A collaborative geek wiki platform for exploring universes, characters, articles, and theories. Dark-themed dashboard UI with content-driven editorial pages.

[![Status](https://img.shields.io/badge/status-MVP-blueviolet)](#roadmap)
[![Astro](https://img.shields.io/badge/Astro-7.0-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node](https://img.shields.io/badge/node-%E2%89%A522.12-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/tests-226_passing-brightgreen)](#testing)

[Demo](#quick-start) · [Stack](#tech-stack) · [Architecture](#architecture) · [Setup](#quick-start) · [Roadmap](#roadmap)

---

## Overview

**NexoGeek** is a collaborative content platform where fans can browse, write, and discuss geek content across multiple universes (Marvel, DC, Dragon Ball, Star Wars, One Piece, etc.). It ships as a fully static Astro frontend backed by an Express + SQLite API, with a dark dashboard layout, command-palette search, gamification (XP, levels, badges), and a moderation queue.

- **30+ content pages** (universes, characters, articles, theories, editorial hubs)
- **Multi-role auth** (guest, user, contributor, moderator, admin)
- **Article editor** with autosave, draft persistence, and review workflow
- **Comments & voting** with optimistic updates
- **Command palette** (`Ctrl + K`) for instant search
- **Light/dark theme** with `prefers-color-scheme` detection
- **228+ unit tests**, **Playwright E2E**, and **API tests**

---

## Table of contents

- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Testing](#testing)
- [Routes](#routes)
- [User roles & permissions](#user-roles--permissions)
- [Design system](#design-system)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Tech stack

### Frontend

| Layer | Technology | Purpose |
|---|---|---|
| Framework | **Astro 7** (static output) | Page generation, islands architecture |
| UI runtime | **React 19** | Interactive islands |
| Styling | **TailwindCSS 3** | Utility-first CSS with `geek-*` theme tokens |
| Language | **TypeScript** (`strict: true`) | Type safety end-to-end |
| Validation | **Zod 3** | Runtime schemas (shared client/server) |
| Icons | **Lucide** (planned) / inline SVG | Sidebar, status indicators |

### Backend

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | **Node.js 22** | ES modules, native `fetch` |
| Framework | **Express 4** | HTTP server |
| Database | **SQLite** (via `better-sqlite3`) | Embedded, file-based |
| Concurrency | **Worker threads pool** | Off-load reads to N parallel workers |
| Auth | **JWT** (15min access / 7d refresh) | Stateless sessions |
| Hashing | **bcryptjs** (cost 12) | Password storage |
| Security | **Helmet**, **CORS**, **circuit breaker** | Hardening |

### Tooling

| Category | Tool |
|---|---|
| Unit tests | **Vitest** + **Testing Library** + **jsdom** |
| E2E tests | **Playwright** (Chromium, Firefox, mobile Chrome, mobile Safari) |
| Load test | **autocannon** |
| Dev orchestration | **concurrently** |
| Lint/format | **astro check** (TS), **autopep8** (placeholder) |

---

## Architecture

NexoGeek follows a **three-tier** split with **Feature-Sliced Design** on the frontend.

### Top-level

```
nexogeek/
├── src/                    # Astro + React frontend (static output)
├── server/                 # Express + SQLite API
├── tests/                  # Vitest unit + Playwright E2E + API
├── public/                 # Static assets (images, favicon)
├── astro.config.mjs        # Astro + integrations
├── tailwind.config.mjs     # geek-* theme tokens
└── package.json
```

### Frontend layering (Feature-Sliced Design)

```
pages → widgets → features → entities → shared
```

- **`pages/`** — Astro routes (`.astro`), the only entry point.
- **`widgets/`** — Composable UI blocks tied to a route (e.g. `ArticleReader`, `UniverseBrowser`).
- **`features/`** — Business actions exposed to widgets (e.g. `useAuth`, `useComments`, `useVote`).
- **`entities/`** — Domain types and repository contracts (e.g. `Article`, `Universe`, `User`).
- **`shared/`** — Reusable primitives: UI kit, API client, utils, constants. **Must not** import from any other layer.

### Backend layering

```
HTTP request
   ↓
helmet → cors → circuit-breaker → general-rate-limit
   ↓
router (express.Router) — auth, users, universes, articles, characters, ...
   ↓
middleware (auth, authorize, validate) → handler
   ↓
asyncDb (worker pool) ──→ better-sqlite3 (WAL mode)
   ↓
response envelope { success, data, message }
```

The DB driver runs in `os.cpus().length` worker threads with `query_only = true`; writes are serialized through `getDb()` on the main thread to avoid SQLite locking.

### Response envelope

All API responses follow a single shape:

```ts
// Success
{ "success": true,  "data": T,        "message": "OK" }
// Error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "..." } }
```

---

## Project structure

```
src/
├── app/
│   └── providers/           # AuthProvider, AuthContext
├── pages/                   # 30+ routes (see "Routes" below)
│   ├── index.astro
│   ├── login.astro
│   ├── registro.astro
│   ├── cuenta/              # /cuenta — profile editor
│   ├── admin/               # /admin — moderation panel
│   ├── crear/articulo.astro
│   ├── editar/articulo/[slug].astro
│   ├── articulos/[slug].astro
│   ├── universos/[slug].astro
│   ├── personajes/[slug].astro
│   ├── teorias/[slug].astro
│   └── perfil/[username].astro
├── widgets/                 # 15 composable UI blocks
│   ├── activity-feed/       # Sticky sidebar (right rail)
│   ├── admin-panel/         # User mgmt + revision queue
│   ├── article-reader/      # Full article view + comments
│   ├── comments/            # CommentSection
│   ├── command-search/      # Cmd+K palette
│   ├── edit-article/        # /editar/articulo form
│   ├── explore-hub/         # Search + categories + results
│   ├── featured-articles/   # Tabbed (Popular/Recent/Trending/New)
│   ├── hero-home/           # Home hero with animated stats
│   ├── profile-editor/      # /cuenta form
│   ├── theory-detail/
│   ├── universe-browser/    # Filter + sort + view-mode
│   ├── universe-detail/     # Hero + articles + characters + theories
│   ├── universe-grid/
│   └── universe-showcase/
├── features/                # Business actions / hooks
│   ├── auth-login/          # useAuth
│   ├── comment-article/     # useComments
│   ├── create-article/      # useCreateArticle
│   ├── edit-article/        # useEditArticle
│   ├── search-content/      # useSearch (debounced 300ms)
│   └── vote-content/        # useVote
├── entities/                # Domain types
│   ├── article/             # Article, ArticleStatus, ArticleRevision
│   ├── universe/
│   ├── character/
│   ├── user/                # UserRole, UserStatus, ROLE_PERMISSIONS
│   ├── category/
│   ├── tag/
│   └── theory/
└── shared/
    ├── api/                 # apiClient, ApiError
    ├── constants/           # routes.ts, breakpoints, *Showcase data
    ├── lib/                 # date, slug, sanitize, format, pageData
    ├── styles/global.css    # Tailwind base + CSS variables
    └── ui/                  # 20 React primitives (Button, Modal, ...)
```

### Server layout

```
server/src/
├── index.ts                 # Express app entry
├── db/                      # schema, seed, cache, queue, pool, worker
├── routes/                  # 13 route modules
├── middleware/              # auth, authorize, validate, rateLimit, circuitBreaker, errorHandler
├── lib/                     # errors, response, password, slug, sanitize
├── utils/                   # asyncHandler
└── validators/              # Zod schemas
```

---

## Quick start

### Prerequisites

- **Node.js >= 22.12.0** (`.nvmrc` provided)
- **npm** (the lockfile is npm; yarn/pnpm may also work)
- **Windows, macOS, or Linux** — `better-sqlite3` has prebuilt binaries for all major platforms

### Installation

```bash
# 1. Clone
git clone https://github.com/your-org/nexogeek.git
cd nexogeek

# 2. Frontend deps
npm install --legacy-peer-deps

# 3. Backend deps
cd server && npm install --legacy-peer-deps && cd ..

# 4. (Optional) Seed sample data
npm run dev:seed
```

> The `--legacy-peer-deps` flag is **mandatory** for both projects. Astro 7 and `@astrojs/tailwind` v5 have a peer-dep conflict that npm cannot resolve without it.

### Run in development

In one terminal (backend):

```bash
npm run dev:server
# → http://localhost:3001
```

In another terminal (frontend):

```bash
npm run dev
# → http://localhost:4321
```

Or both at once:

```bash
npm run dev:all
```

The frontend proxies `/api/*` to the backend in dev, so you can hit any page at `http://localhost:4321` without CORS hassle.

### Build for production

```bash
# Backend must be running on :3001 during build (pages fetch at build time)
npm run build
# → dist/  (static output, ready for any CDN)
```

Preview the production build locally:

```bash
npm run preview
```

---

## Environment variables

Frontend (`nexogeek/.env.local` — optional):

| Variable | Default | Description |
|---|---|---|
| `HOST` | `localhost` | Astro dev server host |
| `PORT` | `4321` | Astro dev server port |

Backend (`nexogeek/server/.env` — copy from `server/.env.example`):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Express listen port |
| `NODE_ENV` | `development` | `production` enforces stricter checks |
| `CORS_ORIGINS` | `http://localhost:4321,http://localhost:3000` | Comma-separated allowed origins |
| `JWT_SECRET` | dev fallback | Access-token signing secret. **Required in production** — server refuses to start without it. |
| `JWT_REFRESH_SECRET` | dev fallback | Refresh-token signing secret. Same rule. |
| `LOAD_TEST` | `false` | Set to `true` to disable rate limiting (only for load tests) |

---

## Available scripts

### Frontend (`nexogeek/`)

| Script | Action | Workdir |
|---|---|---|
| `npm run dev` | Astro dev server on `:4321` | `nexogeek` |
| `npm run dev:server` | Express API on `:3001` | `nexogeek/server` |
| `npm run dev:all` | Both servers in parallel | `nexogeek` |
| `npm run dev:seed` | Seed sample DB | `nexogeek` |
| `npm run build` | Static build to `dist/` | `nexogeek` |
| `npm run preview` | Preview the production build | `nexogeek` |
| `npm run typecheck` | `astro check` (TS) | `nexogeek` |
| `npm test` | Vitest run (single) | `nexogeek` |
| `npm run test:watch` | Vitest watch mode | `nexogeek` |
| `npm run test:coverage` | Vitest with v8 coverage | `nexogeek` |
| `npm run test:e2e` | Playwright (all projects) | `nexogeek` |
| `npm run test:e2e:ui` | Playwright with UI mode | `nexogeek` |

### Backend (`nexogeek/server/`)

| Script | Action |
|---|---|
| `npm run dev` | `tsx watch src/index.ts` |
| `npm start` | `tsx src/index.ts` (no watch) |
| `npm run seed` | Seed the SQLite DB |
| `npm run typecheck` | `tsc --noEmit` |

---

## Testing

The project has three test layers.

### Unit tests (Vitest + jsdom + Testing Library)

```bash
npm test                          # all
npx vitest run tests/unit/slug    # one file
npm run test:coverage             # with v8 coverage
```

Coverage areas: `shared/ui/*`, `shared/lib/*` (date, slug, sanitize), `entities/user` (ROLE_PERMISSIONS).

### End-to-end (Playwright)

```bash
npm run test:e2e
npm run test:e2e:ui                  # interactive
npx playwright test --project=chromium --grep=@smoke
```

**Projects:** Chromium, Firefox, mobile Chrome (Pixel 5), mobile Safari (iPhone 13).
**Tags:** `@smoke`, `@fast`, `@critical` (filter with `--grep`).
**Base URL:** `http://localhost:4321` (the dev server must be running).

### API tests (Playwright `request` fixture)

```bash
npx playwright test tests/api/
```

Hits `/api/*` through the Vite proxy. The backend **must** be running on `:3001`.

### Test users (seeded)

| Role | Email | Password |
|---|---|---|
| admin | `admin@nexogeek.test` | `Admin123!` |
| moderator | `moderator@nexogeek.test` | `Mod12345!` |
| contributor | `contributor@nexogeek.test` | `Cont12345!` |
| user | `user@nexogeek.test` | `User12345!` |

---

## Routes

All routes are defined in [`src/shared/constants/routes.ts`](src/shared/constants/routes.ts) as a typed `ROUTES` object.

### Public

| Path | Description |
|---|---|
| `/` | Home — hero, stats, featured universes, trending articles, activity feed |
| `/explorar` | Explore hub (search, categories, collections) |
| `/buscar` | Global search results page |
| `/universos` | Universe directory |
| `/universos/[slug]` | Universe detail (hero, articles, characters, theories) |
| `/personajes` | Character directory |
| `/personajes/[slug]` | Character detail |
| `/articulos` | Article directory |
| `/articulos/[slug]` | Article reader (with comments) |
| `/teorias/[slug]` | Theory detail with voting |
| `/perfil/[username]` | Public user profile |
| `/ranking` | XP/level leaderboard |
| `/actividad` | Activity feed |
| `/colaboradores` | Top contributors |
| `/eventos` | Upcoming events |
| `/foros` | Forums (placeholder) |
| `/comics`, `/series`, `/peliculas`, `/videojuegos`, `/tecnologia`, `/anime-manga` | Editorial hubs |

### Editorial (static showcase)

Each has a rich hero with imagery, stats, and CTAs, served from `src/shared/constants/*Showcase.ts`.

### Auth

| Path | Description |
|---|---|
| `/login` | Login (`AuthLayout`, no sidebar) |
| `/registro` | Registration |
| `/cuenta` | Profile editor (`PATCH /api/auth/me`) |

### Authenticated

| Path | Description |
|---|---|
| `/crear/articulo` | Create article (Contributor+) |
| `/editar/articulo/[slug]` | Edit article (owner or Moderator) |

### Admin (Moderator+)

| Path | Description |
|---|---|
| `/admin` | Stats dashboard + user/role management + revision queue |

---

## User roles & permissions

Defined in [`src/entities/user/types.ts`](src/entities/user/types.ts).

| Role | Can read | Can write | Can moderate | Can admin |
|---|---|---|---|---|
| **guest** | ✓ | — | — | — |
| **user** | ✓ | comments | — | — |
| **contributor** | ✓ | articles, comments, revisions | — | — |
| **moderator** | ✓ | ✓ | ✓ (approve/reject revisions, delete content) | — |
| **admin** | ✓ | ✓ | ✓ | ✓ (role assignment) |

Permissions are enforced server-side via `requirePermission(...)` middleware and reflected client-side via `useAuthContext().isRole(...)`.

---

## Design system

### Theme tokens (`tailwind.config.mjs`)

| Token group | Examples |
|---|---|
| **Surfaces** | `geek-dark`, `geek-dark-secondary`, `geek-dark-tertiary`, `geek-light*` |
| **Brand** | `geek-accent`, `geek-accent-hover`, `geek-accent-secondary`, `geek-accent-text` |
| **Status** | `geek-success`, `geek-warning`, `geek-danger` |
| **Text** | `geek-text`, `geek-text-secondary` |
| **Structure** | `geek-border`, `geek-sidebar-bg`, `geek-topbar-bg` |

### Typography

- **Heading:** Space Grotesk
- **Body:** Inter
- **Mono:** JetBrains Mono

### Layout pattern

- **Public pages** use `MainLayout` (sidebar + sticky topbar + command palette).
- **Auth pages** use `AuthLayout` (no sidebar, centered card).
- All pages must validate at `390x844` (mobile) with no horizontal scroll.

### Accessibility

- All images have `alt` (decorative → `alt=""` + `aria-hidden="true"`).
- Form inputs use `<label htmlFor>`; errors have `role="alert"` + `aria-describedby`.
- Modals use the shared `Modal` (focus trap, Escape, `aria-modal`, body scroll lock).
- `prefers-reduced-motion` is respected globally.
- Skip-to-content link in `MainLayout`.

---

## Deployment

### Static frontend

The frontend is pure static output (`output: 'static'`). Deploy `dist/` to any static host:

- **Vercel** / **Netlify** — zero config, just point at `nexogeek/`.
- **GitHub Pages** / **Cloudflare Pages** — build with `npm run build`, publish `dist/`.
- **S3 + CloudFront** / **nginx** — same.

The Vite proxy only works in dev. In production, the static host must serve `/api/*` from the backend (CORS-allowed origin).

### Backend

The backend is a long-lived Node process. Options:

- **Docker** — wrap `node server/src/index.ts` in a minimal image (not yet provided).
- **PM2** / **systemd** — `cd server && npm start`.
- **Fly.io** / **Railway** / **Render** — push the `server/` subfolder.

Required env: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS`, `NODE_ENV=production`.

The SQLite file lives at `server/nexogeek.db`. Mount a persistent volume in production.

### Pre-deploy checklist

- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` set (server refuses to start without them in production).
- [ ] `CORS_ORIGINS` includes the deployed frontend URL.
- [ ] `npm run build` exits 0.
- [ ] Database backed up; migrations (if any) applied.
- [ ] Reverse proxy terminates TLS and forwards `X-Forwarded-For` (the server has `trust proxy = 1`).

---

## Roadmap

This is the current MVP. Tracked improvements:

### Next (P0)
- Backend unit + integration tests (Vitest + Supertest)
- CI pipeline (GitHub Actions: typecheck → unit → build → e2e)
- ESLint + Prettier + `.editorconfig`
- Soft delete + audit log
- Refresh-token rotation (sessions table)

### Soon (P1)
- Image upload pipeline (avatars, covers) with `sharp` optimization
- Real rich-text editor (TipTap or Lexical) replacing the textarea
- Allowlist HTML sanitizer (`sanitize-html` or DOMPurify)
- Email verification + password reset flow
- `astro:assets` for responsive WebP/AVIF images
- Sitemap via `@astrojs/sitemap` (already integrated)

### Later (P2)
- PWA (manifest + service worker via `@vite-pwa/astro`)
- Full i18n (Astro's `i18n` config)
- 2FA / OAuth (Google, GitHub, Discord)
- Real-time notifications (WebSocket / SSE)
- FTS5 search with typo tolerance
- Migration system (drizzle-orm or kysely)

See [`AGENTS.md`](AGENTS.md) for the agent-specific design rules and gotchas.

---

## Contributing

Pull requests are welcome. For substantial changes:

1. Open an issue first to discuss the approach.
2. Fork the repo and create a feature branch (`git checkout -b feat/my-change`).
3. Follow the existing patterns:
   - Feature-Sliced Design for new components
   - `geek-*` theme tokens (no one-off colors)
   - `useState` for `prefers-reduced-motion` listeners
   - Web-first assertions in tests (`toBeVisible()`, no `waitForTimeout`)
4. Run the full validation suite:
   ```bash
   npm run build && npx vitest run && (cd server && npx tsc --noEmit)
   ```
5. Update `AGENTS.md` if you introduce a new gotcha or pattern.
6. Update `README.md` if you change setup, commands, routes, or public behavior.
7. Open a PR with a clear description and screenshots if UI changed.

Commit messages follow the Conventional Commits style (`feat:`, `fix:`, `docs:`, `chore:`).

---

## License

[MIT](LICENSE) © NexoGeek contributors.

---

## Acknowledgments

- Hero imagery in `public/images/home/` is a curated set of CC-licensed placeholders.
- The Feature-Sliced Design pattern keeps the frontend maintainable as features grow.
- Astro's islands architecture keeps the initial bundle small while letting React handle interactive surfaces.
