type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  token?: string | null;
};

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, token } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new ApiError(response.status, error.message || error.error?.message || 'Error de API');
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  get<T>(endpoint: string, token?: string | null) {
    return this.request<T>(endpoint, { token });
  }

  post<T>(endpoint: string, body?: unknown, token?: string | null) {
    return this.request<T>(endpoint, { method: 'POST', body, token });
  }

  patch<T>(endpoint: string, body?: unknown, token?: string | null) {
    return this.request<T>(endpoint, { method: 'PATCH', body, token });
  }

  delete<T>(endpoint: string, token?: string | null) {
    return this.request<T>(endpoint, { method: 'DELETE', token });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = new ApiClient();
