'use client';

import * as React from 'react';
import { AlertCircle, X } from 'lucide-react';
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
  const [errorMessage, setErrorMessage] = React.useState('');

  // Queries
  const { data: todayAttendance } = useTodayAttendanceQuery();
  const { data: attendances = [] } = useAttendanceListQuery();

  // Mutations
  const clockInMutation = useClockInMutation();
  const clockOutMutation = useClockOutMutation();

  const isPunchPending = clockInMutation.isPending || clockOutMutation.isPending;

  const handleClockIn = async () => {
    setErrorMessage('');
    try {
      await clockInMutation.mutateAsync({});
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to clock in for shift');
    }
  };

  const handleClockOut = async () => {
    setErrorMessage('');
    try {
      await clockOutMutation.mutateAsync({});
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to clock out for shift');
    }
  };

  // Synchronous filter during render (zero useEffect, pure derivation)
  const filteredAttendances = React.useMemo(() => {
    return attendances.filter((record) => {
      const emp = record.employee;
      const empName = (emp?.name || emp?.user?.name || '').toLowerCase();
      const empCode = (emp?.code || emp?.employee_code || '').toLowerCase();

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        empName.includes(search) ||
        empCode.includes(search);

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

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-rose-500 hover:text-rose-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
