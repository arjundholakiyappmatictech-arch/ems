'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Building2 } from 'lucide-react';
import { departmentSchema } from './organizationSchemas';
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

export default function DepartmentModal({
  isOpen,
  onClose,
  department = null,
  onSubmit,
  isLoading,
}) {
  const isEditing = Boolean(department);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  React.useEffect(() => {
    if (department) {
      reset({
        name: department.name || '',
        code: department.code || '',
        description: department.description || '',
      });
    } else {
      reset({ name: '', code: '', description: '' });
    }
  }, [department, reset, isOpen]);

  const handleFormSubmit = async (values) => {
    try {
      await onSubmit(values);
      reset();
      onClose();
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        mapLaravelErrorsToForm(err.response.data.errors, setError);
      } else {
        alert(err.response?.data?.message || 'Failed to save department');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Edit Department' : 'Create Department'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Define an organizational business unit.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          {/* Department Name */}
          <div className="space-y-1.5">
            <Label htmlFor="dept-name" className="text-xs font-medium text-slate-700">
              Department Name *
            </Label>
            <Input
              id="dept-name"
              placeholder="e.g. Engineering, Sales & Marketing"
              disabled={isLoading}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-[11px] font-medium text-rose-600">{errors.name.message}</p>
            )}
          </div>

          {/* Department Code */}
          <div className="space-y-1.5">
            <Label htmlFor="dept-code" className="text-xs font-medium text-slate-700">
              Department Code * (e.g. ENG, MKT, HR)
            </Label>
            <Input
              id="dept-code"
              placeholder="e.g. ENG"
              maxLength={20}
              className="uppercase font-mono"
              disabled={isLoading}
              {...register('code')}
            />
            {errors.code && (
              <p className="text-[11px] font-medium text-rose-600">{errors.code.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="dept-desc" className="text-xs font-medium text-slate-700">
              Description (Optional)
            </Label>
            <Textarea
              id="dept-desc"
              placeholder="Division mission, scope, and technical responsibilities..."
              className="min-h-[80px] text-xs resize-y"
              disabled={isLoading}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-[11px] font-medium text-rose-600">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Create Department'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
