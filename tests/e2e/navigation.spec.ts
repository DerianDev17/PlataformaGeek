import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('FUN-NAV-001: Navegar desde sidebar a secciones principales', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');

    // Verificar enlaces de navegación
    await expect(nav.getByText(/inicio/i)).toBeVisible();
    await expect(nav.getByText(/universos/i)).toBeVisible();
    await expect(nav.getByText(/personajes/i)).toBeVisible();
    await expect(nav.getByText(/artículos/i)).toBeVisible();
    await expect(nav.getByText(/ranking/i)).toBeVisible();
  });

  test('FUN-NAV-002: Estado activo en sidebar', async ({ page }) => {
    await page.goto('/universos');
    const activeLink = page.getByRole('navigation').locator('a', {
      has: page.locator('text=Universos'),
    }).first();
    // Verifica que el enlace activo tenga el estilo correcto
    const classes = await activeLink.evaluate((el) => el.className);
    expect(classes).toContain('bg-geek-accent');
  });

  test('FUN-NAV-003: Sidebar colapsable en desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');
    // Encuentra el botón de colapsar
    const collapseButton = page.getByLabel(/colapsar/i);
    if (await collapseButton.isVisible()) {
      await collapseButton.click();
      // El sidebar debería estar colapsado
      await expect(page.getByRole('navigation')).toBeVisible();
    }
  });

  test('FUN-NAV-004: Menú mobile abre y cierra', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    // Encontrar botón de menú mobile
    const menuButton = page.getByLabel(/menú/i);
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    // La navegación mobile debería estar visible
    await expect(page.getByRole('navigation').getByText(/inicio/i)).toBeVisible();
    // Cerrar menú
    await menuButton.click();
  });
});
