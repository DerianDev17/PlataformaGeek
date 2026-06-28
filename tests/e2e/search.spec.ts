import { test, expect } from '@playwright/test';

test.describe('Search Tests', () => {
  test('FUN-SEARCH-001: Buscar por artículo exacto', async ({ page }) => {
    await page.goto('/');
    const searchButton = page.getByLabel(/buscar/i);
    await searchButton.click();
    await page.getByPlaceholder(/buscar universos/i).fill('Ultra Instinto');
    await expect(page.getByText(/ultra instinto/i)).toBeVisible({ timeout: 5000 });
  });

  test('FUN-SEARCH-002: Buscar por universo', async ({ page }) => {
    await page.goto('/');
    const searchButton = page.getByLabel(/buscar/i);
    await searchButton.click();
    await page.getByPlaceholder(/buscar universos/i).fill('Dragon Ball');
    await expect(page.getByText(/dragon ball/i)).toBeVisible({ timeout: 5000 });
  });

  test('FUN-SEARCH-003: Buscar por personaje', async ({ page }) => {
    await page.goto('/');
    const searchButton = page.getByLabel(/buscar/i);
    await searchButton.click();
    await page.getByPlaceholder(/buscar universos/i).fill('Goku');
    await expect(page.getByText(/goku/i)).toBeVisible({ timeout: 5000 });
  });

  test('FUN-SEARCH-005: Búsqueda vacía no consulta API', async ({ page }) => {
    await page.goto('/');
    const searchButton = page.getByLabel(/buscar/i);
    await searchButton.click();
    await page.getByPlaceholder(/buscar universos/i).fill('');
    // Debe mostrar placeholder sin resultados
    await expect(page.getByText(/escribe para buscar/i)).toBeVisible();
    await expect(page.getByText(/sin resultados/i)).not.toBeVisible();
  });

  test('FUN-SEARCH-006: Búsqueda con XSS no ejecuta script', async ({ page }) => {
    await page.goto('/');
    const searchButton = page.getByLabel(/buscar/i);
    await searchButton.click();
    await page.getByPlaceholder(/buscar universos/i).fill('<script>alert("xss")</script>');

    // No debería aparecer alert dialog
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
      throw new Error('Alerta detectada - posible XSS');
    });

    await page.waitForTimeout(1000);
    // Debe mostrar cero resultados o mensaje seguro
    const resultsCount = await page.getByRole('dialog').locator('a').count();
    expect(resultsCount).toBe(0);
  });

  test('FUN-SEARCH-008: Sin resultados muestra empty state', async ({ page }) => {
    await page.goto('/');
    const searchButton = page.getByLabel(/buscar/i);
    await searchButton.click();
    await page.getByPlaceholder(/buscar universos/i).fill('zzzzzzzzzzzzzzzz123456');
    await expect(page.getByText(/no se encontraron resultados/i)).toBeVisible({ timeout: 5000 });
  });
});
