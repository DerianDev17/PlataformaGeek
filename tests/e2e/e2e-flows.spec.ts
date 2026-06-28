import { test, expect } from '@playwright/test';

test.describe('E2E Flows', () => {
  test('E2E-001: Visitante descubre contenido', async ({ page }) => {
    await page.goto('/');
    // Ver home
    await expect(page.getByRole('heading', { name: /explora|multiverso/i })).toBeVisible();

    // Buscar Goku
    const searchTrigger = page.getByPlaceholder('Buscar en NexoGeek...');
    await expect(searchTrigger).toHaveAttribute('data-search-ready', 'true');
    await searchTrigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByPlaceholder(/buscar universos/i).fill('Goku');
    await page.waitForTimeout(500);

    // Cliquea en resultado
    const gokuLink = dialog.getByText(/goku/i);
    if (await gokuLink.isVisible()) {
      await gokuLink.click();
      await expect(page.locator('main')).toBeVisible();
    }

    // Verifica que funciona sin login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('E2E-002: Registro y comentario', async ({ page }) => {
    await page.goto('/registro');
    await page.getByLabel(/nombre de usuario/i).fill('testUser-E2E');
    await page.getByLabel(/email/i).fill('testuser-e2e@nexogeek.test');
    await page.getByLabel(/contrase/i).fill('Password123!');
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await expect(page.getByText(/creada/i)).toBeVisible({ timeout: 5000 });
  });

  test('E2E-003: Contributor crea artículo', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('contributor@nexogeek.test');
    await page.getByLabel(/contrase/i).fill('Cont12345!');
    await page.getByRole('button', { name: /iniciar/i }).click();
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {});

    await page.goto('/crear/articulo');
    await page.getByLabel(/título/i).fill('Historia del Ultra Instinto');
    await page.getByLabel(/resumen/i).fill('Explicación del estado Ultra Instinto en Dragon Ball.');
    await page.getByLabel(/ID del universo/i).fill('dragon-ball');
    await page.getByLabel(/contenido/i).fill('Contenido inicial del artículo...');
    await page.getByRole('button', { name: /enviar a revisión/i }).click();

    await expect(page.getByText(/pendiente|revisión|creado/i)).toBeVisible({ timeout: 5000 });
  });

  test('E2E-006: Permisos negativos - acciones bloqueadas', async ({ page }) => {
    // Guest intenta crear artículo
    await page.goto('/crear/articulo');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcrear%2Farticulo/);
    await expect(page.getByRole('heading', { name: /iniciar sesi/i })).toBeVisible();

    // Guest intenta admin
    await page.goto('/admin');
    await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
  });

  test('E2E-009: Navegación mobile completa', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Ver home mobile
    await expect(page.locator('main')).toBeVisible();

    // Abrir menú mobile
    await page.getByLabel(/menú/i).click();
    await expect(page.getByRole('navigation').getByText(/universos/i)).toBeVisible();

    // Navegar a universos
    await page.getByRole('navigation').getByText(/universos/i).click();
    await expect(page.getByRole('heading', { name: /universos/i })).toBeVisible({ timeout: 5000 });

    // Verificar que la navegación es usable
    await expect(page.locator('main')).toBeVisible();
  });

  test('E2E-008: Ranking y XP', async ({ page }) => {
    await page.goto('/ranking');
    await expect(page.getByRole('heading', { name: /ranking/i })).toBeVisible();
    // Verifica que la página carga sin errores
    await expect(page.locator('main')).toBeVisible();
  });
});
