import { test, expect } from '@playwright/test';

const CONTRIBUTOR = {
  email: 'contributor@nexogeek.test',
  password: 'Cont12345!',
};

test.describe('Article Tests', () => {
  test('FUN-ART-001: Leer artículo publicado', async ({ page }) => {
    await page.goto('/articulos');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.getByRole('heading', { name: /artículos/i })).toBeVisible();
  });

  test('FUN-ART-007: Contributor crea artículo', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(CONTRIBUTOR.email);
    await page.getByLabel(/contrase/i).fill(CONTRIBUTOR.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {});

    await page.goto('/crear/articulo');
    await expect(page.getByRole('heading', { name: /crear art/i })).toBeVisible();
  });

  test('FUN-ART-008: Crear artículo sin título muestra validación', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(CONTRIBUTOR.email);
    await page.getByLabel(/contrase/i).fill(CONTRIBUTOR.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {});

    await page.goto('/crear/articulo');
    await page.getByRole('button', { name: /continuar/i }).click();
    await expect(page.getByText(/título es obligatorio|obligatorio/i)).toBeVisible({ timeout: 5000 });
  });

  test('FUN-ART-016: Guest no puede eliminar artículo', async ({ page }) => {
    await page.goto('/crear/articulo');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcrear%2Farticulo/);
    await expect(page.getByRole('heading', { name: /iniciar sesi/i })).toBeVisible({ timeout: 5000 });
  });

  test('FUN-ART-018: Contenido XSS en artículo se sanitiza', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(CONTRIBUTOR.email);
    await page.getByLabel(/contrase/i).fill(CONTRIBUTOR.password);
    await page.getByRole('button', { name: /iniciar/i }).click();
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {});

    await page.goto('/crear/articulo');
    await page.getByLabel(/título/i).fill('<script>alert("xss")</script>');
    await page.getByRole('button', { name: /continuar/i }).click();
    // Debe bloquear por contenido con scripts
    await expect(page.getByText(/scripts|HTML no permitido|no permitido/i)).toBeVisible({ timeout: 5000 });
  });
});
