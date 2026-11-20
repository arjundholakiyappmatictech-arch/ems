'use client';

import * as React from 'react';
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
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await destroyDeptMutation.mutateAsync(id);
      } catch (err) {
        alert(err.response?.data?.message || 'Cannot delete department with active designations or employees');
      }
    }
  };

  const handleDeptSubmit = async (values) => {
    if (editingDept) {
      await updateDeptMutation.mutateAsync({ id: editingDept.id, payload: values });
    } else {
      await createDeptMutation.mutateAsync(values);
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
    setDefaultDepartmentId(desig.department_id);
    setIsDesigModalOpen(true);
  };

  const handleDesigSubmit = async (values) => {
    if (editingDesig) {
      await updateDesigMutation.mutateAsync({ id: editingDesig.id, payload: values });
    } else {
      await createDesigMutation.mutateAsync(values);
    }
  };

  // Synchronously filter departments during render (zero useEffect)
  const filteredDepartments = React.useMemo(() => {
    if (!searchTerm) return departments;
    const lower = searchTerm.toLowerCase();
    return departments.filter(
      (d) =>
        d.name?.toLowerCase().includes(lower) ||
        d.description?.toLowerCase().includes(lower)
    );
  }, [departments, searchTerm]);

  return (
    <>
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
    </>
  );
}

