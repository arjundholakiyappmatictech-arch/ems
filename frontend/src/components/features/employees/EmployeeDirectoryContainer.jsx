'use client';

import * as React from 'react';
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

export default function EmployeeDirectoryContainer() {
  const isManager = useIsManager();

  // State
  const [searchTerm, setSearchTerm] = React.useState('');
  const [departmentFilter, setDepartmentFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [isOnboardModalOpen, setIsOnboardModalOpen] = React.useState(false);
  const [updatingEmployeeId, setUpdatingEmployeeId] = React.useState(null);

  // Queries
  const { data: employees = [], isLoading } = useEmployeeListQuery();
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

  // Synchronously filter employees during render (zero useEffect)
  const filteredEmployees = React.useMemo(() => {
    return employees.filter((emp) => {
      const user = emp.user || {};
      const matchesSearch =
        !searchTerm ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Employee Directory
        </h1>
        <p className="text-sm text-slate-500">
          Manage your organization&apos;s team roster, departments, and active statuses.
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
      {isManager && (
        <OnboardEmployeeModal
          isOpen={isOnboardModalOpen}
          onClose={() => setIsOnboardModalOpen(false)}
          departments={departments}
          designations={designations}
          onSubmit={handleOnboardSubmit}
          isLoading={createEmployeeMutation.isPending}
        />
      )}
    </div>
  );
}

