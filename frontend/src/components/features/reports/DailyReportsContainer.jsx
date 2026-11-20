'use client';

import * as React from 'react';
import DailyReportsView from './DailyReportsView';
import SubmitReportModal from './SubmitReportModal';
import ReviewReportModal from './ReviewReportModal';
import {
  useDailyReportListQuery,
  useCreateDailyReportMutation,
  useUpdateDailyReportMutation,
  useReviewDailyReportMutation,
} from '@/hooks/queries/useDailyReports';
import { useIsManager } from '@/lib/store/authStore';

export default function DailyReportsContainer() {
  const isManager = useIsManager();

  // Filters state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

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

  // Check if current user filed report today
  const todayStr = new Date().toISOString().slice(0, 10);
  const hasReportToday = reports.some(
    (rep) => (rep.report_date?.slice(0, 10) || rep.created_at?.slice(0, 10)) === todayStr
  );

  // Submit report handler (create or edit)
  const handleSubmitReport = async (payload) => {
    if (editingReport) {
      await updateReportMutation.mutateAsync({ id: editingReport.id, payload });
    } else {
      await createReportMutation.mutateAsync(payload);
    }
  };

  // Review report handler
  const handleReviewReport = async (payload) => {
    if (reviewingReport) {
      await reviewReportMutation.mutateAsync({ id: reviewingReport.id, payload });
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
      const user = rep.employee?.user;
      const lowerSearch = searchTerm.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        rep.deliverables?.toLowerCase().includes(lowerSearch) ||
        rep.blockers?.toLowerCase().includes(lowerSearch) ||
        user?.name?.toLowerCase().includes(lowerSearch) ||
        rep.employee?.employee_code?.toLowerCase().includes(lowerSearch);

      const repDate = rep.report_date ? String(rep.report_date).slice(0, 10) : '';
      const matchesDate = !dateFilter || repDate === dateFilter;

      const isReviewed = Boolean(rep.review_remarks);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'reviewed' && isReviewed) ||
        (statusFilter === 'pending' && !isReviewed);

      return matchesSearch && matchesDate && matchesStatus;
    });
  }, [reports, searchTerm, dateFilter, statusFilter]);

  return (
    <>
      <DailyReportsView
        reports={filteredReports}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isManager={isManager}
        hasReportToday={hasReportToday}
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
    </>
  );
}

