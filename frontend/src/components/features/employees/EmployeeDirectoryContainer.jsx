'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import EmployeeTable from './EmployeeTable';
import OnboardEmployeeModal from './OnboardEmployeeModal';
import {
  useEmployeeListQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeStatusMutation,
} from '@/hooks/queries/useEmployees';
import { useDepartmentListQuery } from '@/hooks/queries/useDepartments';
import { useDesignationListQuery } from '@/hooks/queries/useDesignations';
import { useIsManager } from '@/lib/store/authStore';
import { Button } from '@/components/ui/button';

export default function EmployeeDirectoryContainer() {
  const isManager = useIsManager();

  // State
  const [searchTerm, setSearchTerm] = React.useState('');
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [isOnboardModalOpen, setIsOnboardModalOpen] = React.useState(false);
  const [updatingEmployeeId, setUpdatingEmployeeId] = React.useState(null);

  // Queries (only fired for managers to respect backend 403 rule)
  const { data: employees = [], isLoading } = useEmployeeListQuery({}, { enabled: isManager });
  const { data: departments = [] } = useDepartmentListQuery();
  const { data: designations = [] } = useDesignationListQuery();

  // Mutations
  const createEmployeeMutation = useCreateEmployeeMutation();
  const updateStatusMutation = useUpdateEmployeeStatusMutation();

  // Status toggle handler
  const handleToggleStatus = async (id, nextStatus) => {
    setUpdatingEmployeeId(id);
    try {
      await updateStatusMutation.mutateAsync({ id, payload: { status: nextStatus } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update employee status');
    } finally {
      setUpdatingEmployeeId(null);
    }
  };

  // Onboard handler
  const handleOnboardSubmit = async (payload) => {
    await createEmployeeMutation.mutateAsync(payload);
  };

  // Filter employees
  const filteredEmployees = React.useMemo(() => {
    const list = Array.isArray(employees) ? employees : employees?.data ?? [];
    return list.filter((emp) => {
      const user = emp.user || {};
      const fullName = `${emp.first_name || ''} ${emp.last_name || ''} ${user.name || ''}`.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        fullName.includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        departmentFilter === 'all' ||
        String(emp.department_id) === String(departmentFilter);

      const matchesStatus =
        statusFilter === 'all' || emp.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchTerm, departmentFilter, statusFilter]);

  if (!isManager) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 mb-3.5">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Manager Directory Access Only</h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          The corporate employee directory is restricted to organizational management. You can review your personal workplace status on the dashboard.
        </p>
        <Link href="/" className="mt-4">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Employee Directory
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage corporate roster, departments, reporting lines, and active employment statuses.
        </p>
      </div>

      {/* Directory Table */}
      <EmployeeTable
        employees={filteredEmployees}
        departments={departments}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isManager={isManager}
        onOpenOnboardModal={() => setIsOnboardModalOpen(true)}
        onToggleStatus={handleToggleStatus}
        updatingEmployeeId={updatingEmployeeId}
      />

      {/* Onboarding Dialog */}
      <OnboardEmployeeModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        departments={departments}
        designations={designations}
        managers={filteredEmployees.filter((e) => e.user?.role === 'manager')}
        onSubmit={handleOnboardSubmit}
        isLoading={createEmployeeMutation.isPending}
      />
    </div>
  );
}
