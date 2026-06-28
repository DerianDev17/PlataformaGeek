import { test, expect } from '@playwright/test';

test.describe('Smoke Test Suite', () => {
  test('SMK-001: Home carga sin errores', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content h1')).toBeVisible();
    await expect(page.getByPlaceholder('Buscar en NexoGeek...')).toBeVisible();
  });

  test('SMK-002: Sidebar muestra navegacion', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navegacion principal' });
    await expect(nav.getByText('Inicio')).toBeVisible();
    await expect(nav.getByText('Universos')).toBeVisible();
    await expect(nav.getByText('Personajes')).toBeVisible();
  });

  test('SMK-003: Buscador abre sin romper la pagina', async ({ page }) => {
    await page.goto('/');
    const searchTrigger = page.getByPlaceholder('Buscar en NexoGeek...');
    await expect(searchTrigger).toHaveAttribute('data-search-ready', 'true');
    await searchTrigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByPlaceholder(/buscar universos/i)).toBeVisible();
  });

  test('SMK-004: Universos muestra listado', async ({ page }) => {
    await page.goto('/universos');
    await expect(page.getByRole('heading', { name: 'Universos', exact: true })).toBeVisible();
  });

  test('SMK-005: Articulo renderiza contenido', async ({ page }) => {
    await page.goto('/articulos/marvel');
    await expect(page.locator('main')).toBeVisible();
  });

  test('SMK-006: Login muestra formulario', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Iniciar sesion' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Contrasena')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Navegacion principal' })).toHaveCount(0);
    await expect(page.getByPlaceholder('Buscar en NexoGeek...')).toHaveCount(0);
  });

  test('SMK-007: Ruta protegida redirige a login', async ({ page }) => {
    await page.goto('/crear/articulo');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcrear%2Farticulo/);
    await expect(page.getByRole('heading', { name: 'Iniciar sesion' })).toBeVisible();
  });

  test('SMK-008: Home responsive mobile sin scroll horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const main = page.locator('main');
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const pageWidth = page.viewportSize()?.width || 390;
      expect(box.x + box.width).toBeLessThanOrEqual(pageWidth + 1);
    }
  });

  test('SMK-009: SEO - title y meta description existen', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description?.length).toBeGreaterThan(0);
  });

  test('SMK-010: 404 muestra pagina amigable', async ({ page }) => {
    await page.goto('/ruta-que-no-existe');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByRole('heading', { name: /no encontrada/i })).toBeVisible();
  });

  test('SMK-011: Explorar carga hub de descubrimiento', async ({ page }) => {
    await page.goto('/explorar');
    await expect(page.getByRole('heading', { name: 'Explorar' })).toBeVisible();
    await expect(page.getByPlaceholder(/buscar sagas/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Resultados destacados' })).toBeVisible();
  });

  test('SMK-012: Sidebar usa rutas existentes y marca item activo', async ({ page }) => {
    await page.goto('/comics');
    const nav = page.getByRole('navigation', { name: 'Navegacion principal' });

    await expect(nav.getByRole('link', { name: 'Comics' })).toHaveAttribute('href', '/comics');
    await expect(nav.getByRole('link', { name: 'Comics' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Series' })).toHaveAttribute('href', '/series');
    await expect(nav.getByRole('link', { name: 'Peliculas' })).toHaveAttribute('href', '/peliculas');
    await expect(nav.getByRole('link', { name: 'Videojuegos' })).toHaveAttribute('href', '/videojuegos');
    await expect(nav.getByRole('link', { name: 'Tecnologia' })).toHaveAttribute('href', '/tecnologia');
    await expect(nav.getByRole('link', { name: 'Anime & Manga' })).toHaveAttribute('href', '/anime-manga');
    await expect(nav.getByRole('link', { name: 'Actividad' })).toHaveAttribute('href', '/actividad');
    await expect(nav.getByRole('link', { name: 'Foros' })).toHaveAttribute('href', '/foros');
    await expect(nav.getByRole('link', { name: 'Eventos' })).toHaveAttribute('href', '/eventos');
    await expect(nav.getByRole('link', { name: 'Colaboradores' })).toHaveAttribute('href', '/colaboradores');
    await expect(nav.getByRole('link', { name: 'Ranking' })).toHaveAttribute('href', '/ranking');

    const hrefs = await nav.locator('a').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(hrefs).toContain('/series');
    expect(hrefs).toContain('/peliculas');
    expect(hrefs).toContain('/videojuegos');
    expect(hrefs).toContain('/tecnologia');
    expect(hrefs).toContain('/anime-manga');
    expect(hrefs).toContain('/actividad');
    expect(hrefs).toContain('/foros');
    expect(hrefs).toContain('/eventos');
    expect(hrefs).toContain('/colaboradores');
    expect(hrefs).not.toContain('/plantillas');
  });

  test('SMK-013: Topbar invitado mantiene botones del mockup y no perfil falso', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navegacion principal' });
    const header = page.locator('header').first();
    await expect(header.getByRole('link', { name: 'Crear' })).toHaveAttribute('href', '/login?redirect=%2Fcrear%2Farticulo');
    await expect(header.getByLabel('Notificaciones')).toBeVisible();
    await expect(header.getByLabel('Mensajes')).toBeVisible();
    await expect(header.getByRole('link', { name: 'Iniciar sesion' })).toHaveAttribute('href', '/login');
    await expect(header.getByText('Registro')).toHaveCount(0);
    await expect(nav.getByText('DerianDev')).toHaveCount(0);
  });

  test('SMK-014: Series es ruta real y marca item activo', async ({ page }) => {
    await page.goto('/series');
    await expect(page.getByRole('heading', { name: 'Series', exact: true })).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Navegacion principal' });
    await expect(nav.getByRole('link', { name: 'Series' })).toHaveAttribute('aria-current', 'page');
  });

  test('SMK-015: Categorias principales tienen rutas reales activas', async ({ page }) => {
    const routes = [
      { path: '/peliculas', label: 'Peliculas' },
      { path: '/videojuegos', label: 'Videojuegos' },
      { path: '/tecnologia', label: 'Tecnologia' },
      { path: '/anime-manga', label: 'Anime & Manga' },
      { path: '/actividad', label: 'Actividad' },
      { path: '/foros', label: 'Foros' },
      { path: '/eventos', label: 'Eventos' },
      { path: '/colaboradores', label: 'Colaboradores' },
      { path: '/ranking', label: 'Ranking' },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page.getByRole('heading', { name: route.label, exact: true })).toBeVisible();
      const nav = page.getByRole('navigation', { name: 'Navegacion principal' });
      await expect(nav.getByRole('link', { name: route.label })).toHaveAttribute('aria-current', 'page');
    }
  });
});
