import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAttendances,
  getTodayAttendance,
  clockIn,
  clockOut,
} from '@/services/attendanceService';
import { useAuthStore } from '@/lib/store/authStore';

export const attendanceKeys = {
  all: ['attendances'],
  today: () => [...attendanceKeys.all, 'today'],
  lists: () => [...attendanceKeys.all, 'list'],
  list: (filters) => [...attendanceKeys.lists(), { filters }],
};

/**
 * Query hook for today's punch status.
 */
export function useTodayAttendanceQuery() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: ({ signal }) => getTodayAttendance(signal),
    enabled: Boolean(token),
    staleTime: 0,
    refetchInterval: 30000, // Refresh punch status every 30s
  });
}

/**
 * Query hook for attendance logs/history.
 */
export function useAttendanceListQuery(filters = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: attendanceKeys.list(filters),
    queryFn: ({ signal }) => getAttendances(filters, signal),
    enabled: Boolean(token),
    staleTime: 0,
  });
}

/**
 * Mutation hook for Clock In.
 */
export function useClockInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => clockIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/**
 * Mutation hook for Clock Out.
 */
export function useClockOutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => clockOut(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
