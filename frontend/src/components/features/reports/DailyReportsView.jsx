import * as React from 'react';
import {
  FileText,
  Search,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Pencil,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  hasReportToday,
  onOpenSubmitModal,
  onOpenEditModal,
  onOpenReviewModal,
}) {
  return (
    <div className="space-y-6">
      {/* Header and Submit CTA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daily Work Reports
          </h1>
          <p className="text-sm text-slate-500">
            Log daily sprint deliverables, identify blockers, and review team progress.
          </p>
        </div>

        <Button
          size="sm"
          onClick={onOpenSubmitModal}
          className="bg-blue-600 hover:bg-blue-700 text-xs shrink-0"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          {hasReportToday ? 'Submit Another Report' : "Submit Today's Report"}
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search deliverables or employee..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Date Filter */}
          <div className="relative w-full sm:w-44">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Review Status Filter */}
          <select
            className="h-9 w-full sm:w-36 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All Reviews</option>
            <option value="reviewed">Reviewed</option>
            <option value="pending">Pending Review</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(dateFilter || statusFilter !== 'all' || searchTerm) && (
          <button
            type="button"
            onClick={() => {
              onDateFilterChange('');
              onStatusFilterChange('all');
              onSearchChange('');
            }}
            className="text-xs text-blue-600 hover:underline self-start sm:self-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Reports Feed */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
            No work reports found matching the selected filters.
          </div>
        ) : (
          reports.map((report) => {
            const emp = report.employee;
            const user = emp?.user;
            const isReviewed = Boolean(report.review_remarks);

            return (
              <Card key={report.id} className="border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs uppercase">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-bold text-slate-900">
                            {user?.name || 'My Report'}
                          </CardTitle>
                          {emp?.employee_code && (
                            <span className="font-mono text-[11px] text-slate-400">
                              ({emp.employee_code})
                            </span>
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          Filed on {report.report_date ? String(report.report_date).slice(0, 10) : 'Today'}
                        </CardDescription>
                      </div>
                    </div>

                    {/* Status Badge & Actions */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Badge
                        variant={isReviewed ? 'success' : 'warning'}
                        className="text-xs py-0.5 px-2"
                      >
                        {isReviewed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Reviewed
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" /> Pending Review
                          </>
                        )}
                      </Badge>

                      {/* Manager Review Action */}
                      {isManager && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={() => onOpenReviewModal(report)}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {isReviewed ? 'Update Review' : 'Add Review'}
                        </Button>
                      )}

                      {/* Employee Edit Action */}
                      {!isReviewed && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-slate-500 hover:text-slate-800"
                          onClick={() => onOpenEditModal(report)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-3.5">
                  {/* Deliverables */}
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Deliverables & Tasks
                    </p>
                    <p className="mt-1 text-sm text-slate-800 whitespace-pre-line">
                      {report.deliverables}
                    </p>
                  </div>

                  {/* Blockers (if any) */}
                  {report.blockers && (
                    <div className="rounded-lg bg-red-50/70 border border-red-100 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-red-700 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Blockers & Roadblocks
                      </p>
                      <p className="mt-1 text-xs text-red-800 whitespace-pre-line">
                        {report.blockers}
                      </p>
                    </div>
                  )}

                  {/* Next Plan (if any) */}
                  {report.next_plan && (
                    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Next Action Plan
                      </p>
                      <p className="mt-1 text-xs text-slate-700 whitespace-pre-line">
                        {report.next_plan}
                      </p>
                    </div>
                  )}

                  {/* Manager Review Remarks */}
                  {isReviewed && (
                    <div className="rounded-lg bg-blue-50/70 border border-blue-100 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Manager Feedback
                      </p>
                      <p className="mt-1 text-xs text-blue-900 italic whitespace-pre-line">
                        &quot;{report.review_remarks}&quot;
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

