'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, FileText } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
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
      deliverables: '',
      blockers: '',
      next_plan: '',
      report_date: new Date().toISOString().slice(0, 10),
    },
  });

  React.useEffect(() => {
    if (report) {
      reset({
        deliverables: report.deliverables || '',
        blockers: report.blockers || '',
        next_plan: report.next_plan || '',
        report_date: report.report_date ? String(report.report_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
    } else {
      reset({
        deliverables: '',
        blockers: '',
        next_plan: '',
        report_date: new Date().toISOString().slice(0, 10),
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
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {isEditing ? 'Update Daily Work Report' : 'Submit Daily Work Report'}
          </DialogTitle>
          <DialogDescription>
            Record what you accomplished today, any blockers faced, and your plans for tomorrow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Report Date */}
          <div className="space-y-1.5">
            <Label htmlFor="rep-date">Report Date *</Label>
            <Input
              id="rep-date"
              type="date"
              disabled={isLoading || isEditing}
              {...register('report_date')}
            />
            {errors.report_date && (
              <p className="text-xs font-medium text-red-600">{errors.report_date.message}</p>
            )}
          </div>

          {/* Key Deliverables */}
          <div className="space-y-1.5">
            <Label htmlFor="rep-deliverables">Today&apos;s Deliverables & Tasks *</Label>
            <Textarea
              id="rep-deliverables"
              placeholder="List the key features, bug fixes, or deliverables completed today..."
              className="min-h-[100px]"
              disabled={isLoading}
              {...register('deliverables')}
            />
            {errors.deliverables && (
              <p className="text-xs font-medium text-red-600">{errors.deliverables.message}</p>
            )}
          </div>

          {/* Blockers */}
          <div className="space-y-1.5">
            <Label htmlFor="rep-blockers">Blockers / Dependencies (Optional)</Label>
            <Textarea
              id="rep-blockers"
              placeholder="Any roadblocks, pending reviews, or missing access..."
              disabled={isLoading}
              {...register('blockers')}
            />
          </div>

          {/* Next Plan */}
          <div className="space-y-1.5">
            <Label htmlFor="rep-plan">Tomorrow&apos;s Action Plan (Optional)</Label>
            <Textarea
              id="rep-plan"
              placeholder="What will you tackle during your next shift..."
              disabled={isLoading}
              {...register('next_plan')}
            />
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
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

