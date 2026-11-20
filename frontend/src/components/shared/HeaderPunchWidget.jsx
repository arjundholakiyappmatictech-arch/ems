'use client';

import * as React from 'react';
import { Clock, CheckCircle2, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useTodayAttendanceQuery,
  useClockInMutation,
  useClockOutMutation,
} from '@/hooks/queries/useAttendances';

export default function HeaderPunchWidget() {
  const { data: today, isLoading } = useTodayAttendanceQuery();
  const clockInMutation = useClockInMutation();
  const clockOutMutation = useClockOutMutation();

  const isPending = clockInMutation.isPending || clockOutMutation.isPending;

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
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Syncing punch...</span>
      </div>
    );
  }

  // Not clocked in yet today
  if (!today || !today.clock_in) {
    return (
      <Button
        size="sm"
        variant="default"
        className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
        onClick={handleClockIn}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
        ) : (
          <LogIn className="mr-1 h-3.5 w-3.5" />
        )}
        Clock In
      </Button>
    );
  }

  // Clocked in and still working
  if (today.clock_in && !today.clock_out) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs">
          <Clock className="mr-1 h-3 w-3 text-emerald-600" />
          In: {today.clock_in.substring(11, 16) || today.clock_in}
        </Badge>
        <Button
          size="sm"
          variant="destructive"
          className="text-xs h-8"
          onClick={handleClockOut}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <LogOut className="mr-1 h-3.5 w-3.5" />
          )}
          Clock Out
        </Button>
      </div>
    );
  }

  // Completed day shift
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">
        <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-blue-600" />
        Shift Done ({today.total_hours ?? 'Completed'}h)
      </Badge>
    </div>
  );
}

