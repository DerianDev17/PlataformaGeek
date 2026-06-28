import { test, expect } from '@playwright/test';

test.describe('Home Page Widgets', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Hero stats', () => {
    test('WDG-001: muestra numeros de estadisticas', async ({ page }) => {
      const statContainers = page.locator(
        '#main-content [aria-label*="Articulos"], #main-content [aria-label*="Universos"], #main-content [aria-label*="Personajes"], #main-content [aria-label*="Colaboradores"]'
      );
      await expect(statContainers).toHaveCount(4);
    });

    test('WDG-002: muestra labels principales', async ({ page }) => {
      const main = page.locator('#main-content');
      await expect(main.getByText('Articulos', { exact: true })).toBeVisible({ timeout: 10000 });
      await expect(main.getByText('Universos', { exact: true })).toBeVisible();
      await expect(main.getByText('Personajes', { exact: true })).toBeVisible();
      await expect(main.getByText('Colaboradores', { exact: true })).toBeVisible();
    });

    test('WDG-003: los contadores contienen numeros', async ({ page }) => {
      const firstStat = page.locator('#main-content [aria-label*="Articulos"]');
      await expect(firstStat).toBeVisible({ timeout: 10000 });
      const statText = await firstStat.innerText();
      expect(/\d/.test(statText)).toBe(true);
    });
  });

  test.describe('ActivityFeed', () => {
    test('WDG-004: panel derecho visible en escritorio', async ({ page }) => {
      const aside = page.locator('aside');
      await expect(aside.getByRole('heading', { name: 'Actividad reciente' })).toBeVisible({ timeout: 10000 });
      await expect(aside.getByRole('heading', { name: 'Eventos proximos' })).toBeVisible();
      await expect(aside.getByRole('heading', { name: 'Top colaboradores' })).toBeVisible();
    });

    test('WDG-005: tendencias muestra enlaces de busqueda', async ({ page }) => {
      const trends = page.locator('aside').filter({ has: page.getByRole('heading', { name: 'Tendencias' }) });
      await expect(trends).toBeVisible();
      const items = trends.locator('a[href*="/buscar"]');
      const count = await items.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('WDG-006: ActivityFeed muestra items con metadata', async ({ page }) => {
      const aside = page.locator('aside');
      await expect(aside).toBeVisible({ timeout: 10000 });
      const text = await aside.innerText();
      expect(text.length).toBeGreaterThan(80);
    });

    test('WDG-007: ActivityFeed mantiene heading hierarchy h3', async ({ page }) => {
      const sidebarHeadings = page.locator('aside h3');
      const count = await sidebarHeadings.count();
      expect(count).toBeGreaterThanOrEqual(4);

      for (let i = 0; i < count; i += 1) {
        const heading = sidebarHeadings.nth(i);
        const tagName = await heading.evaluate((el) => el.tagName);
        expect(tagName).toBe('H3');
      }
    });
  });

  test.describe('HeroHome', () => {
    test('WDG-008: HeroHome visible con heading', async ({ page }) => {
      await expect(page.locator('#main-content h1')).toBeVisible({ timeout: 10000 });
    });

    test('WDG-009: HeroHome tiene enlaces CTA', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Explorar universos' })).toBeVisible();
      await expect(page.locator('#main-content').getByRole('link', { name: 'Crear articulo' })).toBeVisible();
    });
  });

  test.describe('Home Mobile Widgets', () => {
    test('WDG-010: stats visibles en movil', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('#main-content').getByText('Universos', { exact: true })).toBeVisible({ timeout: 10000 });
    });

    test('WDG-011: Home sin scroll horizontal en movil', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(hasHorizontalScroll).toBe(false);
    });
  });
});
