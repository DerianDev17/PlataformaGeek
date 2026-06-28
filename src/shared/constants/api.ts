const HOST = import.meta.env.PUBLIC_API_HOST || 'http://localhost:3001';
const API = '/api';

export function apiUrl(path: string): string {
  return `${HOST}${API}${path}`;
}

export async function fetchApi<T = unknown>(path: string): Promise<{ success: boolean; data: T; message?: string } | null> {
  try {
    const response = await fetch(apiUrl(path));
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}
