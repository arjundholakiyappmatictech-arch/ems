import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDailyReports,
  getDailyReport,
  createDailyReport,
  updateDailyReport,
  reviewDailyReport,
} from '@/services/dailyReportService';
import { useAuthStore } from '@/lib/store/authStore';

export const dailyReportKeys = {
  all: ['daily-reports'],
  lists: () => [...dailyReportKeys.all, 'list'],
  list: (filters) => [...dailyReportKeys.lists(), { filters }],
  detail: (id) => [...dailyReportKeys.all, 'detail', id],
};

export function useDailyReportListQuery(filters = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: dailyReportKeys.list(filters),
    queryFn: ({ signal }) => getDailyReports(filters, signal),
    enabled: Boolean(token),
    staleTime: 0,
  });
}

export function useDailyReportDetailQuery(id) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: dailyReportKeys.detail(id),
    queryFn: ({ signal }) => getDailyReport(id, signal),
    enabled: Boolean(token) && Boolean(id),
    staleTime: 0,
  });
}

export function useCreateDailyReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createDailyReport(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyReportKeys.all });
    },
  });
}

export function useUpdateDailyReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateDailyReport(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyReportKeys.all });
    },
  });
}

export function useReviewDailyReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => reviewDailyReport(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyReportKeys.all });
    },
  });
}

