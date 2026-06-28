# NexoGeek

Plataforma wiki geek colaborativa. Explora universos, personajes, articulos, teorias y rankings en una interfaz oscura moderna.

Documentacion completa del producto en [`nexogeek_docs/`](../nexogeek_docs/).

## Stack

| Capa | Tecnologia |
|---|---|
| Framework | Astro 7 |
| UI | React 19 |
| Estilos | TailwindCSS 3 |
| Lenguaje | TypeScript (strict) |
| Tests unitarios | Vitest + Testing Library |
| Tests E2E | Playwright |
| Validacion | Zod |
| Arquitectura | Clean Architecture + Feature-Sliced Design |

## Estructura

```
src/
  app/          config/, providers/
  pages/        26 rutas (.astro)
  widgets/      hero-home, universe-grid, article-reader, trending-sidebar, command-search
  features/     auth-login, search-content, create-article, edit-article, comment-article, vote-content
  entities/     article, universe, character, user, category, tag, theory
  shared/       ui/ (14 componentes), lib/, api/, styles/, constants/
tests/
  unit/         12 archivos (vitest)
  e2e/          17 archivos (playwright)
  api/          2 archivos (playwright)
```

Regla de dependencia: `pages -> widgets -> features -> entities -> shared`. `shared` no depende de ninguna otra capa.

## Setup

```bash
npm install --legacy-peer-deps
npx playwright install chromium
```

El flag `--legacy-peer-deps` es obligatorio por un conflicto entre Astro 7 y `@astrojs/tailwind` v5.

## Comandos

| Comando | Accion |
|---|---|
| `npm run dev` | Servidor en `localhost:4321` |
| `npm run build` | Build estatico a `dist/` |
| `npm run preview` | Previsualizar build |
| `npx astro check` | Typecheck |
| `npx vitest run` | Tests unitarios |
| `npx vitest run tests/unit/slug.test.ts` | Un solo archivo de test |
| `npx playwright test` | Tests E2E (requiere dev server) |
| `npx playwright test --ui` | Tests E2E con UI |

## Flujo de cambios

Despues de cada lote de cambios se debe validar y sincronizar documentacion:

1. Ejecutar `npm run build`.
2. Ejecutar `npx vitest run`.
3. Ejecutar E2E relevante con `npx playwright test ...` si se tocaron paginas, widgets, rutas, auth o integracion API.
4. Actualizar `AGENTS.md` si cambio el flujo del agente, patrones de diseno, arquitectura, validacion o gotchas.
5. Actualizar `README.md` si cambio setup, comandos, rutas, features principales, estructura o comportamiento publico.

Para cambios solo documentales, no se debe crear un ciclo infinito de actualizaciones: se valida una vez y se reporta el alcance.

## Navegacion

El sidebar principal vive en `src/shared/ui/Sidebar.tsx` y solo debe apuntar a rutas reales. `Personajes`, `Comics`, `Series`, `Peliculas`, `Videojuegos`, `Tecnologia`, `Anime & Manga`, `Actividad`, `Foros`, `Eventos`, `Colaboradores` y `Ranking` tienen paginas editoriales propias; las utilidades pendientes usan el hub existente:

| Item | Destino |
|---|---|
| Explorar | `/explorar` |
| Universos | `/universos` |
| Personajes | `/personajes` |
| Comics | `/comics` |
| Series | `/series` |
| Peliculas | `/peliculas` |
| Videojuegos | `/videojuegos` |
| Tecnologia | `/tecnologia` |
| Anime & Manga | `/anime-manga` |
| Actividad | `/actividad` |
| Foros | `/foros` |
| Eventos | `/eventos` |
| Colaboradores | `/colaboradores` |
| Ranking | `/ranking` |
| Plantillas / Guias / Ayuda | `/buscar?q=...` |

## Autenticacion

`/login` y `/registro` usan `src/layouts/AuthLayout.astro`, sin sidebar ni topbar de dashboard. La barra global del resto de la app mantiene el patron del mockup: `Crear`, notificaciones, mensajes y avatar. Para invitados, `Crear` y el avatar apuntan a login con retorno seguro cuando corresponde; usuarios autenticados ven su perfil real.

Las acciones protegidas para invitados redirigen a login con retorno seguro. Por ejemplo, `Crear` y `/crear/articulo` usan `/login?redirect=%2Fcrear%2Farticulo`, y despues de iniciar sesion el formulario vuelve a la ruta solicitada.

## Usuarios de prueba

| Rol | Email | Password |
|---|---|---|
| admin | admin@nexogeek.test | Admin123! |
| moderator | moderator@nexogeek.test | Mod12345! |
| contributor | contributor@nexogeek.test | Cont12345! |
| user | user@nexogeek.test | User12345! |
