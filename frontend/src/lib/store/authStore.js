import { create } from 'zustand';

/**
 * Zustand v5 Auth Store
 * Manages user session and Sanctum Bearer token with atomic selectors.
 * Strictly ephemeral & client-state only; server state is fetched via TanStack Query.
 */
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('access_token', token);
      if (user) localStorage.setItem('auth_user', JSON.stringify(user));
    }
    set({
      user,
      token,
      isAuthenticated: Boolean(token),
      isHydrated: true,
    });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined' && user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
    set({ user });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: true,
    });
  },

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('auth_user');
      let user = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch {
          user = null;
        }
      }
      set({
        token,
        user,
        isAuthenticated: Boolean(token),
        isHydrated: true,
      });
    }
  },
}));

// Atomic Selectors
export const useAuthUser = () => useAuthStore((s) => s.user);
export const useAuthToken = () => useAuthStore((s) => s.token);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useIsHydrated = () => useAuthStore((s) => s.isHydrated);
export const useIsManager = () => useAuthStore((s) => s.user?.role === 'manager');
export const useIsEmployee = () => useAuthStore((s) => s.user?.role === 'employee');

