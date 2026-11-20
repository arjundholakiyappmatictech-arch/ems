import * as React from 'react';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AttendanceShiftCard({
  todayAttendance,
  isPunchPending,
  onClockIn,
  onClockOut,
}) {
  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">Today&apos;s Shift Clock</CardTitle>
            <CardDescription className="text-xs">{currentDateFormatted}</CardDescription>
          </div>
          <Badge
            variant={
              todayAttendance?.clock_in
                ? todayAttendance?.clock_out
                  ? 'secondary'
                  : 'success'
                : 'warning'
            }
            className="text-xs self-start sm:self-auto py-1 px-2.5"
          >
            {todayAttendance?.clock_in
              ? todayAttendance?.clock_out
                ? 'Shift Completed'
                : 'Currently Working'
              : 'Not Punched In'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 p-4 gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Clock In */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Clock In
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {todayAttendance?.clock_in
                  ? todayAttendance.clock_in.substring(11, 16) || todayAttendance.clock_in
                  : '— : —'}
              </p>
            </div>

            {/* Clock Out */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Clock Out
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {todayAttendance?.clock_out
                  ? todayAttendance.clock_out.substring(11, 16) || todayAttendance.clock_out
                  : '— : —'}
              </p>
            </div>

            {/* Total Duration */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Shift Duration
              </p>
              <p className="mt-1 text-sm font-bold text-blue-600">
                {todayAttendance?.total_hours
                  ? `${todayAttendance.total_hours} hrs`
                  : todayAttendance?.clock_in
                  ? 'In Progress'
                  : '0.0 hrs'}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            {!todayAttendance?.clock_in ? (
              <Button
                onClick={onClockIn}
                disabled={isPunchPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9"
              >
                {isPunchPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="mr-1.5 h-4 w-4" />
                )}
                Clock In
              </Button>
            ) : !todayAttendance?.clock_out ? (
              <Button
                variant="destructive"
                onClick={onClockOut}
                disabled={isPunchPending}
                className="text-xs h-9"
              >
                {isPunchPending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-1.5 h-4 w-4" />
                )}
                Clock Out
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                Punched Out
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

