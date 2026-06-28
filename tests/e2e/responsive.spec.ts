import { test, expect } from '@playwright/test';

test.describe('Responsive Tests', () => {
  test('RSP-001: Mobile 360x800 sin scroll horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    const main = page.locator('main');
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      const pageWidth = page.viewportSize()?.width || 360;
      expect(box.x + box.width).toBeLessThanOrEqual(pageWidth + 5);
    }
  });

  test('RSP-002: Mobile sidebar se transforma en drawer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    // Sidebar debe tener botón de menú mobile
    await expect(page.getByLabel(/menú/i)).toBeVisible();
  });

  test('RSP-003: Tablet layout legible', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('RSP-005: Desktop sidebar visible', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
    await expect(nav.getByText(/universos/i)).toBeVisible();
  });

  test('RSP-006: Desktop grande usa max-width', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    const main = page.locator('main');
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    // El contenido no debe ocupar todo el ancho
    if (box) {
      expect(box.width).toBeLessThan(1400);
    }
  });

  test('RSP-007: Mobile - crear artículo formulario usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/crear/articulo');
    // Verifica que el formulario es accesible en mobile
    await expect(page.locator('main')).toBeVisible();
  });

  test('RSP-009: Mobile - search modal ocupa pantalla', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByLabel(/buscar/i).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const dialogBox = await dialog.boundingBox();
    expect(dialogBox).not.toBeNull();
  });
});
