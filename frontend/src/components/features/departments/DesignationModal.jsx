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
        department_id: designation.department_id || '',
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
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            {isEditing ? 'Edit Designation' : 'Create Designation'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the job title and department association.'
              : 'Add a new job title or designation mapped to a department.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          {/* Parent Department */}
          <div className="space-y-1.5">
            <Label htmlFor="desig-dept">Department *</Label>
            <select
              id="desig-dept"
              className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
              disabled={isLoading}
              {...register('department_id')}
            >
              <option value="">Select Parent Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department_id && (
              <p className="text-xs font-medium text-red-600">{errors.department_id.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="desig-title">Job Title *</Label>
            <Input
              id="desig-title"
              placeholder="e.g. Senior Software Engineer"
              disabled={isLoading}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs font-medium text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="desig-desc">Role Description</Label>
            <Textarea
              id="desig-desc"
              placeholder="Key responsibilities and qualifications..."
              disabled={isLoading}
              {...register('description')}
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
                  Saving...
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

