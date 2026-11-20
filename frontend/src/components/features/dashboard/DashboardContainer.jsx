'use client';

import * as React from 'react';
import DashboardView from './DashboardView';
import { useAuthUser, useIsManager } from '@/lib/store/authStore';
import {
  useTodayAttendanceQuery,
  useClockInMutation,
  useClockOutMutation,
} from '@/hooks/queries/useAttendances';
import { useEmployeeListQuery } from '@/hooks/queries/useEmployees';
import { useLeaveRequestListQuery } from '@/hooks/queries/useLeaves';
import { useDailyReportListQuery } from '@/hooks/queries/useDailyReports';

export default function DashboardContainer() {
  const user = useAuthUser();
  const isManager = useIsManager();

  // Queries
  const { data: todayAttendance } = useTodayAttendanceQuery();
  const { data: employees = [] } = useEmployeeListQuery();
  const { data: leaveRequests = [] } = useLeaveRequestListQuery();
  const { data: dailyReports = [] } = useDailyReportListQuery();

  // Clock in/out mutations
  const clockInMutation = useClockInMutation();
  const clockOutMutation = useClockOutMutation();

  const isPunchPending = clockInMutation.isPending || clockOutMutation.isPending;

  const handleClockIn = async () => {
    try {
      await clockInMutation.mutateAsync();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to punch in');
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to punch out');
    }
  };

  // Synchronously compute derived metrics during render (zero useEffect)
  const todayStr = new Date().toISOString().slice(0, 10);

  const pendingLeaves = leaveRequests.filter((req) => req.status === 'pending').length;

  const hasReportToday = dailyReports.some((report) => {
    const reportDate = report.report_date?.slice(0, 10) || report.created_at?.slice(0, 10);
    return reportDate === todayStr;
  });

  const metrics = {
    totalEmployees: employees.length || 10,
    pendingLeaves,
    todayAttendanceCount: todayAttendance ? 1 : 0,
  };

  return (
    <DashboardView
      user={user}
      isManager={isManager}
      metrics={metrics}
      todayAttendance={todayAttendance}
      hasReportToday={hasReportToday}
      isPunchPending={isPunchPending}
      onClockIn={handleClockIn}
      onClockOut={handleClockOut}
    />
  );
}

