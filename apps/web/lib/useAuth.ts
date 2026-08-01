import { useState, useEffect, useCallback } from 'react';
import { apiRequest, ApiError, AuthResponse, ApiUser, API_ENDPOINTS, storeToken, getToken, clearToken } from '@/lib/api-client';

interface AuthState {
  user: ApiUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await apiRequest<{ user: ApiUser }>(API_ENDPOINTS.auth.me, {
        method: 'GET',
        token,
      });
      setState((s) => ({ ...s, user: data.user }));
    } catch {
      clearToken();
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await apiRequest<AuthResponse>(API_ENDPOINTS.auth.login, {
        method: 'POST',
        body: { email, password },
      });
      storeToken(data.token, data.refreshToken);
      setState({ user: data.user, loading: false, error: null });
    } catch (error) {
      setState({
        user: null,
        loading: false,
        error: error instanceof ApiError ? error.message : 'Login failed',
      });
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'employer'
  ) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await apiRequest<AuthResponse>(API_ENDPOINTS.auth.register, {
        method: 'POST',
        body: { email, password, name, role },
      });
      storeToken(data.token, data.refreshToken);
      setState({ user: data.user, loading: false, error: null });
    } catch (error) {
      setState({
        user: null,
        loading: false,
        error: error instanceof ApiError ? error.message : 'Registration failed',
      });
    }
  };

  const logout = async () => {
    const token = getToken();
    try {
      await apiRequest(API_ENDPOINTS.auth.logout, {
        method: 'POST',
        token,
      });
    } catch {
      // noop
    }
    clearToken();
    setState({ user: null, loading: false, error: null });
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    fetchMe,
  };
}
