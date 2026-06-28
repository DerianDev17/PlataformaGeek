import { test, expect, type Page } from '@playwright/test';

const CONTRIBUTOR = {
  email: 'contributor@nexogeek.test',
  password: 'Cont12345!',
};

const NORMAL_USER = {
  email: 'user@nexogeek.test',
  password: 'User12345!',
};

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/contrase/i).fill(password);
  await page.getByRole('button', { name: /iniciar/i }).click();
  await page.waitForURL('/', { timeout: 5000 }).catch(() => {});
}

test.describe('Article Edit & Delete Flows', () => {
  test.describe('Create Article Access', () => {
    test('EDT-001: Contributor puede acceder a crear artículo', async ({ page }) => {
      await loginAs(page, CONTRIBUTOR.email, CONTRIBUTOR.password);

      await page.goto('/crear/articulo');
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('heading', { name: /crear art/i })).toBeVisible({ timeout: 10000 });
    });

    test('EDT-002: Usuario normal no puede acceder a crear artículo', async ({ page }) => {
      await loginAs(page, NORMAL_USER.email, NORMAL_USER.password);

      await page.goto('/crear/articulo');
      await page.waitForLoadState('networkidle');

      const roleBlocked = page.getByText(/contributor requerido/i);
      const isBlocked = await roleBlocked.isVisible().catch(() => false);
      expect(isBlocked).toBe(true);
    });

    test('EDT-003: Guest es redirigido a login en crear articulo', async ({ page }) => {
      await page.goto('/crear/articulo');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/login\?redirect=%2Fcrear%2Farticulo/);
      await expect(page.getByRole('heading', { name: /iniciar sesi/i })).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Create Article Form Steps', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page, CONTRIBUTOR.email, CONTRIBUTOR.password);
      await page.goto('/crear/articulo');
      await page.waitForLoadState('networkidle');
    });

    test('EDT-004: Form muestra paso 1 con campos requeridos', async ({ page }) => {
      await expect(page.getByLabel(/título del artículo/i)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/selecciona un universo/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /continuar/i })).toBeVisible();
    });

    test('EDT-005: Validación de título vacío al avanzar', async ({ page }) => {
      const continueBtn = page.getByRole('button', { name: /continuar/i });
      await continueBtn.click();

      await expect(page.getByText(/obligatorio/i)).toBeVisible({ timeout: 5000 });
    });

    test('EDT-006: Navegación entre pasos funciona', async ({ page }) => {
      const step1 = page.getByLabel(/paso 1/i).first();
      const step2 = page.getByLabel(/paso 2/i).first();
      await expect(step1).toBeVisible({ timeout: 10000 });

      await step2.click();
      await expect(page.getByRole('button', { name: /volver/i })).toBeVisible();
    });

    test('EDT-007: Modal de descarte muestra cancelar y confirmar', async ({ page }) => {
      const discardBtn = page.getByRole('button', { name: /descartar/i });
      await expect(discardBtn).toBeVisible({ timeout: 10000 });
      await discardBtn.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog.getByRole('button', { name: /cancelar/i })).toBeVisible();
      await expect(dialog.getByRole('button', { name: /descartar todo/i })).toBeVisible();

      await dialog.getByRole('button', { name: /cancelar/i }).click();
      await expect(dialog).not.toBeVisible();
    });
  });

  test.describe('Article Page for Author', () => {
    test('EDT-008: Contributor puede ver artículos existentes', async ({ page }) => {
      await loginAs(page, CONTRIBUTOR.email, CONTRIBUTOR.password);

      await page.goto('/articulos/que-es-el-ultra-instinto');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('main')).toBeVisible({ timeout: 10000 });
    });

    test('EDT-009: Artículo muestra título como h1', async ({ page }) => {
      await page.goto('/articulos/que-es-el-ultra-instinto');
      await page.waitForLoadState('networkidle');

      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible({ timeout: 10000 });
      const text = await h1.innerText();
      expect(text.length).toBeGreaterThan(3);
    });

    test('EDT-010: La ruta de edición está protegida', async ({ page }) => {
      await page.goto('/editar/articulo/que-es-el-ultra-instinto');
      await page.waitForLoadState('networkidle');

      const isProtected = await page.getByText(/404|iniciar sesi|acceso/i).isVisible().catch(() => false);
      expect(isProtected).toBe(true);
    });
  });
});
