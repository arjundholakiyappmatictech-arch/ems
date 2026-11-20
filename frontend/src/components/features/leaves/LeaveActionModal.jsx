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

export default function LeaveActionModal({
  isOpen,
  onClose,
  request = null,
  action = 'approve', // 'approve' | 'reject'
  onSubmit,
  isLoading,
}) {
  const isApprove = action === 'approve';

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(leaveActionSchema),
    defaultValues: {
      review_remarks: '',
    },
  });

  React.useEffect(() => {
    reset({
      review_remarks: isApprove ? 'Approved as requested.' : '',
    });
  }, [action, isApprove, reset, isOpen]);

  const handleFormSubmit = async (values) => {
    try {
      await onSubmit(request.id, values);
      reset();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} leave request`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {isApprove ? 'Approve Leave Request' : 'Reject Leave Request'}
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? 'Confirm approval and optionally add remarks for the employee.'
              : 'Please explain the reason for rejecting this leave application.'}
          </DialogDescription>
        </DialogHeader>

        {request && (
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>{request.employee?.user?.name || 'Employee'}</span>
              <span>
                {request.start_date ? String(request.start_date).slice(0, 10) : ''} to{' '}
                {request.end_date ? String(request.end_date).slice(0, 10) : ''} ({request.total_days} days)
              </span>
            </div>
            <p className="text-slate-600 italic">&quot;{request.reason}&quot;</p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="action-remarks">Manager Remarks</Label>
            <Textarea
              id="action-remarks"
              placeholder={isApprove ? 'Approved, have a good time...' : 'Rejection reason (work coverage, blackout period)...'}
              className="min-h-[80px]"
              disabled={isLoading}
              {...register('review_remarks')}
            />
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={isApprove ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isApprove ? (
                'Confirm Approval'
              ) : (
                'Confirm Rejection'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

