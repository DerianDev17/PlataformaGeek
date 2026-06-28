import { test, expect } from '@playwright/test';

const KNOWN_USERS = ['admin', 'user', 'contributor'];

test.describe('Profile Page /perfil/[username]', () => {
  for (const username of KNOWN_USERS) {
    test(`PROF-001: Perfil de "${username}" carga sin errores`, async ({ page }) => {
      await page.goto(`/perfil/${username}`);
      await page.waitForLoadState('networkidle');

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });
      await expect(page.locator('main')).toBeVisible();
    });

    test(`PROF-002: Perfil de "${username}" muestra username`, async ({ page }) => {
      await page.goto(`/perfil/${username}`);
      await page.waitForLoadState('networkidle');

      await expect(page.getByText(`@${username}`)).toBeVisible({ timeout: 10000 });
    });

    test(`PROF-003: Perfil de "${username}" muestra stats`, async ({ page }) => {
      await page.goto(`/perfil/${username}`);
      await page.waitForLoadState('networkidle');

      await expect(page.getByText(/artículos/)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/comentarios/)).toBeVisible();
      await expect(page.getByText(/Nivel/)).toBeVisible();
      await expect(page.getByText(/Se unió/)).toBeVisible();
    });

    test(`PROF-004: Perfil de "${username}" muestra badge XP`, async ({ page }) => {
      await page.goto(`/perfil/${username}`);
      await page.waitForLoadState('networkidle');

      await expect(page.getByText(/XP/)).toBeVisible({ timeout: 10000 });
    });
  }

  test('PROF-005: Perfil no existente redirige a 404', async ({ page }) => {
    await page.goto('/perfil/usuario-que-no-existe-xyz-123');

    await expect(page.getByText('404')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/no encontrada|no existe/i)).toBeVisible();
  });

  test('PROF-006: Perfil de contributor muestra artículos', async ({ page }) => {
    await page.goto('/perfil/contributor');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 });

    const contributionsHeading = page.getByRole('heading', { name: /contribuciones/i });
    const articleLinks = page.locator('a[href*="/articulos/"]');

    const hasContributions = await contributionsHeading.isVisible().catch(() => false);
    if (hasContributions) {
      const count = await articleLinks.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  test('PROF-007: Navegación por teclado en perfil', async ({ page }) => {
    await page.goto('/perfil/admin');
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeAttached({ timeout: 5000 });

    const tagName = await focused.evaluate((el) => el.tagName.toLowerCase());
    expect(['a', 'button', 'input']).toContain(tagName);
  });

  test('PROF-008: Avatar visible en perfil', async ({ page }) => {
    await page.goto('/perfil/admin');
    await page.waitForLoadState('networkidle');

    const avatar = page.locator('img[alt]').first();
    await expect(avatar).toBeAttached({ timeout: 10000 });
    const alt = await avatar.getAttribute('alt');
    expect(alt).toBeTruthy();
  });
});
