'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { dailyReportSchema } from './dailyReportSchema';
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
import { mapLaravelErrorsToForm } from '@/lib/utils/formErrors';

export default function SubmitReportModal({
  isOpen,
  onClose,
  report = null,
  onSubmit,
  isLoading,
}) {
  const isEditing = Boolean(report);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      tasks_completed: '',
      blockers: '',
      next_plan: '',
    },
  });

  React.useEffect(() => {
    if (report) {
      reset({
        tasks_completed: report.tasks_completed || '',
        blockers: report.blockers || '',
        next_plan: report.next_plan || '',
      });
    } else {
      reset({
        tasks_completed: '',
        blockers: '',
        next_plan: '',
      });
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
        alert(err.response?.data?.message || 'Failed to submit daily report');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Update Daily Work Report' : 'Submit Daily Work Report'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Log completed tasks, dependencies, and upcoming plans for today.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          {/* Tasks Completed */}
          <div className="space-y-1.5">
            <Label htmlFor="tasks_completed" className="text-xs font-medium text-slate-700">
              Completed Tasks & Deliverables *
            </Label>
            <Textarea
              id="tasks_completed"
              placeholder="e.g. Implemented OAuth token revocation, resolved race condition in leave balance calculation, refactored data access layer."
              className="min-h-[110px] text-xs resize-y"
              disabled={isLoading}
              {...register('tasks_completed')}
            />
            {errors.tasks_completed && (
              <p className="text-[11px] font-medium text-rose-600">{errors.tasks_completed.message}</p>
            )}
          </div>

          {/* Blockers */}
          <div className="space-y-1.5">
            <Label htmlFor="blockers" className="text-xs font-medium text-slate-700">
              Blockers / Impediments (Optional)
            </Label>
            <Textarea
              id="blockers"
              placeholder="e.g. Waiting on AWS IAM credentials for staging deployment."
              className="min-h-[70px] text-xs resize-y"
              disabled={isLoading}
              {...register('blockers')}
            />
            {errors.blockers && (
              <p className="text-[11px] font-medium text-rose-600">{errors.blockers.message}</p>
            )}
          </div>

          {/* Next Plan */}
          <div className="space-y-1.5">
            <Label htmlFor="next_plan" className="text-xs font-medium text-slate-700">
              Next Shift Plan (Optional)
            </Label>
            <Textarea
              id="next_plan"
              placeholder="e.g. Integrate Sonner toast alerts, write regression tests for attendance punch status."
              className="min-h-[70px] text-xs resize-y"
              disabled={isLoading}
              {...register('next_plan')}
            />
            {errors.next_plan && (
              <p className="text-[11px] font-medium text-rose-600">{errors.next_plan.message}</p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isEditing ? 'Save Changes' : 'Submit Report'}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
