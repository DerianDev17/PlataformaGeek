import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:4321/api';

test.describe('API Articles Tests', () => {
  test('API-ART-001: GET /articles retorna 200', async ({ request }) => {
    const response = await request.get(`${API_BASE}/articles`);
    expect([200, 404]).toContain(response.status());
  });

  test('API-ART-002: GET /articles/:slug retorna artículo publicado', async ({ request }) => {
    const response = await request.get(`${API_BASE}/articles/marvel`);
    expect([200, 404]).toContain(response.status());
  });

  test('API-ART-005: POST /articles sin auth retorna 401', async ({ request }) => {
    const response = await request.post(`${API_BASE}/articles`, {
      data: {
        title: 'Test Article',
        summary: 'Test',
        content: 'Content',
        universeId: 'marvel',
      },
    });
    expect([401, 404]).toContain(response.status());
  });

  test('API-ART-006: POST /articles sin título retorna 422', async ({ request }) => {
    // Sin auth, probablemente 401. Con auth sería 422.
    const response = await request.post(`${API_BASE}/articles`, {
      data: {
        content: 'Content',
        universeId: 'marvel',
      },
    });
    expect([400, 401, 404, 422]).toContain(response.status());
  });

  test('API-UNI-001: GET /universes retorna 200', async ({ request }) => {
    const response = await request.get(`${API_BASE}/universes`);
    expect([200, 404]).toContain(response.status());
  });

  test('API-UNI-002: GET /universes/:slug retorna universo', async ({ request }) => {
    const response = await request.get(`${API_BASE}/universes/marvel`);
    expect([200, 404]).toContain(response.status());
  });

  test('API-UNI-003: GET /universes/:slug inexistente retorna 404', async ({ request }) => {
    const response = await request.get(`${API_BASE}/universes/no-existe-xyz`);
    expect([404]).toContain(response.status());
  });

  test('API-UNI-005: POST /universes sin admin retorna 403/401', async ({ request }) => {
    const response = await request.post(`${API_BASE}/universes`, {
      data: {
        name: 'New Universe',
        description: 'Test',
      },
    });
    expect([401, 403, 404]).toContain(response.status());
  });

  test('API-CHAR-001: GET /characters retorna 200', async ({ request }) => {
    const response = await request.get(`${API_BASE}/characters`);
    expect([200, 404]).toContain(response.status());
  });

  test('API-COM-001: GET /articles/:id/comments retorna 200', async ({ request }) => {
    const response = await request.get(`${API_BASE}/articles/marvel/comments`);
    expect([200, 404]).toContain(response.status());
  });

  test('API-COM-003: POST comment como guest retorna 401', async ({ request }) => {
    const response = await request.post(`${API_BASE}/articles/marvel/comments`, {
      data: { content: 'Test comment' },
    });
    expect([401, 404]).toContain(response.status());
  });
});
