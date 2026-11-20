'use client';

import * as React from 'react';
import {
  CalendarDays,
  CalendarPlus,
  Search,
  Check,
  X,
  Ban,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function LeaveRequestsView({
  leaveRequests = [],
  allLeaveRequests = [],
  leaveTypes = [],
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  isManager,
  currentUserId,
  currentEmployeeId,
  onOpenApplyModal,
  onOpenActionModal,
  onCancelRequest,
  processingId,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" dot={true} className="capitalize text-[11px] font-medium">
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" dot={true} className="capitalize text-[11px] font-medium">
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" dot={true} className="capitalize text-[11px] font-medium">
            Rejected
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" dot={true} className="capitalize text-[11px] font-medium">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="capitalize text-[11px] font-medium">
            {status}
          </Badge>
        );
    }
  };

  const hasActiveFilters = Boolean(typeFilter !== 'all' || statusFilter !== 'all' || searchTerm);

  // Compute approved days per leave type for quota cards
  const usedDaysByType = React.useMemo(() => {
    const map = {};
    allLeaveRequests.forEach((req) => {
      if (req.status === 'approved') {
        const typeId = req.leave_type_id || req.leave_type?.id;
        if (typeId) {
          map[typeId] = (map[typeId] || 0) + Number(req.total_days || 0);
        }
      }
    });
    return map;
  }, [allLeaveRequests]);

  return (
    <div className="space-y-6">
      {/* Header and Apply Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Leave & Time-Off Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Submit leave requests, track policy allowances, and manage team approvals.
          </p>
        </div>

        <Button
          size="sm"
          onClick={onOpenApplyModal}
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs h-9 px-4 gap-1.5 shadow-2xs font-medium shrink-0"
        >
          <CalendarPlus className="h-4 w-4" />
          <span>Apply for Leave</span>
        </Button>
      </div>

      {/* Visual Leave Policy Allowance Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {leaveTypes.map((type) => {
          const used = usedDaysByType[type.id] || 0;
          const total = Number(type.days_per_year ?? type.days_allowed ?? 12);
          const remaining = Math.max(0, total - used);
          const percentUsed = Math.min(100, Math.round((used / total) * 100));

          return (
            <Card
              key={type.id}
              className="overflow-hidden border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition-colors rounded-xl"
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {type.name}
                  </span>
                  <Badge variant={type.is_paid ? 'secondary' : 'outline'} className="text-[10px] py-0 px-1.5">
                    {type.is_paid ? 'Paid' : 'Unpaid'}
                  </Badge>
                </div>

                <div>
                  <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                    {remaining}{' '}
                    <span className="text-xs font-normal text-slate-400 font-sans">
                      / {total} days left
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {used > 0 ? `${used} days used this year` : 'No days used this year'}
                  </p>
                </div>

                {/* Allowance Progress Bar */}
                <Progress
                  value={percentUsed}
                  className="h-1.5 bg-slate-100"
                  indicatorClassName={
                    percentUsed >= 90
                      ? 'bg-rose-500'
                      : percentUsed >= 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
          {/* Manager Search */}
          {isManager && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search employee or reason..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8.5 h-8.5 text-xs bg-slate-50/50 focus:bg-white transition-colors"
              />
            </div>
          )}

          {/* Type Filter */}
          <select
            className="h-8.5 w-full sm:w-44 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 text-xs text-slate-700 shadow-2xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
          >
            <option value="all">All Leave Categories</option>
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="h-8.5 w-full sm:w-36 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 text-xs text-slate-700 shadow-2xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onTypeFilterChange('all');
              onStatusFilterChange('all');
              onSearchChange('');
            }}
            className="h-8 text-xs text-slate-500 hover:text-slate-900 px-2 self-start sm:self-auto"
          >
            Reset Filters
          </Button>
        )}
      </div>

      {/* Requests Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
              {isManager && (
                <TableHead className="font-semibold text-slate-600 text-xs">Employee</TableHead>
              )}
              <TableHead className="font-semibold text-slate-600 text-xs">Category</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs">Period</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs">Days</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs">Reason</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs">Status</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs">Action Reason</TableHead>
              <TableHead className="text-right font-semibold text-slate-600 text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isManager ? 8 : 7}
                  className="py-14 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                      No leave applications found
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {hasActiveFilters
                        ? 'Try clearing your filters or search keywords to see other requests.'
                        : 'No leave requests have been filed yet. Click Apply for Leave above.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              leaveRequests.map((req) => {
                const emp = req.employee;
                const empName = emp?.name || emp?.user?.name || 'Employee';
                const empCode = emp?.code || emp?.employee_code || '';
                const initial = empName.charAt(0).toUpperCase();

                const isPending = req.status === 'pending';
                const isProcessing = processingId === req.id;

                // Direct manager permission check
                const isOwnRequest =
                  (currentEmployeeId && emp?.id === currentEmployeeId) ||
                  (currentUserId && emp?.user_id === currentUserId);

                const isDirectManagerOrUnassigned =
                  !emp?.manager_id || (currentEmployeeId && emp.manager_id === currentEmployeeId);

                const canApproveReject =
                  isManager && !isOwnRequest && isDirectManagerOrUnassigned && isPending;

                const canCancel = !isManager && isOwnRequest && isPending;

                return (
                  <TableRow key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Employee (Manager Only) */}
                    {isManager && (
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            {initial}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-slate-900">{empName}</span>
                            {empCode && (
                              <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                                {empCode}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {/* Category */}
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-slate-50 font-normal">
                        {req.leave_type?.name || 'Leave'}
                      </Badge>
                    </TableCell>

                    {/* Period */}
                    <TableCell className="text-xs text-slate-700 whitespace-nowrap">
                      {req.start_date ? String(req.start_date).slice(0, 10) : ''}
                      <span className="text-slate-400 mx-1.5">→</span>
                      {req.end_date ? String(req.end_date).slice(0, 10) : ''}
                    </TableCell>

                    {/* Total Days */}
                    <TableCell className="text-xs font-bold text-slate-900 font-mono">
                      {req.total_days} {req.total_days === 1 ? 'day' : 'days'}
                    </TableCell>

                    {/* Reason */}
                    <TableCell className="text-xs text-slate-600 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(req.status)}</TableCell>

                    {/* Action Reason */}
                    <TableCell
                      className="text-xs text-slate-500 italic max-w-xs truncate"
                      title={req.action_reason || req.review_remarks}
                    >
                      {req.action_reason || req.review_remarks || '—'}
                    </TableCell>

                    {/* State Machine Actions */}
                    <TableCell className="text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {canApproveReject && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-2xs font-medium"
                                onClick={() => onOpenActionModal(req, 'approve')}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-rose-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300 shadow-2xs font-medium"
                                onClick={() => onOpenActionModal(req, 'reject')}
                                disabled={isProcessing}
                              >
                                <X className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}

                          {canCancel && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => onCancelRequest(req.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <Ban className="h-3.5 w-3.5 mr-1" />
                              )}
                              Cancel
                            </Button>
                          )}

                          {!canApproveReject && !canCancel && (
                            <span className="text-xs text-slate-400">Pending Direct Mgr</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
