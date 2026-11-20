import * as React from 'react';
import Link from 'next/link';
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
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardView({
  user,
  isManager,
  metrics,
  todayAttendance,
  hasReportToday,
  isPunchPending,
  onClockIn,
  onClockOut,
}) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.name || 'Team Member'} 👋
          </h1>
          <p className="text-sm text-slate-500">
            Here is your daily activity and organization overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-white text-slate-700 py-1 px-3">
            Role: <span className="font-semibold uppercase ml-1 text-blue-600">{user?.role}</span>
          </Badge>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Headcount */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {isManager ? 'Total Employees' : 'Team Size'}
            </CardTitle>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{metrics.totalEmployees}</div>
            <p className="mt-1 text-xs text-slate-500">Active roster members</p>
            {isManager && (
              <Link
                href="/employees"
                className="mt-3 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Directory <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Today's Punch Shift */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Shift Status</CardTitle>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {todayAttendance?.clock_in ? (
                todayAttendance?.clock_out ? (
                  <span className="text-blue-600 text-xl">Completed</span>
                ) : (
                  <span className="text-emerald-600 text-xl">Clocked In</span>
                )
              ) : (
                <span className="text-amber-600 text-xl">Not Clocked In</span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {todayAttendance?.clock_in
                ? `Started at ${todayAttendance.clock_in.substring(11, 16) || todayAttendance.clock_in}`
                : 'Punch in to record your day'}
            </p>
            <Link
              href="/attendances"
              className="mt-3 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Punch Logs <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 3: Pending Leaves */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              {isManager ? 'Pending Approvals' : 'Pending Requests'}
            </CardTitle>
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <CalendarDays className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{metrics.pendingLeaves}</div>
            <p className="mt-1 text-xs text-slate-500">
              {isManager ? 'Awaiting your review' : 'Under management review'}
            </p>
            <Link
              href="/leave-requests"
              className="mt-3 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Manage Leaves <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Card 4: Daily Report */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Today&apos;s Report</CardTitle>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {hasReportToday ? (
                <span className="text-emerald-600 text-xl flex items-center gap-1.5">
                  <CheckCircle2 className="h-5 w-5" /> Submitted
                </span>
              ) : (
                <span className="text-amber-600 text-xl flex items-center gap-1.5">
                  <AlertCircle className="h-5 w-5" /> Pending
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {hasReportToday ? 'Logged for today' : 'EOD deliverables not filed yet'}
            </p>
            <Link
              href="/daily-reports"
              className="mt-3 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Daily Reports <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Section: Shift Card + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Punch Card Action Detail */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Today&apos;s Punch & Attendance</CardTitle>
            <CardDescription>
              Record your daily work shift hours directly with the automated time clock
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-slate-200 bg-slate-50/75 p-4 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Current Status
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      todayAttendance?.clock_in && !todayAttendance?.clock_out
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-base font-bold text-slate-900">
                    {todayAttendance?.clock_in
                      ? todayAttendance?.clock_out
                        ? 'Day Shift Completed'
                        : 'Working (Clocked In)'
                      : 'Not Punched In'}
                  </span>
                </div>
                {todayAttendance?.clock_in && (
                  <p className="mt-1 text-xs text-slate-600">
                    Clock In: <strong>{todayAttendance.clock_in}</strong>
                    {todayAttendance.clock_out && (
                      <> | Clock Out: <strong>{todayAttendance.clock_out}</strong></>
                    )}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {!todayAttendance?.clock_in ? (
                  <Button
                    onClick={onClockIn}
                    disabled={isPunchPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isPunchPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="mr-2 h-4 w-4" />
                    )}
                    Clock In Now
                  </Button>
                ) : !todayAttendance?.clock_out ? (
                  <Button
                    variant="destructive"
                    onClick={onClockOut}
                    disabled={isPunchPending}
                  >
                    {isPunchPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" />
                    )}
                    Clock Out Now
                  </Button>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1.5 text-xs font-medium">
                    Shift Closed ({todayAttendance.total_hours} hrs)
                  </Badge>
                )}
              </div>
            </div>

            {/* Daily Report Reminder Banner */}
            {!hasReportToday && (
              <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/75 p-3.5">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900">
                      Daily Work Report Reminder
                    </p>
                    <p className="text-xs text-amber-700">
                      Don&apos;t forget to log your daily tasks and blockers before signing off.
                    </p>
                  </div>
                </div>
                <Link href="/daily-reports">
                  <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 text-xs">
                    File Report
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            <CardDescription>Shortcut to your most frequent HR actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/leave-requests" className="block">
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                <CalendarDays className="mr-2 h-4 w-4 text-purple-600" />
                Apply for Leave
              </Button>
            </Link>
            <Link href="/daily-reports" className="block">
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                <FileText className="mr-2 h-4 w-4 text-amber-600" />
                Submit Daily Work Report
              </Button>
            </Link>
            <Link href="/attendances" className="block">
              <Button variant="outline" className="w-full justify-start text-xs h-9">
                <Clock className="mr-2 h-4 w-4 text-emerald-600" />
                View Attendance Logs
              </Button>
            </Link>
            {isManager && (
              <>
                <Link href="/employees" className="block">
                  <Button variant="outline" className="w-full justify-start text-xs h-9">
                    <Users className="mr-2 h-4 w-4 text-blue-600" />
                    Manage Employee Directory
                  </Button>
                </Link>
                <Link href="/departments" className="block">
                  <Button variant="outline" className="w-full justify-start text-xs h-9">
                    <ShieldAlert className="mr-2 h-4 w-4 text-indigo-600" />
                    Organization & Designations
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

