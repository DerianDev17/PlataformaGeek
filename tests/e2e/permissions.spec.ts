import { test, expect } from '@playwright/test';

test.describe('Permission Tests', () => {
  test('FUN-MOD-004: Contributor no puede aprobar revisiones - acceso admin denegado', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('contributor@nexogeek.test');
    await page.getByLabel(/contrase/i).fill('Cont12345!');
    await page.getByRole('button', { name: /iniciar/i }).click();
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {});

    // Contributor intenta acceder al admin
    await page.goto('/admin');
    // Debe ser bloqueado
    await expect(page.getByText(/404|no encontrada|no existe/i)).toBeVisible({ timeout: 5000 });
  });

  test('FUN-ADMIN-002: User normal no puede acceder a admin', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('user@nexogeek.test');
    await page.getByLabel(/contrase/i).fill('User12345!');
    await page.getByRole('button', { name: /iniciar/i }).click();
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {});

    await page.goto('/admin');
    await expect(page.getByText(/404|no encontrada|no existe|denegado/i)).toBeVisible({ timeout: 5000 });
  });

  test('FUN-ADMIN-001: Admin accede al panel', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@nexogeek.test');
    await page.getByLabel(/contrase/i).fill('Admin123!');
    await page.getByRole('button', { name: /iniciar/i }).click();
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {});

    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: /panel de administración|admin/i })).toBeVisible({ timeout: 5000 });
  });

  test('GUEST: no puede crear artículo', async ({ page }) => {
    await page.goto('/crear/articulo');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcrear%2Farticulo/);
    await expect(page.getByRole('heading', { name: /iniciar sesi/i })).toBeVisible();
  });

  test('GUEST: no puede acceder a admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText(/404|no encontrada|no existe/i)).toBeVisible({ timeout: 5000 });
  });

  test('SEC-015: Guest no puede ver borrador por URL directa', async ({ page }) => {
    await page.goto('/articulos/borrador-secreto-multiverso');
    await expect(page.getByText('404')).toBeVisible({ timeout: 5000 });
  });
});
