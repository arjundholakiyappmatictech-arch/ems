'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { leaveActionSchema } from './leaveRequestSchema';
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

export default function LeaveActionModal({
  isOpen,
  onClose,
  request = null,
  action = 'approve', // 'approve' | 'reject'
  onSubmit,
  isLoading,
}) {
  const isApprove = action === 'approve';

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: isApprove ? undefined : zodResolver(leaveActionSchema),
    defaultValues: {
      action_reason: '',
    },
  });

  React.useEffect(() => {
    reset({ action_reason: '' });
  }, [action, reset, isOpen]);

  const handleFormSubmit = async (values) => {
    try {
      const payload = isApprove ? {} : { action_reason: values.action_reason };
      await onSubmit(request.id, payload);
      reset();
      onClose();
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        mapLaravelErrorsToForm(err.response.data.errors, setError);
      } else {
        alert(err.response?.data?.message || `Failed to ${action} leave request`);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                isApprove
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
                  : 'bg-rose-50 text-rose-600 border-rose-200/60'
              }`}
            >
              {isApprove ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {isApprove ? 'Approve Leave Request' : 'Reject Leave Request'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isApprove
                  ? 'Confirm approval for this employee leave request.'
                  : 'Provide a mandatory reason for declining this request.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {request && (
          <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>{request.employee?.user?.name || request.employee?.first_name || 'Employee'}</span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {request.total_days} {request.total_days === 1 ? 'day' : 'days'}
              </Badge>
            </div>
            <div className="text-slate-600">
              <span className="font-medium text-slate-700">Type: </span>
              {request.leave_type?.name || 'Leave'}
            </div>
            <div className="text-slate-600">
              <span className="font-medium text-slate-700">Period: </span>
              {request.start_date} to {request.end_date}
            </div>
            {request.reason && (
              <div className="text-slate-600 italic">
                <span className="font-medium text-slate-700 not-italic">Reason: </span>
                &quot;{request.reason}&quot;
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-1">
          {!isApprove && (
            <div className="space-y-1.5">
              <Label htmlFor="action_reason" className="text-xs font-medium text-slate-700">
                Rejection Reason *
              </Label>
              <Textarea
                id="action_reason"
                placeholder="e.g. Critical release sprint scheduled during this window. Please reschedule for following week."
                className="min-h-[90px] text-xs resize-y"
                disabled={isLoading}
                {...register('action_reason')}
              />
              {errors.action_reason && (
                <p className="text-[11px] font-medium text-rose-600">{errors.action_reason.message}</p>
              )}
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className={`gap-1.5 ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isApprove ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirm Approval</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  <span>Reject Request</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
