'use client';

import * as React from 'react';
import AttendanceShiftCard from './AttendanceShiftCard';
import AttendanceHistoryTable from './AttendanceHistoryTable';
import {
  useTodayAttendanceQuery,
  useAttendanceListQuery,
  useClockInMutation,
  useClockOutMutation,
} from '@/hooks/queries/useAttendances';
import { useIsManager } from '@/lib/store/authStore';

export default function AttendanceContainer() {
  const isManager = useIsManager();

  // Filters state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  // Queries
  const { data: todayAttendance } = useTodayAttendanceQuery();
  const { data: attendances = [] } = useAttendanceListQuery();

  // Mutations
  const clockInMutation = useClockInMutation();
  const clockOutMutation = useClockOutMutation();

  const isPunchPending = clockInMutation.isPending || clockOutMutation.isPending;

  const handleClockIn = async () => {
    try {
      await clockInMutation.mutateAsync();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clock out');
    }
  };

  // Synchronously filter attendances during render (zero useEffect)
  const filteredAttendances = React.useMemo(() => {
    return attendances.filter((record) => {
      const user = record.employee?.user;
      const empCode = record.employee?.employee_code;

      const matchesSearch =
        !searchTerm ||
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const recordDate = record.date ? String(record.date).slice(0, 10) : '';
      const matchesDate = !dateFilter || recordDate === dateFilter;

      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [attendances, searchTerm, dateFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Attendance & Shift Clock
        </h1>
        <p className="text-sm text-slate-500">
          Punch your daily shift, track working hours, and review historical attendance records.
        </p>
      </div>

      {/* Shift Action Card */}
      <AttendanceShiftCard
        todayAttendance={todayAttendance}
        isPunchPending={isPunchPending}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
      />

      {/* History Log Table */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">Attendance Log History</h2>
        <AttendanceHistoryTable
          attendances={filteredAttendances}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          isManager={isManager}
        />
      </div>
    </div>
  );
}

