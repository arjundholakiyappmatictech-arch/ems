'use client';

import * as React from 'react';
import { AlertCircle, X } from 'lucide-react';
import DepartmentsView from './DepartmentsView';
import DepartmentModal from './DepartmentModal';
import DesignationModal from './DesignationModal';
import {
  useDepartmentListQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDestroyDepartmentMutation,
} from '@/hooks/queries/useDepartments';
import {
  useDesignationListQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDestroyDesignationMutation,
} from '@/hooks/queries/useDesignations';
import { useEmployeeListQuery } from '@/hooks/queries/useEmployees';
import { useIsManager } from '@/lib/store/authStore';

export default function DepartmentsContainer() {
  const isManager = useIsManager();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  // Department modal state
  const [isDeptModalOpen, setIsDeptModalOpen] = React.useState(false);
  const [editingDept, setEditingDept] = React.useState(null);

  // Designation modal state
  const [isDesigModalOpen, setIsDesigModalOpen] = React.useState(false);
  const [editingDesig, setEditingDesig] = React.useState(null);
  const [defaultDepartmentId, setDefaultDepartmentId] = React.useState(null);

  // Queries
  const { data: departments = [] } = useDepartmentListQuery();
  const { data: designations = [] } = useDesignationListQuery();
  const { data: employees = [] } = useEmployeeListQuery();

  // Department mutations
  const createDeptMutation = useCreateDepartmentMutation();
  const updateDeptMutation = useUpdateDepartmentMutation();
  const destroyDeptMutation = useDestroyDepartmentMutation();

  // Designation mutations
  const createDesigMutation = useCreateDesignationMutation();
  const updateDesigMutation = useUpdateDesignationMutation();
  const destroyDesigMutation = useDestroyDesignationMutation();

  // Department Handlers
  const handleOpenCreateDept = () => {
    setEditingDept(null);
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept) => {
    setEditingDept(dept);
    setIsDeptModalOpen(true);
  };

  const handleDeleteDept = async (id) => {
    setErrorMessage('');
    try {
      await destroyDeptMutation.mutateAsync(id);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          'Cannot delete department with active designations or assigned employees'
      );
    }
  };

  const handleDeptSubmit = async (values) => {
    setErrorMessage('');
    try {
      if (editingDept) {
        await updateDeptMutation.mutateAsync({ id: editingDept.id, payload: values });
      } else {
        await createDeptMutation.mutateAsync(values);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save department';
      setErrorMessage(msg);
      throw err;
    }
  };

  // Designation Handlers
  const handleOpenCreateDesig = (deptId = null) => {
    setEditingDesig(null);
    setDefaultDepartmentId(deptId);
    setIsDesigModalOpen(true);
  };

  const handleOpenEditDesig = (desig) => {
    setEditingDesig(desig);
    setDefaultDepartmentId(desig.department_id || desig.department?.id);
    setIsDesigModalOpen(true);
  };

  const handleDeleteDesig = async (id) => {
    setErrorMessage('');
    try {
      await destroyDesigMutation.mutateAsync(id);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          'Cannot delete designation with actively assigned employees'
      );
    }
  };

  const handleDesigSubmit = async (values) => {
    setErrorMessage('');
    try {
      if (editingDesig) {
        await updateDesigMutation.mutateAsync({ id: editingDesig.id, payload: values });
      } else {
        await createDesigMutation.mutateAsync(values);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save designation';
      setErrorMessage(msg);
      throw err;
    }
  };

  // Synchronously filter departments during render (zero useEffect)
  const filteredDepartments = React.useMemo(() => {
    if (!searchTerm) return departments;
    const lower = searchTerm.toLowerCase();
    return departments.filter((d) => {
      const matchesDept =
        d.name?.toLowerCase().includes(lower) ||
        d.code?.toLowerCase().includes(lower) ||
        d.description?.toLowerCase().includes(lower);

      const hasMatchingDesig = designations.some(
        (des) =>
          String(des.department_id || des.department?.id) === String(d.id) &&
          des.title?.toLowerCase().includes(lower)
      );

      return matchesDept || hasMatchingDesig;
    });
  }, [departments, designations, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-rose-500 hover:text-rose-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <DepartmentsView
        departments={filteredDepartments}
        designations={designations}
        employees={employees}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isManager={isManager}
        onOpenCreateDeptModal={handleOpenCreateDept}
        onOpenEditDeptModal={handleOpenEditDept}
        onDeleteDept={handleDeleteDept}
        onOpenCreateDesigModal={handleOpenCreateDesig}
        onOpenEditDesigModal={handleOpenEditDesig}
        onDeleteDesig={handleDeleteDesig}
      />

      {/* Department Modal */}
      {isManager && (
        <DepartmentModal
          isOpen={isDeptModalOpen}
          onClose={() => setIsDeptModalOpen(false)}
          department={editingDept}
          onSubmit={handleDeptSubmit}
          isLoading={createDeptMutation.isPending || updateDeptMutation.isPending}
        />
      )}

      {/* Designation Modal */}
      {isManager && (
        <DesignationModal
          isOpen={isDesigModalOpen}
          onClose={() => setIsDesigModalOpen(false)}
          departments={departments}
          designation={editingDesig}
          defaultDepartmentId={defaultDepartmentId}
          onSubmit={handleDesigSubmit}
          isLoading={createDesigMutation.isPending || updateDesigMutation.isPending}
        />
      )}
    </div>
  );
}
