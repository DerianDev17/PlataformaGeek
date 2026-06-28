import { useState, useEffect, useCallback } from 'react';
import type { AuthUser, LoginDTO, RegisterDTO } from '@/entities/user';
import { apiClient } from '@/shared/api';

const AUTH_KEY = 'nexogeek_auth';

type AuthApiPayload = {
  user: Omit<AuthUser, 'token' | 'refreshToken'>;
  token: string;
  refreshToken?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

function unwrapAuthUser(response: AuthApiPayload | ApiResponse<AuthApiPayload>): AuthUser {
  const payload = 'data' in response ? response.data : response;
  return {
    ...payload.user,
    token: payload.token,
    refreshToken: payload.refreshToken,
  };
}

function unwrapTokens(response: Pick<AuthUser, 'token' | 'refreshToken'> | ApiResponse<Pick<AuthUser, 'token' | 'refreshToken'>>) {
  return 'data' in response ? response.data : response;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (data: LoginDTO): Promise<void> => {
    const response = await apiClient.post<AuthApiPayload | ApiResponse<AuthApiPayload>>('/auth/login', data);
    const authUser = unwrapAuthUser(response);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const register = useCallback(async (data: RegisterDTO): Promise<void> => {
    const response = await apiClient.post<AuthApiPayload | ApiResponse<AuthApiPayload>>('/auth/register', data);
    const authUser = unwrapAuthUser(response);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', {}, user?.token);
    } catch {
      // logout even if API fails
    }
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, [user]);

  const refreshSession = useCallback(async (): Promise<void> => {
    if (!user?.refreshToken) {
      setUser(null);
      localStorage.removeItem(AUTH_KEY);
      return;
    }
    try {
      const response = await apiClient.post<Pick<AuthUser, 'token' | 'refreshToken'> | ApiResponse<Pick<AuthUser, 'token' | 'refreshToken'>>>('/auth/refresh', {
        refreshToken: user.refreshToken,
      });
      const tokens = unwrapTokens(response);
      const refreshed = { ...user, ...tokens };
      localStorage.setItem(AUTH_KEY, JSON.stringify(refreshed));
      setUser(refreshed);
    } catch {
      setUser(null);
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  const isAuthenticated = !!user && user.status === 'active';
  const isRole = useCallback(
    (...roles: string[]) => !!user && roles.includes(user.role),
    [user]
  );

  return {
    user,
    loading,
    isAuthenticated,
    isRole,
    login,
    register,
    logout,
    refreshSession,
  };
}
