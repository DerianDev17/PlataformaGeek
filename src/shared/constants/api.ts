const HOST = import.meta.env.PUBLIC_API_HOST || 'http://localhost:3001';
const API = '/api';

export function apiUrl(path: string): string {
  return `${HOST}${API}${path}`;
}

export function fetchApi<T = unknown>(path: string): Promise<{ success: boolean; data: T; message?: string } | null> {
  return fetch(apiUrl(path))
    .then(r => r.ok ? r.json() : null)
    .catch(() => null);
}
