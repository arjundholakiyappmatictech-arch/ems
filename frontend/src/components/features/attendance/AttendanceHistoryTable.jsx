'use client';

import * as React from 'react';
import { Search, Calendar, Filter, Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatTime12h } from '@/lib/utils';

export default function AttendanceHistoryTable({
  attendances = [],
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  isManager,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return (
          <Badge variant="success" dot={true} className="capitalize text-[11px] font-medium">
            Present
          </Badge>
        );
      case 'half_day':
        return (
          <Badge variant="warning" dot={true} className="capitalize text-[11px] font-medium">
            Half Day
          </Badge>
        );
      case 'absent':
        return (
          <Badge variant="destructive" dot={true} className="capitalize text-[11px] font-medium">
            Absent
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="capitalize text-[11px] font-medium">
            {status || 'Logged'}
          </Badge>
        );
    }
  };

  const hasActiveFilters = Boolean(dateFilter || statusFilter !== 'all' || searchTerm);

  // Quick summary metrics
  const totalCount = attendances.length;
  const presentCount = attendances.filter((a) => a.status === 'present').length;
  const halfDayCount = attendances.filter((a) => a.status === 'half_day').length;

  return (
    <div className="space-y-4">
      {/* Filters & Control Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Manager Search */}
          {isManager && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search employee or code..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8.5 h-8.5 text-xs bg-slate-50/50 focus:bg-white transition-colors"
              />
            </div>
          )}

          {/* Date Picker */}
          <div className="relative w-full sm:w-44">
            <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <select
            className="h-8.5 w-full sm:w-36 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 text-xs text-slate-700 shadow-2xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="present">Present (Full)</option>
            <option value="half_day">Half Day (&lt;4h)</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        {/* Right side stats + clear filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDateFilterChange('');
                onStatusFilterChange('all');
                onSearchChange('');
              }}
              className="h-8 text-xs text-slate-500 hover:text-slate-900 px-2"
            >
              Reset Filters
            </Button>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 pl-2 border-l border-slate-200">
            <span className="font-semibold text-slate-800">{totalCount}</span> records
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-medium">{presentCount} present</span>
            {halfDayCount > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-amber-700 font-medium">{halfDayCount} half day</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
              <TableHead className="w-[130px] font-semibold text-slate-600 text-xs">Date</TableHead>
              {isManager && (
                <TableHead className="font-semibold text-slate-600 text-xs">Employee</TableHead>
              )}
              <TableHead className="font-semibold text-slate-600 text-xs">Clock In</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs">Clock Out</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs">Working Hours</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendances.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isManager ? 6 : 5}
                  className="py-14 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                      <Clock className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      No attendance records found
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {hasActiveFilters
                        ? 'Try adjusting your search criteria or resetting filters to see more results.'
                        : 'No shifts have been punched yet. Clock in to log your first daily shift.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((record) => {
                const emp = record.employee;
                const empName = emp?.name || emp?.user?.name || 'Employee';
                const empCode = emp?.code || emp?.employee_code || '';
                const initial = empName.charAt(0).toUpperCase();

                const isOngoing = Boolean(record.clock_in && !record.clock_out);

                return (
                  <TableRow key={record.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Date */}
                    <TableCell className="font-medium text-slate-800 text-xs">
                      {record.date ? (
                        <div className="flex flex-col">
                          <span>
                            {new Date(record.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </TableCell>

                    {/* Employee (Manager Only) */}
                    {isManager && (
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            {initial}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-900">{empName}</span>
                            {empCode && (
                              <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                                {empCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {/* Clock In */}
                    <TableCell className="text-xs text-slate-700 font-mono">
                      {formatTime12h(record.clock_in)}
                    </TableCell>

                    {/* Clock Out */}
                    <TableCell className="text-xs text-slate-700 font-mono">
                      {formatTime12h(record.clock_out)}
                    </TableCell>

                    {/* Working Hours */}
                    <TableCell>
                      {record.total_hours != null ? (
                        <span className="text-xs font-semibold text-slate-900 font-mono">
                          {record.total_hours} hrs
                        </span>
                      ) : isOngoing ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          In Progress
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
