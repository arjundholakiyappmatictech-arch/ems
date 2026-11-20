'use client';

import * as React from 'react';
import { AlertCircle, X } from 'lucide-react';
import LeaveRequestsView from './LeaveRequestsView';
import ApplyLeaveModal from './ApplyLeaveModal';
import LeaveActionModal from './LeaveActionModal';
import {
  useLeaveTypeListQuery,
  useLeaveRequestListQuery,
  useCreateLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
  useCancelLeaveRequestMutation,
} from '@/hooks/queries/useLeaves';
import { useAuthStore, useIsManager } from '@/lib/store/authStore';

export default function LeaveRequestsContainer() {
  const isManager = useIsManager();
  const currentUser = useAuthStore((s) => s.user);
  const currentEmployeeId = currentUser?.employee?.id;

  // Filters state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [errorMessage, setErrorMessage] = React.useState('');

  // Modal states
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState(null);
  const [actionType, setActionType] = React.useState('approve'); // 'approve' | 'reject'
  const [processingId, setProcessingId] = React.useState(null);

  // Queries
  const { data: leaveTypes = [] } = useLeaveTypeListQuery();
  const { data: leaveRequests = [] } = useLeaveRequestListQuery();

  // Mutations
  const createLeaveMutation = useCreateLeaveRequestMutation();
  const approveMutation = useApproveLeaveRequestMutation();
  const rejectMutation = useRejectLeaveRequestMutation();
  const cancelMutation = useCancelLeaveRequestMutation();

  // Handlers
  const handleApplySubmit = async (payload) => {
    setErrorMessage('');
    try {
      await createLeaveMutation.mutateAsync(payload);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit leave request';
      setErrorMessage(msg);
      throw err;
    }
  };

  const handleOpenActionModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async (id, payload) => {
    setProcessingId(id);
    setErrorMessage('');
    try {
      if (actionType === 'approve') {
        await approveMutation.mutateAsync({ id, payload });
      } else {
        await rejectMutation.mutateAsync({ id, payload });
      }
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to ${actionType} leave request`;
      setErrorMessage(msg);
      throw err;
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRequest = async (id) => {
    setProcessingId(id);
    setErrorMessage('');
    try {
      await cancelMutation.mutateAsync(id);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to cancel leave request');
    } finally {
      setProcessingId(null);
    }
  };

  // Synchronously filter requests during render (zero useEffect)
  const filteredRequests = React.useMemo(() => {
    return leaveRequests.filter((req) => {
      const emp = req.employee;
      const empName = (emp?.name || emp?.user?.name || '').toLowerCase();
      const empCode = (emp?.code || emp?.employee_code || '').toLowerCase();
      const reason = (req.reason || '').toLowerCase();

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        empName.includes(search) ||
        empCode.includes(search) ||
        reason.includes(search);

      const reqTypeId = req.leave_type_id || req.leave_type?.id;
      const matchesType =
        typeFilter === 'all' || String(reqTypeId) === String(typeFilter);

      const matchesStatus =
        statusFilter === 'all' || req.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leaveRequests, searchTerm, typeFilter, statusFilter]);

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

      <LeaveRequestsView
        leaveRequests={filteredRequests}
        allLeaveRequests={leaveRequests}
        leaveTypes={leaveTypes}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        isManager={isManager}
        currentUserId={currentUser?.id}
        currentEmployeeId={currentEmployeeId}
        onOpenApplyModal={() => setIsApplyModalOpen(true)}
        onOpenActionModal={handleOpenActionModal}
        onCancelRequest={handleCancelRequest}
        processingId={processingId}
      />

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        leaveTypes={leaveTypes}
        onSubmit={handleApplySubmit}
        isLoading={createLeaveMutation.isPending}
      />

      {/* Manager Approve / Reject Action Modal */}
      {isManager && (
        <LeaveActionModal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          request={selectedRequest}
          action={actionType}
          onSubmit={handleActionSubmit}
          isLoading={approveMutation.isPending || rejectMutation.isPending}
        />
      )}
    </div>
  );
}
