export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export function success<T>(data: T, message = 'Operación realizada correctamente'): ApiResponse<T> {
  return { success: true, data, message };
}

export function error(code: string, message: string, details?: unknown[]): ApiErrorResponse {
  return { success: false, error: { code, message, details } };
}
