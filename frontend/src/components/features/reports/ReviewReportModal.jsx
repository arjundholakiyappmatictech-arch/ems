'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, MessageSquare } from 'lucide-react';
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
      review_remarks: '',
    },
  });

  React.useEffect(() => {
    if (report) {
      reset({
        review_remarks: report.review_remarks || 'Great progress, approved.',
      });
    } else {
      reset({ review_remarks: '' });
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
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Review Work Report
          </DialogTitle>
          <DialogDescription>
            Provide manager remarks, guidance, or acknowledgment for this daily report.
          </DialogDescription>
        </DialogHeader>

        {report && (
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>{report.employee?.user?.name || 'Employee'}</span>
              <span>{report.report_date ? String(report.report_date).slice(0, 10) : ''}</span>
            </div>
            <p className="text-slate-600 line-clamp-3 italic">
              &quot;{report.deliverables}&quot;
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="review-remarks">Manager Remarks / Feedback *</Label>
            <Textarea
              id="review-remarks"
              placeholder="e.g. Excellent work on the API refactor, blocker resolved..."
              className="min-h-[90px]"
              disabled={isLoading}
              {...register('review_remarks')}
            />
            {errors.review_remarks && (
              <p className="text-xs font-medium text-red-600">{errors.review_remarks.message}</p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
