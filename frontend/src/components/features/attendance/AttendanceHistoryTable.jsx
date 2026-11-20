import * as React from 'react';
import { Search, Calendar, Filter, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
        return <Badge variant="success" className="capitalize text-[11px]">Present</Badge>;
      case 'half_day':
        return <Badge variant="warning" className="capitalize text-[11px]">Half Day</Badge>;
      case 'absent':
        return <Badge variant="destructive" className="capitalize text-[11px]">Absent</Badge>;
      default:
        return <Badge variant="outline" className="capitalize text-[11px]">{status || 'logged'}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          {/* Manager Search */}
          {isManager && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          )}

          {/* Date Filter */}
          <div className="relative w-full sm:w-44">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Status Filter */}
          <select
            className="h-9 w-full sm:w-36 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="present">Present</option>
            <option value="half_day">Half Day</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(dateFilter || statusFilter !== 'all' || searchTerm) && (
          <button
            type="button"
            onClick={() => {
              onDateFilterChange('');
              onStatusFilterChange('all');
              onSearchChange('');
            }}
            className="text-xs text-blue-600 hover:underline self-start sm:self-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/75">
              <TableHead className="font-semibold text-slate-600">Date</TableHead>
              {isManager && <TableHead className="font-semibold text-slate-600">Employee</TableHead>}
              <TableHead className="font-semibold text-slate-600">Clock In</TableHead>
              <TableHead className="font-semibold text-slate-600">Clock Out</TableHead>
              <TableHead className="font-semibold text-slate-600">Working Hours</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendances.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isManager ? 6 : 5}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  No attendance records found for the selected criteria.
                </TableCell>
              </TableRow>
            ) : (
              attendances.map((record) => {
                const emp = record.employee;
                const user = emp?.user;

                return (
                  <TableRow key={record.id} className="hover:bg-slate-50/50">
                    {/* Date */}
                    <TableCell className="font-medium text-slate-800 text-xs">
                      {record.date ? String(record.date).slice(0, 10) : '—'}
                    </TableCell>

                    {/* Employee (Manager Only) */}
                    {isManager && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] uppercase">
                            {user?.name ? user.name.charAt(0) : 'E'}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{user?.name || 'Employee'}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{emp?.employee_code || ''}</p>
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {/* Clock In */}
                    <TableCell className="text-xs text-slate-700 font-mono">
                      {record.clock_in
                        ? record.clock_in.substring(11, 16) || record.clock_in
                        : '—'}
                    </TableCell>

                    {/* Clock Out */}
                    <TableCell className="text-xs text-slate-700 font-mono">
                      {record.clock_out
                        ? record.clock_out.substring(11, 16) || record.clock_out
                        : '—'}
                    </TableCell>

                    {/* Total Hours */}
                    <TableCell className="text-xs font-semibold text-slate-900">
                      {record.total_hours ? `${record.total_hours} hrs` : record.clock_in ? 'In Progress' : '—'}
                    </TableCell>

                    {/* Status */}
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

