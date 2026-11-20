'use client';

import * as React from 'react';
import {
  FileText,
  Search,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  MessageSquare,
  Plus,
  ArrowRight,
  ListTodo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function DailyReportsView({
  reports = [],
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  isManager,
  currentUserId,
  currentEmployeeId,
  todayReport,
  onOpenSubmitModal,
  onOpenEditModal,
  onOpenReviewModal,
}) {
  const hasActiveFilters = Boolean(dateFilter || statusFilter !== 'all' || searchTerm);

  // Summary counts
  const totalCount = reports.length;
  const reviewedCount = reports.filter(
    (r) => r.status === 'reviewed' || Boolean(r.manager_remarks)
  ).length;
  const pendingCount = totalCount - reviewedCount;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Header & Submission Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daily Work Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Log daily sprint deliverables, identify impediments, and review team progress.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {todayReport ? (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Today&apos;s Report Filed</span>
              </div>
              {todayReport.status !== 'reviewed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenEditModal(todayReport)}
                  className="h-8 text-xs gap-1 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Report
                </Button>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              onClick={onOpenSubmitModal}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs h-9 px-4 gap-1.5 shadow-2xs font-medium"
            >
              <Plus className="h-4 w-4" />
              <span>Submit Today&apos;s Report</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search tasks, blockers, or employee..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Date Filter */}
          <div className="relative w-full sm:w-44">
            <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="pl-8.5 h-8.5 text-xs bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Review Status Filter */}
          <select
            className="h-8.5 w-full sm:w-36 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 text-xs text-slate-700 shadow-2xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>

        {/* Clear Filters & Counts */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDateFilterChange('');
                onStatusFilterChange('all');
                onSearchChange('');
              }}
              className="h-8 text-xs text-slate-500 hover:text-slate-900 px-2"
            >
              Reset Filters
            </Button>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 pl-2 border-l border-slate-200">
            <span className="font-semibold text-slate-800">{totalCount}</span> total
            <span className="text-slate-300">·</span>
            <span className="text-amber-700 font-medium">{pendingCount} pending</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-medium">{reviewedCount} reviewed</span>
          </div>
        </div>
      </div>

      {/* Linear-Style Chronological Feed */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-14 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                No work reports found
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                {hasActiveFilters
                  ? 'Try clearing your search query or adjusting filters to view other reports.'
                  : "No daily reports have been filed yet. Click 'Submit Today's Report' above to start."}
              </p>
            </div>
          </div>
        ) : (
          reports.map((report) => {
            const emp = report.employee;
            const empName = emp?.name || emp?.user?.name || 'Employee';
            const empCode = emp?.code || emp?.employee_code || '';
            const initial = empName.charAt(0).toUpperCase();

            const isReviewed = report.status === 'reviewed' || Boolean(report.manager_remarks);
            const reportDate = report.date ? String(report.date).slice(0, 10) : (report.report_date ? String(report.report_date).slice(0, 10) : '');
            const isToday = reportDate === todayStr;

            // Direct Manager permissions check
            const isOwnReport =
              (currentEmployeeId && emp?.id === currentEmployeeId) ||
              (currentUserId && report.employee?.user_id === currentUserId);

            const isDirectManagerOrUnassigned =
              !emp?.manager_id || (currentEmployeeId && emp.manager_id === currentEmployeeId);

            const canReview = isManager && !isOwnReport && isDirectManagerOrUnassigned;
            const canEdit = !isManager && isOwnReport && !isReviewed && isToday;

            return (
              <Card
                key={report.id}
                className="overflow-hidden border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition-all rounded-xl"
              >
                <CardHeader className="p-4 sm:p-5 pb-3 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Employee & Date Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                        {initial}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{empName}</span>
                          {empCode && (
                            <span className="font-mono text-[10px] text-slate-400">
                              {empCode}
                            </span>
                          )}
                          {isToday && (
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200">
                              Today
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {reportDate ? (
                            new Date(reportDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          ) : (
                            'Logged'
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge & Action Buttons */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Badge
                        variant={isReviewed ? 'success' : 'warning'}
                        dot={true}
                        className="text-xs py-0.5 px-2.5 font-medium"
                      >
                        {isReviewed ? 'Reviewed' : 'Pending Review'}
                      </Badge>

                      {/* Direct Manager Review Action */}
                      {canReview && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 font-medium shadow-2xs"
                          onClick={() => onOpenReviewModal(report)}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{isReviewed ? 'Update Review' : 'Review Report'}</span>
                        </Button>
                      )}

                      {/* Employee Edit Action */}
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2"
                          onClick={() => onOpenEditModal(report)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 space-y-4">
                  {/* Tasks & Deliverables Completed */}
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
                      <ListTodo className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Deliverables & Completed Tasks
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed pl-5 border-l-2 border-blue-200/80">
                      {report.tasks_completed || report.deliverables}
                    </div>
                  </div>

                  {/* Blockers Callout Card */}
                  {report.blockers && (
                    <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5">
                      <div className="flex items-center gap-1.5 text-amber-800 mb-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider">
                          Blockers & Impediments
                        </span>
                      </div>
                      <p className="text-xs text-amber-900/90 whitespace-pre-line pl-5">
                        {report.blockers}
                      </p>
                    </div>
                  )}

                  {/* Next Action Plan Callout */}
                  {report.next_plan && (
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
                      <div className="flex items-center gap-1.5 text-slate-600 mb-1">
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Next Shift Plan
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-line pl-5">
                        {report.next_plan}
                      </p>
                    </div>
                  )}

                  {/* Manager Feedback Remarks */}
                  {isReviewed && (report.manager_remarks || report.review_remarks) && (
                    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3.5">
                      <div className="flex items-center gap-1.5 text-emerald-800 mb-1">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider">
                          Manager Feedback & Remarks
                        </span>
                      </div>
                      <p className="text-xs text-emerald-950 italic whitespace-pre-line pl-5">
                        &quot;{report.manager_remarks || report.review_remarks}&quot;
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
