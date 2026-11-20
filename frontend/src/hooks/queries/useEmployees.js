import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  destroyEmployee,
} from '@/services/employeeService';
import { useAuthStore } from '@/lib/store/authStore';

export const employeeKeys = {
  all: ['employees'],
  lists: () => [...employeeKeys.all, 'list'],
  list: (filters) => [...employeeKeys.lists(), { filters }],
  details: () => [...employeeKeys.all, 'detail'],
  detail: (id) => [...employeeKeys.details(), id],
};

export function useEmployeeListQuery(filters = {}, options = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: employeeKeys.list(filters),
    queryFn: ({ signal }) => getEmployees(filters, signal),
    enabled: Boolean(token),
    staleTime: 0,
    ...options,
  });
}

export function useEmployeeDetailQuery(id) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: ({ signal }) => getEmployee(id, signal),
    enabled: Boolean(token) && Boolean(id),
    staleTime: 0,
  });
}

export function useCreateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useUpdateEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateEmployee(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
    },
  });
}

export function useUpdateEmployeeStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateEmployeeStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
    },
  });
}

export function useDestroyEmployeeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => destroyEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

