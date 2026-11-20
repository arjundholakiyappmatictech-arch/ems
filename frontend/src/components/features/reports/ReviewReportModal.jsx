'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { reviewReportSchema } from './dailyReportSchema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { mapLaravelErrorsToForm } from '@/lib/utils/formErrors';

export default function ReviewReportModal({
  isOpen,
  onClose,
  report = null,
  onSubmit,
  isLoading,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reviewReportSchema),
    defaultValues: {
      manager_remarks: '',
    },
  });

  React.useEffect(() => {
    if (report) {
      reset({
        manager_remarks: report.manager_remarks || 'Work reviewed and approved.',
      });
    } else {
      reset({ manager_remarks: '' });
    }
  }, [report, reset, isOpen]);

  const handleFormSubmit = async (values) => {
    try {
      await onSubmit(values);
      reset();
      onClose();
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        mapLaravelErrorsToForm(err.response.data.errors, setError);
      } else {
        alert(err.response?.data?.message || 'Failed to submit review');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Review Daily Report
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Provide manager remarks and feedback for this report.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {report && (
          <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>{report.employee?.user?.name || report.employee?.first_name || 'Employee'}</span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {String(report.date || '').slice(0, 10)}
              </Badge>
            </div>
            <div className="text-slate-600">
              <span className="font-medium text-slate-700">Tasks: </span>
              {report.tasks_completed}
            </div>
            {report.blockers && (
              <div className="text-amber-800 bg-amber-50 rounded p-1.5 border border-amber-200/60">
                <span className="font-semibold">Blockers: </span>
                {report.blockers}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="manager_remarks" className="text-xs font-medium text-slate-700">
              Manager Remarks & Feedback *
            </Label>
            <Textarea
              id="manager_remarks"
              placeholder="e.g. Great progress on the backend migration. Let's sync tomorrow regarding API caching."
              className="min-h-[100px] text-xs resize-y"
              disabled={isLoading}
              {...register('manager_remarks')}
            />
            {errors.manager_remarks && (
              <p className="text-[11px] font-medium text-rose-600">{errors.manager_remarks.message}</p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Complete Review</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
