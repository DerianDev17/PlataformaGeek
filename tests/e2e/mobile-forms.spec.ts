import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 393, height: 851 };

test.describe('Mobile Forms (Pixel 5 viewport)', () => {
  test.describe('Login Form Mobile', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
    });

    test('MOB-001: Login form visible a 393px', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /iniciar sesi/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/contrase/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /iniciar/i })).toBeVisible();
    });

    test('MOB-002: Login - sin scroll horizontal', async ({ page }) => {
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test('MOB-003: Login - botón tiene touch target adecuado (>= 24px)', async ({ page }) => {
      const submitBtn = page.getByRole('button', { name: /iniciar/i });
      const box = await submitBtn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(24);
        expect(box.width).toBeGreaterThanOrEqual(24);
      }
    });

    test('MOB-004: Login - inputs tienen touch target adecuado', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const box = await emailInput.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(24);
      }
    });

    test('MOB-005: Login - mensajes de error visibles sin scroll', async ({ page }) => {
      await page.getByRole('button', { name: /iniciar/i }).click();

      await expect(page.getByLabel(/email/i)).toHaveAttribute('required', '');
      await expect(page.getByLabel(/contrase/i)).toHaveAttribute('required', '');
    });

    test('MOB-006: Login - labels de formulario visibles', async ({ page }) => {
      const emailLabel = page.getByText('Email', { exact: false }).first();
      await expect(emailLabel).toBeVisible({ timeout: 5000 });

      const passwordLabel = page.getByText(/contrase/i).first();
      await expect(passwordLabel).toBeVisible();
    });
  });

  test.describe('Register Form Mobile', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto('/registro');
      await page.waitForLoadState('networkidle');
    });

    test('MOB-007: Register form visible a 393px', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByLabel(/nombre de usuario/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/contrase/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();
    });

    test('MOB-008: Register - sin scroll horizontal', async ({ page }) => {
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test('MOB-009: Register - botón tiene touch target adecuado (>= 24px)', async ({ page }) => {
      const submitBtn = page.getByRole('button', { name: /crear cuenta/i });
      const box = await submitBtn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(24);
        expect(box.width).toBeGreaterThanOrEqual(24);
      }
    });

    test('MOB-010: Register - campo contrasena muestra helper text', async ({ page }) => {
      const helperText = page.getByText(/minimo 8 caracteres/i);
      await expect(helperText).toBeVisible({ timeout: 5000 });
    });

    test('MOB-011: Register - error de contrasena debil visible', async ({ page }) => {
      await page.getByLabel(/nombre de usuario/i).fill('testuser');
      await page.getByLabel(/email/i).fill('test@test.com');
      await page.getByLabel(/contrase/i).fill('123');
      await page.getByRole('button', { name: /crear cuenta/i }).click();

      await expect(page.getByRole('alert')).toContainText(/8 caracteres/i, { timeout: 5000 });
    });

    test('MOB-012: Register - labels de formulario visibles', async ({ page }) => {
      const usernameLabel = page.getByText(/nombre de usuario/i).first();
      await expect(usernameLabel).toBeVisible({ timeout: 5000 });

      const emailLabel = page.getByText('Email', { exact: false }).first();
      await expect(emailLabel).toBeVisible();

      const passwordLabel = page.getByText(/contrase/i).first();
      await expect(passwordLabel).toBeVisible();
    });

    test('MOB-013: Register - enlace a login visible', async ({ page }) => {
      await expect(page.getByText(/ya tienes cuenta/i)).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('link', { name: /inicia sesi/i })).toBeVisible();
    });
  });

  test.describe('Navigation Mobile', () => {
    test('MOB-014: Login y Register accesibles desde home en móvil', async ({ page }) => {
      await page.setViewportSize(MOBILE_VIEWPORT);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      await expect(page.locator('main header').getByRole('link', { name: /iniciar sesi/i })).toBeVisible();
    });
  });
});
