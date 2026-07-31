import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@skillbridge/types';
import { apiRequest, ApiError } from '../services/api';
import { API_ENDPOINTS } from '../config';

// Mirror the API's user shape (id, email, name, role)
type ApiUser = User;

interface AuthState {
  user: ApiUser | null;
  token: string | null;
  refreshToken: string | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'employer'
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateUser: (userData: Partial<ApiUser>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      initialized: false,
      loading: false,
      error: null,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const data = await apiRequest<{
            user: ApiUser;
            token: string;
            refreshToken: string;
          }>(API_ENDPOINTS.auth.login, {
            method: 'POST',
            body: { email, password },
          });

          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            initialized: true,
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof ApiError ? error.message : 'Login failed',
            loading: false,
            initialized: true,
          });
        }
      },

      register: async (email, password, name, role) => {
        set({ loading: true, error: null });
        try {
          const data = await apiRequest<{
            user: ApiUser;
            token: string;
            refreshToken: string;
          }>(API_ENDPOINTS.auth.register, {
            method: 'POST',
            body: { email, password, name, role },
          });

          set({
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            initialized: true,
            loading: false,
          });
        } catch (error) {
          set({
            error: error instanceof ApiError ? error.message : 'Registration failed',
            loading: false,
            initialized: true,
          });
        }
      },

      logout: async () => {
        const { token } = get();
        try {
          // Best-effort server logout (stateless; safe to ignore failures)
          await apiRequest(API_ENDPOINTS.auth.logout, {
            method: 'POST',
            token,
          });
        } catch {
          /* noop */
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          initialized: true,
          error: null,
        });
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const data = await apiRequest<{ user: ApiUser }>(
            API_ENDPOINTS.auth.me,
            { method: 'GET', token }
          );
          set({ user: data.user });
        } catch {
          // Token may be invalid — keep stored state
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        initialized: state.initialized,
      }),
    }
  )
);
