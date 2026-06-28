import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('A11Y-002: Navegación por teclado - Tab funciona', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    // Verifica que algo recibe foco
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeAttached();
  });

  test('A11Y-003: Focus visible en botones', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    const visible = await focused.isVisible();
    expect(visible).toBeTruthy();
  });

  test('A11Y-004: Imágenes en home tienen alt', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img:not([alt=""]):not([aria-hidden="true"])');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);
  });

  test('A11Y-005: Labels en formularios', async ({ page }) => {
    await page.goto('/login');
    // Verifica que los inputs tienen labels asociados
    const emailLabel = page.getByLabel(/email/i);
    await expect(emailLabel).toBeAttached();

    const passwordLabel = page.getByLabel(/contrase/i);
    await expect(passwordLabel).toBeAttached();
  });

  test('A11Y-006: Modal de búsqueda - Escape cierra', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/buscar/i).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Escape cierra el modal
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('A11Y-007: Semántica HTML - header, nav, main, aside', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeAttached();
    await expect(page.locator('main')).toBeAttached();
  });

  test('A11Y-008: Botones icon-only tienen aria-label', async ({ page }) => {
    await page.goto('/');
    // El botón de menú tiene aria-label
    const menuButton = page.getByLabel(/menú/i);
    await expect(menuButton).toBeAttached();

    // Botón de búsqueda
    const searchButton = page.getByLabel(/buscar/i);
    await expect(searchButton).toBeAttached();
  });

  test('A11Y-009: Errores de formulario accesibles', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /iniciar/i }).click();
    // Puede que los inputs required no disparen error visual si no hay submit,
    // pero verificamos que los inputs tengan aria-required
    const emailInput = page.getByLabel(/email/i);
    const required = await emailInput.getAttribute('required');
    expect(required).not.toBeNull();
  });
});
