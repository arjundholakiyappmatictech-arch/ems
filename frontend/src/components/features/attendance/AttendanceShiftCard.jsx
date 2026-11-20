'use client';

import * as React from 'react';
import { Clock, LogIn, LogOut, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatTime12h, parseAttendanceDateTime } from '@/lib/utils';

export default function AttendanceShiftCard({
  todayAttendance,
  isPunchPending,
  onClockIn,
  onClockOut,
}) {
  const [elapsed, setElapsed] = React.useState('');
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);

  const isWorking = Boolean(todayAttendance?.clock_in && !todayAttendance?.clock_out);
  const isCompleted = Boolean(todayAttendance?.clock_in && todayAttendance?.clock_out);
  const isNotStarted = !todayAttendance?.clock_in;

  // Live timer for active shift
  React.useEffect(() => {
    if (!isWorking) {
      setElapsed('');
      setElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      try {
        const startDate = parseAttendanceDateTime(
          todayAttendance.clock_in,
          todayAttendance.date
        );
        if (!startDate) return;

        const diffMs = Math.max(0, Date.now() - startDate.getTime());
        const totalSec = Math.floor(diffMs / 1000);
        setElapsedSeconds(totalSec);

        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);

        setElapsed(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      } catch {
        setElapsed('');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isWorking, todayAttendance?.clock_in, todayAttendance?.date]);

  // Target standard workday = 8.0 hours (28,800 seconds)
  const shiftProgress = React.useMemo(() => {
    if (isCompleted && todayAttendance?.total_hours != null) {
      return Math.min(100, Math.round((Number(todayAttendance.total_hours) / 8) * 100));
    }
    if (isWorking && elapsedSeconds > 0) {
      return Math.min(100, Math.round((elapsedSeconds / 28800) * 100));
    }
    return 0;
  }, [isCompleted, isWorking, todayAttendance?.total_hours, elapsedSeconds]);

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="overflow-hidden border border-slate-200/80 bg-white shadow-2xs rounded-xl">
      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                Daily Shift & Time Tracker
              </h2>
              {isWorking && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Live
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentDateFormatted}</p>
          </div>

          <div>
            {isWorking && (
              <Badge variant="success" dot={true} className="text-xs py-1 px-3">
                Active Working Shift
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="secondary" dot={true} className="text-xs py-1 px-3">
                Shift Completed
              </Badge>
            )}
            {isNotStarted && (
              <Badge variant="warning" dot={true} className="text-xs py-1 px-3">
                Not Punched In
              </Badge>
            )}
          </div>
        </div>

        {/* 3-Column Shift Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Clock In */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Clock In
              </span>
              <LogIn className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">
              {todayAttendance?.clock_in ? formatTime12h(todayAttendance.clock_in) : '— : —'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {todayAttendance?.clock_in ? 'Logged on arrival' : 'Pending morning punch'}
            </p>
          </div>

          {/* Card 2: Clock Out */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Clock Out
              </span>
              <LogOut className="h-4 w-4 text-rose-500" />
            </div>
            <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">
              {todayAttendance?.clock_out ? formatTime12h(todayAttendance.clock_out) : '— : —'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {todayAttendance?.clock_out
                ? 'Logged on departure'
                : isWorking
                ? 'Punch out when leaving'
                : 'Pending shift completion'}
            </p>
          </div>

          {/* Card 3: Elapsed / Duration */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors">
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Shift Duration
              </span>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-slate-900 font-mono tracking-tight">
              {isWorking
                ? elapsed || '00:00:00'
                : isCompleted && todayAttendance?.total_hours != null
                ? `${todayAttendance.total_hours} hrs`
                : '0.0 hrs'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {isWorking
                ? 'Ticking active time'
                : isCompleted
                ? todayAttendance?.status === 'half_day'
                  ? 'Half Day (< 4 hrs)'
                  : 'Full Day Credited'
                : 'Standard target: 8.0h'}
            </p>
          </div>
        </div>

        {/* Shift Goal Progress Bar */}
        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>Shift Target Progress</span>
            </div>
            <span className="font-mono font-semibold text-slate-800">
              {shiftProgress}% of 8.0h daily goal
            </span>
          </div>
          <Progress
            value={shiftProgress}
            className="h-2 bg-slate-200/70"
            indicatorClassName={
              shiftProgress >= 100
                ? 'bg-emerald-600'
                : shiftProgress >= 50
                ? 'bg-blue-600'
                : 'bg-amber-500'
            }
          />
        </div>

        {/* Bottom Action Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
            <span>
              Policy: Minimum 4.0 hrs required for half-day credit; 8.0 hrs for standard full-day.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isNotStarted && (
              <Button
                onClick={onClockIn}
                disabled={isPunchPending}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs h-9 px-4 shadow-2xs font-medium"
              >
                {isPunchPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-1.5 h-4 w-4" />
                )}
                Punch In for Today
              </Button>
            )}

            {isWorking && (
              <Button
                variant="destructive"
                onClick={onClockOut}
                disabled={isPunchPending}
                className="text-xs h-9 px-4 shadow-2xs font-medium"
              >
                {isPunchPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-1.5 h-4 w-4" />
                )}
                Clock Out & Complete Shift
              </Button>
            )}

            {isCompleted && (
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Shift Finished ({todayAttendance?.total_hours ? `${todayAttendance.total_hours} hrs` : 'Logged'})
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
