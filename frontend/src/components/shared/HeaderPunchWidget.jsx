'use client';

import * as React from 'react';
import { CheckCircle2, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useTodayAttendanceQuery,
  useClockInMutation,
  useClockOutMutation,
} from '@/hooks/queries/useAttendances';
import { parseAttendanceDateTime } from '@/lib/utils';

export default function HeaderPunchWidget() {
  const { data: today, isLoading } = useTodayAttendanceQuery();
  const clockInMutation = useClockInMutation();
  const clockOutMutation = useClockOutMutation();

  const isPending = clockInMutation.isPending || clockOutMutation.isPending;

  // Live Elapsed Ticker State
  const [elapsed, setElapsed] = React.useState('');

  React.useEffect(() => {
    if (!today?.clock_in || today?.clock_out) {
      setElapsed('');
      return;
    }

    const updateTimer = () => {
      try {
        const start = parseAttendanceDateTime(today.clock_in, today.date);
        if (!start) {
          setElapsed('');
          return;
        }
        const diffMs = Math.max(0, Date.now() - start.getTime());

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
  }, [today?.clock_in, today?.clock_out, today?.date]);

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

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="hidden sm:inline">Syncing shift...</span>
      </div>
    );
  }

  // State 1: Not clocked in yet today
  if (!today || !today.clock_in) {
    return (
      <Button
        size="sm"
        variant="default"
        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs h-8 px-3 gap-1.5 shadow-2xs font-medium"
        onClick={handleClockIn}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <LogIn className="h-3.5 w-3.5" />
        )}
        <span>Clock In</span>
      </Button>
    );
  }

  // State 2: Currently clocked in and working (Live Ticker Active!)
  if (today.clock_in && !today.clock_out) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 text-xs text-emerald-800 font-mono font-medium shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold tracking-tight text-emerald-900">
            {elapsed || 'Active Shift'}
          </span>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 px-2.5 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 gap-1.5 font-medium shadow-2xs"
          onClick={handleClockOut}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="h-3.5 w-3.5" />
          )}
          <span>Clock Out</span>
        </Button>
      </div>
    );
  }

  // State 3: Completed day shift
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="success" className="text-xs font-medium py-1 px-2.5" dot={true}>
        Shift Done ({today.total_hours ? `${today.total_hours}h` : 'Logged'})
      </Badge>
    </div>
  );
}
