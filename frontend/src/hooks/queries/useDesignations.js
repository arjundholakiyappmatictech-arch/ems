import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDesignations,
  getDesignation,
  createDesignation,
  updateDesignation,
  destroyDesignation,
} from '@/services/designationService';
import { useAuthStore } from '@/lib/store/authStore';

export const designationKeys = {
  all: ['designations'],
  lists: () => [...designationKeys.all, 'list'],
  list: (filters) => [...designationKeys.lists(), { filters }],
  detail: (id) => [...designationKeys.all, 'detail', id],
};

export function useDesignationListQuery(filters = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: designationKeys.list(filters),
    queryFn: ({ signal }) => getDesignations(filters, signal),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateDesignationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createDesignation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: designationKeys.all });
    },
  });
}

export function useUpdateDesignationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateDesignation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: designationKeys.all });
    },
  });
}

export function useDestroyDesignationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => destroyDesignation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: designationKeys.all });
    },
  });
}

