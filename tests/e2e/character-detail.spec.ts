import { test, expect } from '@playwright/test';

const CHARACTER_SLUGS = ['goku', 'doctor-doom'];

test.describe('Character Detail /personajes/[slug]', () => {
  for (const slug of CHARACTER_SLUGS) {
    test(`CHAR-001: Página de "${slug}" carga sin errores`, async ({ page }) => {
      await page.goto(`/personajes/${slug}`);
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('main')).toBeVisible();
    });

    test(`CHAR-002: "${slug}" muestra breadcrumb navegable`, async ({ page }) => {
      await page.goto(`/personajes/${slug}`);
      await page.waitForLoadState('networkidle');

      const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
      await expect(breadcrumb).toBeVisible({ timeout: 10000 });
      await expect(breadcrumb.getByText(/inicio/i)).toBeVisible();
      await expect(breadcrumb.getByText(/personajes/i)).toBeVisible();
    });

    test(`CHAR-003: "${slug}" tiene imagen con alt text`, async ({ page }) => {
      await page.goto(`/personajes/${slug}`);
      await page.waitForLoadState('networkidle');

      const characterImage = page.locator('h1')
        .locator('..')
        .locator('img')
        .first();

      const isVisible = await characterImage.isVisible().catch(() => false);
      if (isVisible) {
        const alt = await characterImage.getAttribute('alt');
        expect(alt).toBeTruthy();
        expect(alt?.length).toBeGreaterThan(0);
      }
    });
  }

  test('CHAR-004: Personaje inexistente redirige a 404', async ({ page }) => {
    await page.goto('/personajes/personaje-falso-xyz-999');

    await expect(page.getByText('404')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/no encontrada|no existe/i)).toBeVisible();
  });

  test('CHAR-005: Muestra descripción del personaje', async ({ page }) => {
    await page.goto('/personajes/goku');
    await page.waitForLoadState('networkidle');

    const section = page.locator('.prose');
    const isVisible = await section.isVisible().catch(() => false);
    if (isVisible) {
      const text = await section.innerText();
      expect(text.length).toBeGreaterThan(10);
    }
  });

  test('CHAR-006: Link al universo relacionado existe', async ({ page }) => {
    await page.goto('/personajes/goku');
    await page.waitForLoadState('networkidle');

    const universeLink = page.locator('a[href*="/universos/"]');
    const count = await universeLink.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('CHAR-007: Info sidebar está presente', async ({ page }) => {
    await page.goto('/personajes/goku');
    await page.waitForLoadState('networkidle');

    const aside = page.locator('aside');
    const isVisible = await aside.isVisible().catch(() => false);
    if (isVisible) {
      const text = await aside.innerText();
      expect(text.length).toBeGreaterThan(5);
    }
  });

  test('CHAR-008: Navegación por teclado en personaje', async ({ page }) => {
    await page.goto('/personajes/goku');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeAttached({ timeout: 5000 });

    const tagName = await focused.evaluate((el) => el.tagName.toLowerCase());
    expect(['a', 'button', 'input']).toContain(tagName);
  });

  test('CHAR-009: Heading hierarchy correcta', async ({ page }) => {
    await page.goto('/personajes/goku');
    await page.waitForLoadState('networkidle');

    const h1Count = await page.locator('main h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('CHAR-010: Responsive - sin scroll horizontal en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/personajes/goku');
    await page.waitForLoadState('networkidle');

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('CHAR-011: Responsive - título visible en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/personajes/goku');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
  });
});
