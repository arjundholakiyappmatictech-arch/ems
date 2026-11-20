import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  destroyDepartment,
} from '@/services/departmentService';
import { useAuthStore } from '@/lib/store/authStore';

export const departmentKeys = {
  all: ['departments'],
  lists: () => [...departmentKeys.all, 'list'],
  details: () => [...departmentKeys.all, 'detail'],
  detail: (id) => [...departmentKeys.details(), id],
};

export function useDepartmentListQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: departmentKeys.lists(),
    queryFn: ({ signal }) => getDepartments(signal),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5, // 5 min cache for organizational structure
  });
}

export function useDepartmentDetailQuery(id) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: ({ signal }) => getDepartment(id, signal),
    enabled: Boolean(token) && Boolean(id),
    staleTime: 0,
  });
}

export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createDepartment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}

export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateDepartment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}

export function useDestroyDepartmentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => destroyDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
    },
  });
}

