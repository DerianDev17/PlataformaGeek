# NexoGeek — Agent Instructions

## Setup

- `npm install --legacy-peer-deps` is **mandatory** (Astro 7 + `@astrojs/tailwind` v5 peer conflict).
- Node >= 22.12.0. Backend deps: `cd server && npm install --legacy-peer-deps`.

## Stack & Architecture

- **Frontend**: Astro 7 (static output) + React 19 + TailwindCSS 3 (not v4). `astro.config.mjs` proxies `/api` to `localhost:3001`.
- **Backend**: Express + TypeScript + SQLite (better-sqlite3) + JWT + Zod, in `server/`.
- **Feature-Sliced Design**: `@/` → `src/`. Direction: `pages → widgets → features → entities → shared`. `shared` must not import from any other layer.
- **Tailwind**: `tailwind.config.mjs` (v3). Theme tokens are `geek-*` (colors/fonts). Avoid one-off color systems.
- Docs live in `../nexogeek_docs/`.

## Commands

| Purpose | Command | Workdir |
|---|---|---|
| Dev (frontend) | `npm run dev` | `nexogeek` |
| Dev (backend) | `npm run dev` | `nexogeek/server` |
| Both parallel | `npm run dev:all` | `nexogeek` |
| Seed DB | `npm run dev:seed` | `nexogeek` |
| Build | `npm run build` | `nexogeek` (backend must run on :3001) |
| Unit tests | `npx vitest run` | `nexogeek` |
| Single unit | `npx vitest run tests/unit/<file>` | `nexogeek` |
| E2E | `npx playwright test` | `nexogeek` (needs dev server on :4321) |
| API tests | `npx playwright test tests/api/` | `nexogeek` |
| Backend typecheck | `npx tsc --noEmit` | `nexogeek/server` |

Always install with `--legacy-peer-deps`.

---

## MANDATORY: Post-Change Validation

Run in order after **every** code change. Fix and re-run until all pass.

1. `npm run build` (workdir `nexogeek`). Backend must be running on :3001 — start with `cd server && npx tsx src/index.ts &` if needed.
2. `npx vitest run` (workdir `nexogeek`).
3. `npx tsc --noEmit` (workdir `nexogeek/server`) — only if server code changed.
4. `npx playwright test` (workdir `nexogeek`) — only on critical changes (pages, widgets, routing, auth, API integration). Needs both servers running.
5. **Docs sync** before final response:
   - Update `AGENTS.md` if change introduces/changes workflow, design rules, validation, gotchas, or reusable patterns.
   - Update `README.md` if change affects setup, commands, routes, public behavior, or structure.
   - Docs-only changes: run relevant validation once, do not recurse.
   - Final response must state which validation commands ran and whether `AGENTS.md` / `README.md` were updated.
   - If validation cannot run, state the blocker and the exact command still pending.

---

## Critical Gotchas

### Dashboard design pattern (public pages)
All new public pages must mirror Home / Universos / Explorar / universe detail.
- Use `MainLayout` (sidebar + sticky topbar + command search). `AuthLayout` is for `/login` and `/registro` only.
- First viewport = real product: image-backed hero, label, H1, summary, 1-2 CTAs, compact stats panel.
- Keep cards flat and purposeful. Never nest cards-in-cards.
- Palette: `geek-dark`, `geek-dark-secondary`, `geek-border`, `geek-accent`, `geek-accent-secondary`, `geek-text`, `geek-text-secondary`.
- Reuse shared imagery/constants (`HOME_IMAGES`, `FALLBACK_UNIVERSES`, `homeShowcase.ts`, `exploreShowcase.ts`, `marvelShowcase.ts`) before adding new assets. Pages must look complete when `:3001` is down.
- Interactive islands (filters/search) must expose a stable hydration signal: `data-search-ready="true"` or `data-universe-browser-ready="true"` for E2E.
- Validate at `390x844`; no horizontal scroll.

### React islands
- Components using `useState` / `useEffect` / `useMemo` / handlers / context **must** declare a `client:*` directive. Missing directive = inert static HTML.
- `client:load` for UI-only islands. `client:only="react"` for components that read `AuthProvider` or `window` (SSR crashes on missing context).
- Audit every page when adding or moving widgets.

### SSR-safe `window` / `location`
Never read `window.location.search` etc. during initial render — causes hydration mismatches. Read inside `useEffect` (or `typeof window === 'undefined'` guard) and store in state. See `LoginForm` / `RegisterForm`.

### Dynamic routes
All `[slug]` / `[username]` pages **must** export `getStaticPaths()` (output is `static`). Add at least one sample path per new dynamic route.
Use `getSlugPaths()` from `src/shared/lib/staticPaths.ts` for API-backed slug pages so API paths and fallback paths are merged consistently.

### API response format
Backend wraps all responses in `{ success, data, message }`. Astro pages fetch in SSR must unwrap via `json?.data`. Client-side `apiClient.get/post` returns the full envelope — unwrap `.data` in the hook.
For Astro SSR page loads, prefer `loadPageData()` / `loadPageCollection()` from `src/shared/lib/pageData.ts` instead of repeating `fetch(apiUrl(...))` unwrap blocks.

### Data safety
- Optional API arrays: always `data.foo || []` (e.g. `recentArticles`, `featuredCharacters`).
- `formatDate()` / `timeAgo()` already handle `null` / invalid dates (return `"Sin fecha"`).
- `<img onError>`: render the fallback in the DOM unconditionally, swap via a `useState<boolean>` flag (e.g. `imgError`). Never mutate `style.display` directly. Reference: `Avatar`.
- `prefers-reduced-motion`: use `useState` (not `useRef`) so media query changes trigger re-renders; provide static fallback values.

### Auth & routing
- `Sidebar.tsx` wraps its shell in `AuthProvider`. Inside layout chrome, use `useContext(AuthContext)` with a null-check fallback; do not call `useAuthContext()` directly.
- Guest links to protected UI must use `getLoginRedirectPath(<encoded-path>)` → `/login?redirect=...`. Protected pages redirect after auth loading finishes (not an inline prompt).

### Shared UI primitives
- Dialogs: always use the shared `Modal` (`src/shared/ui/Modal.tsx`) — it has focus trap, Escape, `aria-modal`, body-scroll lock, and overlay click. Custom `<div role="dialog" onClick onKeyDown>` without `tabIndex` and focus management is an a11y regression.
- Tab rows: wrap in `role="tablist"`, give each button `role="tab"` + `aria-selected={isActive}`, and update the active panel reactively. Reference: `FeaturedArticles`.
- `forwardRef`: use a `mergeRefs` helper; never mutate `.current` directly across multiple refs.
- Focus rings: `focus-visible:` (not `focus:`) to avoid mouse-click rings. Interactive targets ≥ 24x24px. Form errors use `role="alert"` + `aria-describedby` linking to the input. Grouped form controls use `<fieldset>` + `<legend>`.

---

## Tests

- `tests/unit/` (Vitest + jsdom + `@testing-library/react`). Setup: `tests/unit/setup.ts` (polyfills `IntersectionObserver`, `requestAnimationFrame`, `ResizeObserver`).
- `tests/e2e/` (Playwright: chromium, firefox, mobile-chrome, mobile-safari). Base URL `http://localhost:4321`.
- `tests/api/` (Playwright `request` fixture).
- Test users: `admin@nexogeek.test / Admin123!`, `moderator@nexogeek.test / Mod12345!`, `contributor@nexogeek.test / Cont12345!`, `user@nexogeek.test / User12345!`.
- **Playwright**: `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId`. Web-first assertions (`toBeVisible()`), never `waitForTimeout`. Mobile viewport `393x851`. Tags: `@smoke`, `@fast`, `@critical` (filter with `--grep`).
- **Vitest**: jsdom env, `vi.mock` / `vi.fn` / `vi.spyOn`. Coverage: `npx vitest run --coverage`.

## Accessibility checklist (UI changes)

- Images: `alt` (decorative → `alt=""` + `aria-hidden="true"`).
- Inputs: `<label htmlFor>`. Icons: `aria-hidden` (decorative) or `aria-label` (interactive).
- Modals: `role="dialog"` + `aria-modal="true"` + `aria-label` + focus trap.
- Skip-to-content link present in `MainLayout`.
- WCAG AA contrast (4.5:1 normal, 3:1 large). Respect `prefers-reduced-motion`.

## Key files

- `astro.config.mjs` — Astro 7 + React/Tailwind integrations, Vite `/api` proxy.
- `tailwind.config.mjs` — `geek-*` theme tokens + Space Grotesk / Inter / JetBrains Mono.
- `src/layouts/MainLayout.astro` — dashboard layout (sidebar + topbar).
- `src/shared/ui/Modal.tsx` — shared dialog primitive (always reuse).
- `src/app/providers/AuthProvider.tsx` — Auth context (`AuthProvider` + `AuthContext`).
- `server/src/index.ts` — Express entry (port 3001). `server/src/db/schema.ts` — SQLite schema (12 tables). `server/src/db/seed.ts` — seed data.
- `server/src/middleware/{rateLimiter,errorHandler}.ts`, `server/src/utils/asyncHandler.ts`.
