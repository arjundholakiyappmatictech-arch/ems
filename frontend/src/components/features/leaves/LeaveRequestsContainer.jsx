'use client';

import * as React from 'react';
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
import { useIsManager } from '@/lib/store/authStore';

export default function LeaveRequestsContainer() {
  const isManager = useIsManager();

  // Filters state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');

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
    await createLeaveMutation.mutateAsync(payload);
  };

  const handleOpenActionModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async (id, payload) => {
    setProcessingId(id);
    try {
      if (actionType === 'approve') {
        await approveMutation.mutateAsync({ id, payload });
      } else {
        await rejectMutation.mutateAsync({ id, payload });
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelRequest = async (id) => {
    if (confirm('Are you sure you want to cancel this leave application?')) {
      setProcessingId(id);
      try {
        await cancelMutation.mutateAsync(id);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel leave request');
      } finally {
        setProcessingId(null);
      }
    }
  };

  // Synchronously filter requests during render (zero useEffect)
  const filteredRequests = React.useMemo(() => {
    return leaveRequests.filter((req) => {
      const user = req.employee?.user;
      const lowerSearch = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        user?.name?.toLowerCase().includes(lowerSearch) ||
        req.reason?.toLowerCase().includes(lowerSearch) ||
        req.employee?.employee_code?.toLowerCase().includes(lowerSearch);

      const matchesType =
        typeFilter === 'all' || String(req.leave_type_id) === String(typeFilter);

      const matchesStatus =
        statusFilter === 'all' || req.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [leaveRequests, searchTerm, typeFilter, statusFilter]);

  return (
    <>
      <LeaveRequestsView
        leaveRequests={filteredRequests}
        leaveTypes={leaveTypes}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        isManager={isManager}
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
    </>
  );
}

