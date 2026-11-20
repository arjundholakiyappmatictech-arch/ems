'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  Users,
  Clock,
  CalendarDays,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Loader2,
  Building2,
  Check,
  X,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const deptChartConfig = {
  count: {
    label: 'Employees',
    color: '#2563eb',
  },
};

export default function DashboardView({
  user,
  isManager,
  metrics,
  todayAttendance,
  hasReportToday,
  isPunchPending,
  onClockIn,
  onClockOut,
  departmentChartData = [],
  quotaProgress = [],
  pendingLeavesList = [],
  todayTeamAttendance = [],
  recentAttendances = [],
  processingLeaveId,
  onApproveLeave,
  onRejectLeave,
}) {
  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Shift Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || 'Colleague'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational dashboard and real-time organization metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Badge variant={isManager ? 'default' : 'secondary'} className="text-[11px] font-semibold uppercase px-2.5 py-1">
            {user?.role || 'staff'}
          </Badge>

          {/* Quick Shift Button */}
          {!todayAttendance?.clock_in ? (
            <Button
              onClick={onClockIn}
              disabled={isPunchPending}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-xs gap-1.5 shadow-2xs"
            >
              {isPunchPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogIn className="h-3.5 w-3.5" />}
              <span>Clock In Today</span>
            </Button>
          ) : !todayAttendance?.clock_out ? (
            <Button
              onClick={onClockOut}
              disabled={isPunchPending}
              size="sm"
              variant="outline"
              className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50 gap-1.5 shadow-2xs"
            >
              {isPunchPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
              <span>Clock Out</span>
            </Button>
          ) : (
            <Badge variant="success" className="text-xs py-1 px-2.5" dot={true}>
              Shift Logged ({todayAttendance.total_hours}h)
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Primary KPI Stat Cards */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Headcount */}
        <Card className="hover:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              {isManager ? 'Total Headcount' : 'Team Members'}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">{metrics.totalEmployees}</div>
            <p className="mt-1 text-[11px] text-slate-500">
              Across {metrics.departmentsCount || 5} active divisions
            </p>
            {isManager && (
              <Link
                href="/employees"
                className="mt-2.5 inline-flex items-center text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                <span>Directory</span>
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Shift Attendance */}
        <Card className="hover:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              {isManager ? 'Active Shifts Today' : 'Today Shift'}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {isManager ? (
                `${metrics.todayAttendanceCount} logged`
              ) : todayAttendance?.clock_in ? (
                todayAttendance?.clock_out ? 'Shift Done' : 'Clocked In'
              ) : (
                'Not Clocked In'
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {todayAttendance?.clock_in
                ? `Clocked in at ${String(todayAttendance.clock_in).slice(11, 16)}`
                : 'Punches recorded in real-time'}
            </p>
            <Link
              href="/attendances"
              className="mt-2.5 inline-flex items-center text-[11px] font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Attendance History</span>
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 3: Daily Reports */}
        <Card className="hover:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              {isManager ? 'Daily Reports Feed' : 'Today Standup'}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {hasReportToday ? 'Submitted' : 'Pending'}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {hasReportToday
                ? 'Your report for today is submitted'
                : '1 end-of-day report expected today'}
            </p>
            <Link
              href="/daily-reports"
              className="mt-2.5 inline-flex items-center text-[11px] font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>{hasReportToday ? 'View Reports' : 'Submit Today Report'}</span>
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 4: Leave Requests */}
        <Card className="hover:border-slate-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              {isManager ? 'Action Queue' : 'My Leave Requests'}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
              <CalendarDays className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {metrics.pendingLeaves} pending
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {isManager
                ? `${metrics.pendingLeaves} requests require review`
                : 'Track submitted time-off requests'}
            </p>
            <Link
              href="/leave-requests"
              className="mt-2.5 inline-flex items-center text-[11px] font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>Leave Tracker</span>
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 3. MANAGER ACTION CENTER: Priority Review Queue */}
      {isManager && (
        <Card className="border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/20">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-900">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Priority Action Queue · Pending Leave Requests</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Direct manager review and approval state machine
              </CardDescription>
            </div>
            <Link href="/leave-requests">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 gap-1 h-7">
                <span>View All</span>
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingLeavesList.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                <Inbox className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-700">All caught up!</p>
                <p className="text-[11px] text-slate-400">Zero pending employee leave requests require your review.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 text-[11px]">
                      <TableHead>Employee</TableHead>
                      <TableHead>Leave Category</TableHead>
                      <TableHead>Dates & Duration</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Direct Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingLeavesList.slice(0, 5).map((req) => (
                      <TableRow key={req.id} className="hover:bg-slate-50/80 text-xs">
                        <TableCell className="font-semibold text-slate-900">
                          {req.employee?.user?.name || req.employee?.first_name || 'Staff Member'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {req.leave_type?.name || 'Leave'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-[11px] font-mono">
                          {req.start_date} to {req.end_date} ({req.total_days}d)
                        </TableCell>
                        <TableCell className="text-slate-600 max-w-[200px] truncate" title={req.reason}>
                          {req.reason || '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1 text-white font-medium"
                              onClick={() => onApproveLeave(req.id)}
                              disabled={processingLeaveId === req.id}
                            >
                              {processingLeaveId === req.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              <span>Approve</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-xs border-rose-200 text-rose-700 hover:bg-rose-50 gap-1 font-medium"
                              onClick={() => onRejectLeave(req.id)}
                              disabled={processingLeaveId === req.id}
                            >
                              <X className="h-3 w-3" />
                              <span>Reject</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 4. Visual Quota Balances for Employees */}
      {!isManager && quotaProgress.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span>Leave Quota Balances & Policy Allowances</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Annual allocated paid time-off days for current calendar year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quotaProgress.map((type) => (
                <div key={type.id} className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{type.name}</span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {type.remainingDays} / {type.totalDays}d left
                    </span>
                  </div>
                  <Progress value={type.percentage} className="h-1.5" />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{type.usedDays}d used</span>
                    <span>{type.totalDays}d total</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. Organization Staffing Distribution Chart */}
      {isManager && departmentChartData.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Staffing Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Department Staffing Distribution</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Employee headcount distribution across corporate divisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={deptChartConfig} className="h-[220px] w-full">
                <BarChart data={departmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="code" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count, #2563eb)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Today's Team Punch Roster */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  <span>Today&apos;s Team Punch Logs</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Real-time clock-in records for current shift
                </CardDescription>
              </div>
              <Link href="/attendances">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7 gap-1">
                  <span>Log</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {todayTeamAttendance.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
                  No active employee clock-ins recorded yet today.
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTeamAttendance.slice(0, 4).map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                          {att.employee?.user?.name ? att.employee.user.name.charAt(0) : 'E'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">
                            {att.employee?.user?.name || att.employee?.first_name || 'Employee'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {att.employee?.department?.name || 'Staff'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        In: {att.clock_in ? String(att.clock_in).slice(11, 16) : '—'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
