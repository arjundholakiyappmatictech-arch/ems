'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Briefcase } from 'lucide-react';
import { designationSchema } from './organizationSchemas';
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

export default function DesignationModal({
  isOpen,
  onClose,
  departments = [],
  designation = null,
  defaultDepartmentId = null,
  onSubmit,
  isLoading,
}) {
  const isEditing = Boolean(designation);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(designationSchema),
    defaultValues: {
      title: '',
      department_id: defaultDepartmentId || '',
      description: '',
    },
  });

  React.useEffect(() => {
    if (designation) {
      reset({
        title: designation.title || '',
        department_id: designation.department_id || designation.department?.id || '',
        description: designation.description || '',
      });
    } else {
      reset({
        title: '',
        department_id: defaultDepartmentId || '',
        description: '',
      });
    }
  }, [designation, defaultDepartmentId, reset, isOpen]);

  const handleFormSubmit = async (values) => {
    try {
      await onSubmit(values);
      reset();
      onClose();
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        mapLaravelErrorsToForm(err.response.data.errors, setError);
      } else {
        alert(err.response?.data?.message || 'Failed to save designation');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Edit Job Designation' : 'Create Job Designation'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEditing
                  ? 'Update the job title and parent department association.'
                  : 'Define a new job title linked to a department.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          {/* Parent Department */}
          <div className="space-y-1.5">
            <Label htmlFor="desig-dept" className="text-xs font-medium text-slate-700">
              Parent Department *
            </Label>
            <select
              id="desig-dept"
              className="flex h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-1 text-xs text-slate-800 shadow-2xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50 transition-colors"
              disabled={isLoading}
              {...register('department_id')}
            >
              <option value="">Select Parent Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} {dept.code ? `(${dept.code})` : ''}
                </option>
              ))}
            </select>
            {errors.department_id && (
              <p className="text-[11px] font-medium text-rose-600">{errors.department_id.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="desig-title" className="text-xs font-medium text-slate-700">
              Job Title *
            </Label>
            <Input
              id="desig-title"
              placeholder="e.g. Senior Backend Engineer"
              disabled={isLoading}
              className="h-9 text-xs"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-[11px] font-medium text-rose-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="desig-desc" className="text-xs font-medium text-slate-700">
              Role Description (Optional)
            </Label>
            <Textarea
              id="desig-desc"
              placeholder="Key responsibilities, seniority level, and requirements..."
              className="min-h-[80px] text-xs resize-y"
              disabled={isLoading}
              {...register('description')}
            />
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
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Designation'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
