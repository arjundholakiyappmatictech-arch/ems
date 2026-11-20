import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, logout, getMe } from '@/services/authService';
import { useAuthStore } from '@/lib/store/authStore';

export const authKeys = {
  all: ['auth'],
  me: () => [...authKeys.all, 'me'],
};

/**
 * Hook to fetch current user profile.
 * Only enabled when authenticated.
 */
export function useMeQuery(options = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: ({ signal }) => getMe(signal),
    enabled: Boolean(token),
    staleTime: 0,
    ...options,
  });
}

/**
 * Hook for user login mutation.
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (credentials) => login(credentials),
    onSuccess: (data) => {
      if (data?.token && data?.user) {
        setAuth(data.user, data.token);
        queryClient.setQueryData(authKeys.me(), data.user);
      }
    },
  });
}

/**
 * Hook for user logout mutation.
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  });
}

