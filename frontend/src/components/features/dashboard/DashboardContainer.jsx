'use client';

import * as React from 'react';
import DashboardView from './DashboardView';
import { useAuthUser, useIsManager } from '@/lib/store/authStore';
import {
  useTodayAttendanceQuery,
  useAttendanceListQuery,
  useClockInMutation,
  useClockOutMutation,
} from '@/hooks/queries/useAttendances';
import { useEmployeeListQuery } from '@/hooks/queries/useEmployees';
import {
  useLeaveRequestListQuery,
  useLeaveTypeListQuery,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
} from '@/hooks/queries/useLeaves';
import { useDailyReportListQuery } from '@/hooks/queries/useDailyReports';
import { useDepartmentListQuery } from '@/hooks/queries/useDepartments';

export default function DashboardContainer() {
  const user = useAuthUser();
  const isManager = useIsManager();

  // Queries
  const { data: todayAttendance } = useTodayAttendanceQuery();
  const { data: rawAttendances = [] } = useAttendanceListQuery();
  const { data: rawEmployees = [] } = useEmployeeListQuery();
  const { data: rawDepartments = [] } = useDepartmentListQuery();
  const { data: rawLeaveRequests = [] } = useLeaveRequestListQuery();
  const { data: rawLeaveTypes = [] } = useLeaveTypeListQuery();
  const { data: rawDailyReports = [] } = useDailyReportListQuery();

  // Normalize all lists safely (handles both direct arrays and paginated responses)
  const attendances = React.useMemo(
    () => (Array.isArray(rawAttendances) ? rawAttendances : rawAttendances?.data ?? []),
    [rawAttendances]
  );
  const employees = React.useMemo(
    () => (Array.isArray(rawEmployees) ? rawEmployees : rawEmployees?.data ?? []),
    [rawEmployees]
  );
  const departments = React.useMemo(
    () => (Array.isArray(rawDepartments) ? rawDepartments : rawDepartments?.data ?? []),
    [rawDepartments]
  );
  const leaveRequests = React.useMemo(
    () => (Array.isArray(rawLeaveRequests) ? rawLeaveRequests : rawLeaveRequests?.data ?? []),
    [rawLeaveRequests]
  );
  const leaveTypes = React.useMemo(
    () => (Array.isArray(rawLeaveTypes) ? rawLeaveTypes : rawLeaveTypes?.data ?? []),
    [rawLeaveTypes]
  );
  const dailyReports = React.useMemo(
    () => (Array.isArray(rawDailyReports) ? rawDailyReports : rawDailyReports?.data ?? []),
    [rawDailyReports]
  );

  // Mutations
  const clockInMutation = useClockInMutation();
  const clockOutMutation = useClockOutMutation();
  const approveLeaveMutation = useApproveLeaveRequestMutation();
  const rejectLeaveMutation = useRejectLeaveRequestMutation();

  const isPunchPending = clockInMutation.isPending || clockOutMutation.isPending;
  const [processingLeaveId, setProcessingLeaveId] = React.useState(null);

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

  const handleApproveLeave = async (id) => {
    setProcessingLeaveId(id);
    try {
      await approveLeaveMutation.mutateAsync({ id });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve leave request');
    } finally {
      setProcessingLeaveId(null);
    }
  };

  const handleRejectLeave = async (id) => {
    const reason = prompt('Please enter the rejection reason:');
    if (!reason || !reason.trim()) return;
    setProcessingLeaveId(id);
    try {
      await rejectLeaveMutation.mutateAsync({ id, payload: { action_reason: reason.trim() } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject leave request');
    } finally {
      setProcessingLeaveId(null);
    }
  };

  // Synchronously derived metrics during render (zero useEffect)
  const todayStr = new Date().toISOString().slice(0, 10);

  const pendingLeavesList = React.useMemo(
    () => leaveRequests.filter((req) => req.status === 'pending'),
    [leaveRequests]
  );

  const hasReportToday = React.useMemo(() => {
    return dailyReports.some((report) => {
      const reportDate = report.report_date?.slice(0, 10) || report.created_at?.slice(0, 10);
      return reportDate === todayStr;
    });
  }, [dailyReports, todayStr]);

  // Department distribution chart data
  const departmentChartData = React.useMemo(() => {
    const counts = {};
    departments.forEach((dept) => {
      counts[dept.code || dept.name] = { name: dept.name, code: dept.code || dept.name, count: 0 };
    });
    employees.forEach((emp) => {
      const key = emp.department?.code || emp.department?.name || 'Unassigned';
      if (!counts[key]) {
        counts[key] = { name: emp.department?.name || 'Unassigned', code: key, count: 0 };
      }
      counts[key].count += 1;
    });
    return Object.values(counts);
  }, [departments, employees]);

  // Leave status breakdown chart data
  const leaveStatusChartData = React.useMemo(() => {
    const pending = leaveRequests.filter((r) => r.status === 'pending').length;
    const approved = leaveRequests.filter((r) => r.status === 'approved').length;
    const rejected = leaveRequests.filter((r) => r.status === 'rejected').length;
    return [
      { status: 'Pending', count: pending, fill: '#f59e0b' },
      { status: 'Approved', count: approved, fill: '#10b981' },
      { status: 'Rejected', count: rejected, fill: '#f43f5e' },
    ];
  }, [leaveRequests]);

  // Recent attendance trend chart data (grouped by date)
  const attendanceTrendData = React.useMemo(() => {
    const dateMap = {};
    attendances.forEach((att) => {
      const d = att.date ? String(att.date).slice(0, 10) : '';
      if (d) {
        dateMap[d] = (dateMap[d] || 0) + 1;
      }
    });
    const sorted = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7);
    return sorted.map(([date, presentCount]) => ({
      date: date.slice(5), // MM-DD
      present: presentCount,
    }));
  }, [attendances]);

  // Leave Quotas & Balances for employee view
  const quotaProgress = React.useMemo(() => {
    const myApproved = leaveRequests.filter((r) => r.status === 'approved');
    return leaveTypes.map((type) => {
      const usedDays = myApproved
        .filter((r) => r.leave_type_id === type.id)
        .reduce((sum, r) => sum + (Number(r.total_days) || 0), 0);
      const totalDays = Number(type.days_per_year) || 0;
      const remainingDays = Math.max(0, totalDays - usedDays);
      const percentage = totalDays > 0 ? Math.min(100, Math.round((usedDays / totalDays) * 100)) : 0;
      return {
        ...type,
        usedDays,
        totalDays,
        remainingDays,
        percentage,
      };
    });
  }, [leaveTypes, leaveRequests]);

  // Today's team attendance for managers
  const todayTeamAttendance = React.useMemo(() => {
    return attendances.filter((att) => {
      const d = att.date ? String(att.date).slice(0, 10) : '';
      return d === todayStr;
    });
  }, [attendances, todayStr]);

  const metrics = {
    totalEmployees: employees.length || 10,
    pendingLeaves: pendingLeavesList.length,
    todayAttendanceCount: todayTeamAttendance.length || (todayAttendance ? 1 : 0),
    departmentsCount: departments.length,
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
      departmentChartData={departmentChartData}
      leaveStatusChartData={leaveStatusChartData}
      attendanceTrendData={attendanceTrendData}
      quotaProgress={quotaProgress}
      pendingLeavesList={pendingLeavesList}
      todayTeamAttendance={todayTeamAttendance}
      recentAttendances={attendances.slice(0, 5)}
      processingLeaveId={processingLeaveId}
      onApproveLeave={handleApproveLeave}
      onRejectLeave={handleRejectLeave}
    />
  );
}
