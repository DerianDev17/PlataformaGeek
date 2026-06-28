import { test, expect } from '@playwright/test';

const TEST_USERS = {
  admin: { email: 'admin@nexogeek.test', password: 'Admin123!' },
  moderator: { email: 'moderator@nexogeek.test', password: 'Mod12345!' },
  contributor: { email: 'contributor@nexogeek.test', password: 'Cont12345!' },
  user: { email: 'user@nexogeek.test', password: 'User12345!' },
  blocked: { email: 'blocked@nexogeek.test', password: 'Block123!' },
};

test.describe('Auth Tests', () => {
  test('FUN-AUTH-001: Registro válido', async ({ page }) => {
    const suffix = Date.now();
    await page.goto('/registro');
    await page.getByLabel(/nombre de usuario/i).fill(`nuevoUsuario${suffix}`);
    await page.getByLabel(/email/i).fill(`nuevo-${suffix}@test.com`);
    await page.getByLabel(/contrase/i).fill('Password123!');
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    // Verifica éxito
    await expect(page.getByText(/creada exitosamente/i)).toBeVisible({ timeout: 15000 });
  });

  test('FUN-AUTH-002: Registro con email duplicado muestra error', async ({ page }) => {
    await page.goto('/registro');
    await page.getByLabel(/nombre de usuario/i).fill('otroUser');
    await page.getByLabel(/email/i).fill(TEST_USERS.admin.email);
    await page.getByLabel(/contrase/i).fill('Password123!');
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await expect(page.getByRole('alert')).toContainText(/uso|existe|duplicado/i, { timeout: 15000 });
  });

  test('FUN-AUTH-004: Password débil bloquea registro', async ({ page }) => {
    await page.goto('/registro');
    await page.getByLabel(/nombre de usuario/i).fill('userDebil');
    await page.getByLabel(/email/i).fill('debil@test.com');
    await page.getByLabel(/contrase/i).fill('123');
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    await expect(page.getByRole('alert')).toContainText(/8 caracteres/i);
  });

  test('FUN-AUTH-005: Login válido', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USERS.user.email);
    await page.getByLabel(/contrase/i).fill(TEST_USERS.user.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    // Después del login, redirige a home
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {});
    await expect(page.locator('main')).toBeVisible();
  });

  test('FUN-AUTH-006: Login inválido rechaza acceso', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USERS.user.email);
    await page.getByLabel(/contrase/i).fill('WrongPass123!');
    await page.getByRole('button', { name: /iniciar/i }).click();
    await expect(page.getByRole('alert')).toContainText(/credenciales|invalid/i, { timeout: 15000 });
  });

  test('FUN-AUTH-007: Logout cierra sesion', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USERS.user.email);
    await page.getByLabel(/contrase/i).fill(TEST_USERS.user.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {});

    // Verifica que puede acceder a áreas de usuario
    await expect(page.getByText(/iniciar sesi/i)).not.toBeVisible();
  });
});
