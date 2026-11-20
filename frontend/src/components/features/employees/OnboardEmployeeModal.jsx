'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus, Building2, Briefcase, Lock, Mail, User, Calendar, Phone, DollarSign } from 'lucide-react';
import { employeeSchema } from './employeeSchema';
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
import { mapLaravelErrorsToForm } from '@/lib/utils/formErrors';

export default function OnboardEmployeeModal({
  isOpen,
  onClose,
  departments = [],
  designations = [],
  managers = [],
  onSubmit,
  isLoading,
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: 'password123',
      department_id: '',
      designation_id: '',
      joining_date: new Date().toISOString().slice(0, 10),
      phone: '',
      manager_id: '',
      salary: '',
      role: 'employee',
      status: 'probation',
    },
  });

  const selectedDepartmentId = watch('department_id');

  // Dynamically filter designations matching selected department
  const filteredDesignations = React.useMemo(() => {
    if (!selectedDepartmentId) return designations;
    return designations.filter(
      (d) => String(d.department_id) === String(selectedDepartmentId)
    );
  }, [designations, selectedDepartmentId]);

  const handleFormSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        manager_id: values.manager_id ? Number(values.manager_id) : null,
        salary: values.salary ? Number(values.salary) : 0,
      };
      await onSubmit(payload);
      reset();
      onClose();
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        mapLaravelErrorsToForm(err.response.data.errors, setError);
      } else {
        alert(err.response?.data?.message || 'Failed to onboard employee');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Onboard New Team Member
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Provision user credentials and corporate employment profile.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          {/* Identity: First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="first_name" className="text-xs font-medium text-slate-700">
                First Name *
              </Label>
              <Input
                id="first_name"
                placeholder="e.g. Marcus"
                disabled={isLoading}
                {...register('first_name')}
              />
              {errors.first_name && (
                <p className="text-[11px] font-medium text-rose-600">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="last_name" className="text-xs font-medium text-slate-700">
                Last Name *
              </Label>
              <Input
                id="last_name"
                placeholder="e.g. Vance"
                disabled={isLoading}
                {...register('last_name')}
              />
              {errors.last_name && (
                <p className="text-[11px] font-medium text-rose-600">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Account Credentials: Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-slate-700">
                Corporate Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="marcus@ems.local"
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[11px] font-medium text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                Initial Password * (min. 8 chars)
              </Label>
              <Input
                id="password"
                type="text"
                placeholder="password123"
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-[11px] font-medium text-rose-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Organizational Assignment: Department & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="department_id" className="text-xs font-medium text-slate-700">
                Department *
              </Label>
              <select
                id="department_id"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 disabled:opacity-50"
                disabled={isLoading}
                {...register('department_id')}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <p className="text-[11px] font-medium text-rose-600">{errors.department_id.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="designation_id" className="text-xs font-medium text-slate-700">
                Designation / Job Role *
              </Label>
              <select
                id="designation_id"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 disabled:opacity-50"
                disabled={isLoading}
                {...register('designation_id')}
              >
                <option value="">Select Designation</option>
                {filteredDesignations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.title}
                  </option>
                ))}
              </select>
              {errors.designation_id && (
                <p className="text-[11px] font-medium text-rose-600">{errors.designation_id.message}</p>
              )}
            </div>
          </div>

          {/* Role & Reporting Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs font-medium text-slate-700">
                System Role *
              </Label>
              <select
                id="role"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 disabled:opacity-50"
                disabled={isLoading}
                {...register('role')}
              >
                <option value="employee">Employee (Individual Contributor)</option>
                <option value="manager">Manager (Team Lead / Administrator)</option>
              </select>
              {errors.role && (
                <p className="text-[11px] font-medium text-rose-600">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manager_id" className="text-xs font-medium text-slate-700">
                Direct Reporting Manager (Optional)
              </Label>
              <select
                id="manager_id"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 disabled:opacity-50"
                disabled={isLoading}
                {...register('manager_id')}
              >
                <option value="">No Direct Manager (Top-Level / Self-Directed)</option>
                {managers.map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.first_name} {mgr.last_name} ({mgr.employee_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Joining Date, Phone & Compensation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="joining_date" className="text-xs font-medium text-slate-700">
                Joining Date *
              </Label>
              <Input
                id="joining_date"
                type="date"
                disabled={isLoading}
                {...register('joining_date')}
              />
              {errors.joining_date && (
                <p className="text-[11px] font-medium text-rose-600">{errors.joining_date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium text-slate-700">
                Contact Phone
              </Label>
              <Input
                id="phone"
                placeholder="+1 555-0199"
                disabled={isLoading}
                {...register('phone')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="salary" className="text-xs font-medium text-slate-700">
                Annual Salary ($)
              </Label>
              <Input
                id="salary"
                type="number"
                step="0.01"
                placeholder="75000"
                disabled={isLoading}
                {...register('salary')}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Onboarding...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Onboard Member</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
