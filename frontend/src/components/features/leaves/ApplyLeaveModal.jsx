'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CalendarPlus, CalendarDays } from 'lucide-react';
import { leaveRequestSchema } from './leaveRequestSchema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mapLaravelErrorsToForm } from '@/lib/utils/formErrors';

export default function ApplyLeaveModal({
  isOpen,
  onClose,
  leaveTypes = [],
  onSubmit,
  isLoading,
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leave_type_id: '',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
      reason: '',
    },
  });

  const startDate = useWatch({ control, name: 'start_date' });
  const endDate = useWatch({ control, name: 'end_date' });

  // Synchronously compute day count during render (zero useEffect)
  const daysCount = React.useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  const handleFormSubmit = async (values) => {
    try {
      await onSubmit(values);
      reset();
      onClose();
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        mapLaravelErrorsToForm(err.response.data.errors, setError);
      } else {
        alert(err.response?.data?.message || 'Failed to submit leave request');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Apply for Leave
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Submit a formal leave application for manager review and approval.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Leave Type */}
          <div className="space-y-1.5">
            <Label htmlFor="leave-type" className="text-xs font-medium text-slate-700">
              Leave Category *
            </Label>
            <select
              id="leave-type"
              className="flex h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1 text-xs text-slate-800 shadow-2xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50 transition-colors"
              disabled={isLoading}
              {...register('leave_type_id')}
            >
              <option value="">Select Leave Category</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.days_per_year ?? type.days_allowed ?? 12} days/yr)
                </option>
              ))}
            </select>
            {errors.leave_type_id && (
              <p className="text-[11px] font-medium text-rose-600">{errors.leave_type_id.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-date" className="text-xs font-medium text-slate-700">
                Start Date *
              </Label>
              <Input
                id="start-date"
                type="date"
                disabled={isLoading}
                className="h-9 text-xs"
                {...register('start_date')}
              />
              {errors.start_date && (
                <p className="text-[11px] font-medium text-rose-600">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="end-date" className="text-xs font-medium text-slate-700">
                End Date *
              </Label>
              <Input
                id="end-date"
                type="date"
                disabled={isLoading}
                className="h-9 text-xs"
                {...register('end_date')}
              />
              {errors.end_date && (
                <p className="text-[11px] font-medium text-rose-600">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          {/* Duration Summary */}
          <div className="flex items-center justify-between rounded-xl bg-blue-50/60 p-3 border border-blue-100 text-xs shadow-2xs">
            <span className="text-blue-700 flex items-center gap-1.5 font-medium">
              <CalendarDays className="h-4 w-4" /> Requested Duration:
            </span>
            <span className="font-bold text-blue-900 text-sm font-mono">
              {daysCount} {daysCount === 1 ? 'Day' : 'Days'}
            </span>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="leave-reason" className="text-xs font-medium text-slate-700">
              Reason for Absence *
            </Label>
            <Textarea
              id="leave-reason"
              placeholder="Provide reason and relevant context for your leave request..."
              className="min-h-[85px] text-xs resize-y"
              disabled={isLoading}
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-[11px] font-medium text-rose-600">{errors.reason.message}</p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 gap-1.5 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
