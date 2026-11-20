import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLeaveTypes,
  getLeaveRequests,
  createLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
  cancelLeaveRequest,
} from '@/services/leaveService';
import { useAuthStore } from '@/lib/store/authStore';

export const leaveKeys = {
  all: ['leaves'],
  types: () => [...leaveKeys.all, 'types'],
  requests: () => [...leaveKeys.all, 'requests'],
  requestList: (filters) => [...leaveKeys.requests(), { filters }],
};

export function useLeaveTypeListQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: ({ signal }) => getLeaveTypes(signal),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5, // Leave types are static policy definitions
  });
}

export function useLeaveRequestListQuery(filters = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: leaveKeys.requestList(filters),
    queryFn: ({ signal }) => getLeaveRequests(filters, signal),
    enabled: Boolean(token),
    staleTime: 0,
  });
}

export function useCreateLeaveRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createLeaveRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
    },
  });
}

export function useApproveLeaveRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => approveLeaveRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
    },
  });
}

export function useRejectLeaveRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => rejectLeaveRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
    },
  });
}

export function useCancelLeaveRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelLeaveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leaveKeys.requests() });
    },
  });
}

