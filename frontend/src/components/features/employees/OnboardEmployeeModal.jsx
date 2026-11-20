'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus } from 'lucide-react';
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
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      password: 'password123',
      department_id: '',
      designation_id: '',
      date_of_joining: new Date().toISOString().slice(0, 10),
      phone: '',
      salary: '',
      role: 'employee',
    },
  });

  const handleFormSubmit = async (values) => {
    try {
      await onSubmit(values);
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Onboard New Employee
          </DialogTitle>
          <DialogDescription>
            Atomically creates a new employee profile and system user login credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="John Doe" disabled={isLoading} {...register('name')} />
              {errors.name && (
                <p className="text-xs font-medium text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Work Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@ems.local"
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Temporary Password *</Label>
              <Input
                id="password"
                type="text"
                placeholder="password123"
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs font-medium text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label htmlFor="role">Role Permission *</Label>
              <select
                id="role"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
                disabled={isLoading}
                {...register('role')}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
              {errors.role && (
                <p className="text-xs font-medium text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-1.5">
              <Label htmlFor="department_id">Department *</Label>
              <select
                id="department_id"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
                disabled={isLoading}
                {...register('department_id')}
              >
                <option value="">Select Department</option>
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

            {/* Designation */}
            <div className="space-y-1.5">
              <Label htmlFor="designation_id">Designation *</Label>
              <select
                id="designation_id"
                className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-50"
                disabled={isLoading}
                {...register('designation_id')}
              >
                <option value="">Select Designation</option>
                {designations.map((desig) => (
                  <option key={desig.id} value={desig.id}>
                    {desig.title} ({desig.department?.name || 'General'})
                  </option>
                ))}
              </select>
              {errors.designation_id && (
                <p className="text-xs font-medium text-red-600">{errors.designation_id.message}</p>
              )}
            </div>

            {/* Date of Joining */}
            <div className="space-y-1.5">
              <Label htmlFor="date_of_joining">Date of Joining *</Label>
              <Input
                id="date_of_joining"
                type="date"
                disabled={isLoading}
                {...register('date_of_joining')}
              />
              {errors.date_of_joining && (
                <p className="text-xs font-medium text-red-600">{errors.date_of_joining.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                placeholder="+1 555-0199"
                disabled={isLoading}
                {...register('phone')}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Onboard Employee'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

