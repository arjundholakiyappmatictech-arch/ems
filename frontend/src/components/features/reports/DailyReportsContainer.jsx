'use client';

import * as React from 'react';
import { AlertCircle, X } from 'lucide-react';
import DailyReportsView from './DailyReportsView';
import SubmitReportModal from './SubmitReportModal';
import ReviewReportModal from './ReviewReportModal';
import {
  useDailyReportListQuery,
  useCreateDailyReportMutation,
  useUpdateDailyReportMutation,
  useReviewDailyReportMutation,
} from '@/hooks/queries/useDailyReports';
import { useAuthStore, useIsManager } from '@/lib/store/authStore';

export default function DailyReportsContainer() {
  const isManager = useIsManager();
  const currentUser = useAuthStore((s) => s.user);
  const currentEmployeeId = currentUser?.employee?.id;

  // Filters state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [errorMessage, setErrorMessage] = React.useState('');

  // Modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false);
  const [editingReport, setEditingReport] = React.useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
  const [reviewingReport, setReviewingReport] = React.useState(null);

  // Queries
  const { data: reports = [] } = useDailyReportListQuery();

  // Mutations
  const createReportMutation = useCreateDailyReportMutation();
  const updateReportMutation = useUpdateDailyReportMutation();
  const reviewReportMutation = useReviewDailyReportMutation();

  // Identify today's report for the logged in user
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayReport = React.useMemo(() => {
    return reports.find((rep) => {
      const repDate = rep.date ? String(rep.date).slice(0, 10) : (rep.report_date ? String(rep.report_date).slice(0, 10) : '');
      const isUserReport = currentEmployeeId
        ? rep.employee?.id === currentEmployeeId
        : rep.employee?.name === currentUser?.name;
      return repDate === todayStr && isUserReport;
    });
  }, [reports, todayStr, currentEmployeeId, currentUser?.name]);

  // Submit report handler (create or edit)
  const handleSubmitReport = async (payload) => {
    setErrorMessage('');
    try {
      if (editingReport) {
        await updateReportMutation.mutateAsync({ id: editingReport.id, payload });
      } else {
        await createReportMutation.mutateAsync(payload);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit report';
      setErrorMessage(msg);
      throw err;
    }
  };

  // Review report handler
  const handleReviewReport = async (payload) => {
    setErrorMessage('');
    try {
      if (reviewingReport) {
        await reviewReportMutation.mutateAsync({ id: reviewingReport.id, payload });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review';
      setErrorMessage(msg);
      throw err;
    }
  };

  // Modal open helpers
  const handleOpenSubmit = () => {
    setEditingReport(null);
    setIsSubmitModalOpen(true);
  };

  const handleOpenEdit = (report) => {
    setEditingReport(report);
    setIsSubmitModalOpen(true);
  };

  const handleOpenReview = (report) => {
    setReviewingReport(report);
    setIsReviewModalOpen(true);
  };

  // Synchronously filter reports during render (zero useEffect)
  const filteredReports = React.useMemo(() => {
    return reports.filter((rep) => {
      const emp = rep.employee;
      const empName = (emp?.name || emp?.user?.name || '').toLowerCase();
      const empCode = (emp?.code || emp?.employee_code || '').toLowerCase();
      const tasks = (rep.tasks_completed || rep.deliverables || '').toLowerCase();
      const blockers = (rep.blockers || '').toLowerCase();

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        tasks.includes(search) ||
        blockers.includes(search) ||
        empName.includes(search) ||
        empCode.includes(search);

      const repDate = rep.date ? String(rep.date).slice(0, 10) : (rep.report_date ? String(rep.report_date).slice(0, 10) : '');
      const matchesDate = !dateFilter || repDate === dateFilter;

      const isReviewed = rep.status === 'reviewed' || Boolean(rep.manager_remarks);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'reviewed' && isReviewed) ||
        (statusFilter === 'pending' && !isReviewed);

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [reports, searchTerm, dateFilter, statusFilter]);

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

      <DailyReportsView
        reports={filteredReports}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isManager={isManager}
        currentUserId={currentUser?.id}
        currentEmployeeId={currentEmployeeId}
        todayReport={todayReport}
        onOpenSubmitModal={handleOpenSubmit}
        onOpenEditModal={handleOpenEdit}
        onOpenReviewModal={handleOpenReview}
      />

      {/* Submit / Edit Modal */}
      <SubmitReportModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        report={editingReport}
        onSubmit={handleSubmitReport}
        isLoading={createReportMutation.isPending || updateReportMutation.isPending}
      />

      {/* Manager Review Modal */}
      {isManager && (
        <ReviewReportModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          report={reviewingReport}
          onSubmit={handleReviewReport}
          isLoading={reviewReportMutation.isPending}
        />
      )}
    </div>
  );
}
