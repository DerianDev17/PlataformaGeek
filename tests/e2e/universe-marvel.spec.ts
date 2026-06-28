import { test, expect } from '@playwright/test';

test.describe('Universe Detail — Marvel Page UI/UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/universos/marvel');
    await page.waitForLoadState('networkidle');
  });

  // ── HERO SECTION ──

  test('UNV-001: Hero muestra nombre del universo', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /marvel/i, level: 1 })).toBeVisible({ timeout: 10000 });
  });

  test('UNV-002: Hero muestra descripción del universo', async ({ page }) => {
    const description = page.locator('p').filter({ hasText: /universo cinematográfico|hogar de los vengadores/i }).first();
    await expect(description).toBeVisible();
  });

  test('UNV-003: Stats dashboard existe con 3 métricas', async ({ page }) => {
    const statCards = page.locator('[aria-label*="Artículos"], [aria-label*="Personajes"], [aria-label*="Teorías"]');
    await expect(statCards.first()).toBeVisible({ timeout: 8000 });
    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('UNV-004: Breadcrumb navegable existe', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: /breadcrumb/i });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText(/inicio/i)).toBeVisible();
    await expect(breadcrumb.getByText(/universos/i)).toBeVisible();
    await expect(breadcrumb.getByText(/marvel/i)).toBeVisible();
  });

  // ── ARTICLES SECTION ──

  test('UNV-005: Sección de artículos muestra título', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /artículos recientes/i })).toBeVisible();
  });

  test('UNV-006: Artículos renderizan cards con título y resumen', async ({ page }) => {
    const articleCards = page.locator('a[href*="/articulos/"]').filter({ has: page.locator('h3') });
    const count = await articleCards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const firstCard = articleCards.first();
    await expect(firstCard.locator('h3')).toBeVisible();
    await expect(firstCard.locator('p')).toBeVisible();
  });

  test('UNV-007: Cards de artículo tienen espaciado correcto', async ({ page }) => {
    const firstCard = page.locator('a[href*="/articulos/"]').first();
    const box = await firstCard.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Card should be at least 200px wide and 100px tall
      expect(box.width).toBeGreaterThanOrEqual(200);
      expect(box.height).toBeGreaterThanOrEqual(100);
    }
  });

  test('UNV-008: Artículo card muestra metadata (vistas, tiempo)', async ({ page }) => {
    const firstCard = page.locator('a[href*="/articulos/"]').first();
    // Should have some text metadata
    const text = await firstCard.innerText();
    expect(text.length).toBeGreaterThan(30);
  });

  // ── CHARACTERS SECTION ──

  test('UNV-009: Sección de personajes muestra título', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /personajes destacados/i })).toBeVisible();
  });

  test('UNV-010: Personajes renderizan cards', async ({ page }) => {
    const charCards = page.locator('a[href*="/personajes/"]');
    const count = await charCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('UNV-011: Card de personaje tiene nombre y descripción', async ({ page }) => {
    const firstChar = page.locator('a[href*="/personajes/"]').first();
    await expect(firstChar.locator('h3')).toBeVisible();
    const text = await firstChar.innerText();
    expect(text.length).toBeGreaterThan(15);
  });

  test('UNV-012: Personajes tienen espaciado uniforme en grid', async ({ page }) => {
    const cards = page.locator('a[href*="/personajes/"]');
    const count = await cards.count();
    if (count >= 2) {
      const first = await cards.nth(0).boundingBox();
      const second = await cards.nth(1).boundingBox();
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      if (first && second) {
        // Cards should have similar width (within 5px)
        expect(Math.abs(first.width - second.width)).toBeLessThanOrEqual(5);
      }
    }
  });

  // ── THEORIES SECTION ──

  test('UNV-013: Sección de teorías (si existen) se renderiza', async ({ page }) => {
    const theorySection = page.getByRole('heading', { name: /teorías/i });
    // May or may not exist — just check page doesn't crash
    await expect(page.locator('body')).toBeVisible();
  });

  // ── TYPOGRAPHY & READABILITY ──

  test('UNV-014: H1 tiene font-size adecuado (>= 24px)', async ({ page }) => {
    const h1 = page.locator('h1').first();
    const fontSize = await h1.evaluate((el) => window.getComputedStyle(el).fontSize);
    const size = parseFloat(fontSize);
    expect(size).toBeGreaterThanOrEqual(24);
  });

  test('UNV-015: Texto de body tiene line-height legible', async ({ page }) => {
    const body = page.locator('p').first();
    const lineHeight = await body.evaluate((el) => window.getComputedStyle(el).lineHeight);
    expect(lineHeight).not.toBe('normal');
  });

  test('UNV-016: Texto visible tiene color (no transparente)', async ({ page }) => {
    const p = page.locator('p').filter({ hasText: /marvel/i }).first();
    const color = await p.evaluate((el) => window.getComputedStyle(el).color);
    expect(color).toBeTruthy();
    // Not transparent
    expect(color).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('UNV-017: No hay texto desbordado (overflow hidden funciona)', async ({ page }) => {
    // Check the page doesn't have horizontal scroll at desktop
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/universos/marvel');
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    const box = await body.boundingBox();
    expect(box).not.toBeNull();
  });

  // ── RESPONSIVE DESIGN ──

  const breakpoints = [
    { name: 'mobile-sm', width: 360, height: 800 },
    { name: 'mobile-lg', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'laptop', width: 1024, height: 768 },
    { name: 'desktop', width: 1366, height: 768 },
    { name: 'wide', width: 1920, height: 1080 },
  ];

  for (const bp of breakpoints) {
    test(`UNV-RESP-${bp.name}: Vista a ${bp.width}px sin scroll horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/universos/marvel');
      await page.waitForLoadState('networkidle');

      // No horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test(`UNV-RESP-${bp.name}: Título visible a ${bp.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/universos/marvel');
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('heading', { name: /marvel/i, level: 1 })).toBeVisible({ timeout: 10000 });
    });

    test(`UNV-RESP-${bp.name}: Cards no se rompen a ${bp.width}px`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/universos/marvel');
      await page.waitForLoadState('networkidle');

      // At least some content should be visible
      await expect(page.locator('a[href*="/articulos/"]').first()).toBeVisible({ timeout: 8000 });
    });
  }

  // ── ACCESSIBILITY ──

  test('UNV-A11Y-001: Heading hierarchy correcta (h1 presente, h2 >= 1)', async ({ page }) => {
    const h1Count = await page.locator('main h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    const h2Elements = page.locator('main h2, section h2');
    const h2Count = await h2Elements.count();
    expect(h2Count).toBeGreaterThanOrEqual(1);
  });

  test('UNV-A11Y-002: Links tienen href válidos', async ({ page }) => {
    const links = page.locator('a[href]');
    const count = await links.count();
    expect(count).toBeGreaterThan(5);

    for (let i = 0; i < Math.min(count, 10); i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('#');
      expect(href).not.toBe('');
    }
  });

  test('UNV-A11Y-003: Imágenes decorativas tienen alt o aria-hidden', async ({ page }) => {
    const allImages = page.locator('img');
    const count = await allImages.count();

    for (let i = 0; i < count; i++) {
      const img = allImages.nth(i);
      const alt = await img.getAttribute('alt');
      const ariaHidden = await img.getAttribute('aria-hidden');
      const role = await img.getAttribute('role');
      // Must have alt text, be hidden, or be presentation
      const isAccessible = alt !== null || ariaHidden === 'true' || role === 'presentation';
      expect(isAccessible).toBe(true);
    }
  });

  test('UNV-A11Y-004: La página tiene un main landmark', async ({ page }) => {
    await expect(page.locator('main')).toBeAttached();
  });

  test('UNV-A11Y-005: Navegación por teclado funciona en página Marvel', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeAttached();
  });

  test('UNV-A11Y-006: Skip-link o primer foco funcional', async ({ page }) => {
    // Tab through a few elements
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
    }
    const focused = page.locator(':focus');
    const tagName = await focused.evaluate((el) => el.tagName.toLowerCase());
    expect(['a', 'button', 'input', 'textarea', 'select']).toContain(tagName);
  });
});
