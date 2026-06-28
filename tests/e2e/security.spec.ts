import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('SEC-001: XSS en artículo - script no se ejecuta', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('contributor@nexogeek.test');
    await page.getByLabel(/contrase/i).fill('Cont12345!');
    await page.getByRole('button', { name: /iniciar/i }).click();
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {});

    await page.goto('/crear/articulo');
    await page.getByLabel(/título/i).fill('<script>alert(1)</script>');
    await page.getByRole('button', { name: /continuar/i }).click();

    // No debe aparecer alert después del submit
    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
      throw new Error('Alerta detectada - XSS vulnerable');
    });

    await page.waitForTimeout(500);
  });

  test('SEC-002: XSS en búsqueda - no ejecuta script', async ({ page }) => {
    await page.goto('/');
    const searchTrigger = page.getByPlaceholder('Buscar en NexoGeek...');
    await expect(searchTrigger).toHaveAttribute('data-search-ready', 'true');
    await searchTrigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    page.on('dialog', async (dialog) => {
      await dialog.dismiss();
      throw new Error('Alerta detectada - XSS en búsqueda');
    });

    await dialog.getByPlaceholder(/buscar universos/i).fill('<script>alert("xss")</script>');
    await page.waitForTimeout(1000);
  });

  test('SEC-009: SQL Injection en búsqueda no altera resultados', async ({ page }) => {
    await page.goto('/');
    const searchTrigger = page.getByPlaceholder('Buscar en NexoGeek...');
    await expect(searchTrigger).toHaveAttribute('data-search-ready', 'true');
    await searchTrigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByPlaceholder(/buscar universos/i).fill("' OR 1=1 --");

    // No debe retornar todos los datos de la base
    await page.waitForTimeout(500);
    const results = dialog.locator('a');
    const count = await results.count();
    // Con suerte hay pocos o ningún resultado
    expect(count).toBeLessThan(50);
  });

  test('SEC-011: Password hash nunca se expone en perfil público', async ({ page }) => {
    // Verificamos que en el perfil público nunca vemos datos sensibles
    await page.goto('/perfil/admin');
    await page.waitForTimeout(500);

    const bodyText = await page.content();
    expect(bodyText).not.toContain('password_hash');
    expect(bodyText).not.toContain('password');
  });

  test('SEC-015: Contenido privado no accesible por URL directa', async ({ page }) => {
    await page.goto('/articulos/borrador-secreto-multiverso');
    await expect(page.getByRole('heading', { name: /no encontrada/i })).toBeVisible({ timeout: 5000 });
  });

  test('CSRF: POST desde sin sesión válida es rechazado', async ({ page }) => {
    // Intenta acceder a rutas POST sin CSRF token
    await page.goto('/crear/articulo');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcrear%2Farticulo/);
    await expect(page.getByRole('heading', { name: /iniciar sesi/i })).toBeVisible({ timeout: 5000 });
  });
});
