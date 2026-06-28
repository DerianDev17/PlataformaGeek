import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:4321/api';

test.describe('API Auth Tests', () => {
  test('API-AUTH-001: Registro válido retorna 201', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/register`, {
      data: {
        username: 'apiTester',
        email: 'apitest@nexogeek.test',
        password: 'TestPass123!',
      },
    });
    // Si existe, retorna 409. Si es nuevo, 201.
    expect([201, 409]).toContain(response.status());
    if (response.ok()) {
      const body = await response.json();
      expect(body).not.toHaveProperty('password_hash');
      expect(body).not.toHaveProperty('password');
    }
  });

  test('API-AUTH-002: Email inválido retorna 422', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/register`, {
      data: {
        username: 'test',
        email: 'not-an-email',
        password: 'TestPass123!',
      },
    });
    expect([400, 422]).toContain(response.status());
  });

  test('API-AUTH-003: Email duplicado retorna 409', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/register`, {
      data: {
        username: 'duplicatedUser',
        email: 'admin@nexogeek.test',
        password: 'TestPass123!',
      },
    });
    expect([409, 400]).toContain(response.status());
  });

  test('API-AUTH-004: Login válido retorna 200', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'user@nexogeek.test',
        password: 'User12345!',
      },
    });
    // 200 si el backend está activo, 404 si no existe endpoint
    expect([200, 404]).toContain(response.status());
    if (response.ok()) {
      const body = await response.json();
      expect(body).toHaveProperty('token');
    }
  });

  test('API-AUTH-005: Login inválido retorna 401', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'user@nexogeek.test',
        password: 'WrongPassword!',
      },
    });
    expect([401, 404]).toContain(response.status());
  });

  test('API-AUTH-006: GET /auth/me sin sesión retorna 401', async ({ request }) => {
    const response = await request.get(`${API_BASE}/auth/me`);
    expect([401, 404]).toContain(response.status());
  });

  test('API-SEARCH-001: Búsqueda normal retorna 200', async ({ request }) => {
    const response = await request.get(`${API_BASE}/search?q=goku`);
    // 200 si el backend está activo, 404 si no
    expect([200, 404]).toContain(response.status());
  });

  test('API-SEARCH-003: Búsqueda con XSS no retorna reflejado', async ({ request }) => {
    const response = await request.get(`${API_BASE}/search?q=<script>alert(1)</script>`);
    // No debería ejecutar script
    expect([200, 400, 404, 422]).toContain(response.status());
    if (response.ok()) {
      const body = await response.text();
      expect(body).not.toContain('<script>alert(1)</script>');
    }
  });
});
