import { test, expect } from '@playwright/test';

test.describe('Explore and Universe pages', () => {
  test('EXP-001: /universos muestra catalogo visual y filtros', async ({ page }) => {
    await page.goto('/universos');
    await expect(page.getByRole('heading', { name: 'Universos', exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('Filtrar universos...')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Catalogo de universos' })).toBeVisible();
    await expect(page.locator('#main-content').getByRole('link', { name: /Marvel Destacado Comics/i })).toBeVisible();
  });

  test('EXP-002: filtros de universos reducen resultados', async ({ page }) => {
    await page.goto('/universos');
    const universeFilter = page.getByPlaceholder('Filtrar universos...');
    await expect(universeFilter).toHaveAttribute('data-universe-browser-ready', 'true');
    await universeFilter.fill('Zelda');
    await expect(page.getByRole('link', { name: /Zelda/i })).toBeVisible();
    await expect(page.getByTestId('universe-results').locator('a')).toHaveCount(1);
  });

  test('EXP-003: /explorar acepta query inicial', async ({ page }) => {
    await page.goto('/explorar?q=Elden');
    await expect(page.getByPlaceholder(/buscar sagas/i)).toHaveValue('Elden');
    await expect(page.locator('#main-content a[href="/universos/elden-ring"]').last()).toBeVisible();
  });

  test('EXP-004: /buscar funciona como hub de busqueda', async ({ page }) => {
    await page.goto('/buscar?q=Marvel');
    await expect(page.getByRole('heading', { name: 'Explorar' })).toBeVisible();
    await expect(page.getByPlaceholder(/buscar sagas/i)).toHaveValue('Marvel');
    await expect(page.locator('#main-content').getByRole('link', { name: /Marvel/i }).first()).toBeVisible();
  });

  test('EXP-005: detalle de universo fallback es navegable', async ({ page }) => {
    await page.goto('/universos/marvel');
    await expect(page.getByRole('heading', { name: 'Marvel', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Resumen editorial' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /art.culos recientes/i })).toBeVisible();
  });

  test('EXP-006: /comics muestra pagina editorial propia', async ({ page }) => {
    await page.goto('/comics');
    await expect(page.getByRole('heading', { name: 'Comics' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lecturas clave' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/personajes/doctor-doom"]')).toBeVisible();
  });

  test('EXP-007: /series muestra dossiers y ordenes', async ({ page }) => {
    await page.goto('/series');
    await expect(page.getByRole('heading', { name: 'Series', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dossiers de series' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/articulos/orden-cronologico-de-star-wars"]').first()).toBeVisible();
  });

  test('EXP-008: /personajes muestra catalogo visual', async ({ page }) => {
    await page.goto('/personajes');
    await expect(page.getByRole('heading', { name: 'Personajes', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Catalogo de personajes' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/personajes/doctor-doom"]').first()).toBeVisible();
  });

  test('EXP-009: /peliculas muestra sagas y rutas de visionado', async ({ page }) => {
    await page.goto('/peliculas');
    await expect(page.getByRole('heading', { name: 'Peliculas', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sagas destacadas' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/articulos/orden-cronologico-de-star-wars"]').first()).toBeVisible();
  });

  test('EXP-010: /videojuegos muestra guias jugables', async ({ page }) => {
    await page.goto('/videojuegos');
    await expect(page.getByRole('heading', { name: 'Videojuegos', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Guias jugables' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/articulos/guia-de-las-tierras-intermedias"]').first()).toBeVisible();
  });

  test('EXP-011: /tecnologia muestra analisis destacados', async ({ page }) => {
    await page.goto('/tecnologia');
    await expect(page.getByRole('heading', { name: 'Tecnologia', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Analisis destacados' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/universos/cyberpunk"]').first()).toBeVisible();
  });

  test('EXP-012: /anime-manga muestra arcos destacados', async ({ page }) => {
    await page.goto('/anime-manga');
    await expect(page.getByRole('heading', { name: 'Anime & Manga', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Arcos destacados' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/articulos/linea-temporal-de-dragon-ball-z"]').first()).toBeVisible();
  });

  test('EXP-013: /actividad muestra pulso de comunidad', async ({ page }) => {
    await page.goto('/actividad');
    await expect(page.getByRole('heading', { name: 'Actividad', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pulso de comunidad' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/foros"]').first()).toBeVisible();
  });

  test('EXP-014: /foros muestra debates activos', async ({ page }) => {
    await page.goto('/foros');
    await expect(page.getByRole('heading', { name: 'Foros', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Debates activos' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/articulos/historia-del-siglo-vacio"]').first()).toBeVisible();
  });

  test('EXP-015: /eventos muestra agenda geek', async ({ page }) => {
    await page.goto('/eventos');
    await expect(page.getByRole('heading', { name: 'Eventos', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Agenda geek' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/foros"]').first()).toBeVisible();
  });

  test('EXP-016: /colaboradores muestra equipo destacado', async ({ page }) => {
    await page.goto('/colaboradores');
    await expect(page.getByRole('heading', { name: 'Colaboradores', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Equipo destacado' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/ranking"]').first()).toBeVisible();
  });

  test('EXP-017: /ranking muestra top colaboradores', async ({ page }) => {
    await page.goto('/ranking');
    await expect(page.getByRole('heading', { name: 'Ranking', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Top colaboradores' })).toBeVisible();
    await expect(page.locator('#main-content a[href="/colaboradores"]').first()).toBeVisible();
  });
});
