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
  Shield,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  leaveTypes = [],
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  isManager,
  onOpenApplyModal,
  onOpenActionModal,
  onCancelRequest,
  processingId,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="capitalize text-[11px]"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'pending':
        return <Badge variant="warning" className="capitalize text-[11px]"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="capitalize text-[11px]"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="capitalize text-[11px]"><Ban className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="capitalize text-[11px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Apply Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Leave & Time-Off Management
          </h1>
          <p className="text-sm text-slate-500">
            Submit leave requests, track policy quotas, and manage team approvals.
          </p>
        </div>

        <Button
          size="sm"
          onClick={onOpenApplyModal}
          className="bg-blue-600 hover:bg-blue-700 text-xs shrink-0"
        >
          <CalendarPlus className="mr-1.5 h-4 w-4" />
          Apply for Leave
        </Button>
      </div>

      {/* Leave Policy Quota Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {leaveTypes.map((type) => (
          <Card key={type.id} className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {type.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold text-slate-900">{type.days_allowed} <span className="text-xs font-normal text-slate-500">days/yr</span></div>
              <p className="mt-1 text-[11px] text-slate-500">
                {type.is_paid ? 'Paid Time-Off' : 'Unpaid Leave'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          {/* Manager Search */}
          {isManager && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          )}

          {/* Type Filter */}
          <select
            className="h-9 w-full sm:w-44 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
          >
            <option value="all">All Leave Types</option>
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="h-9 w-full sm:w-36 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
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
        {(typeFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
          <button
            type="button"
            onClick={() => {
              onTypeFilterChange('all');
              onStatusFilterChange('all');
              onSearchChange('');
            }}
            className="text-xs text-blue-600 hover:underline self-start sm:self-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Requests Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/75">
              {isManager && <TableHead className="font-semibold text-slate-600">Employee</TableHead>}
              <TableHead className="font-semibold text-slate-600">Category</TableHead>
              <TableHead className="font-semibold text-slate-600">Period</TableHead>
              <TableHead className="font-semibold text-slate-600">Days</TableHead>
              <TableHead className="font-semibold text-slate-600">Reason</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="font-semibold text-slate-600">Remarks</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isManager ? 8 : 7}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  No leave applications found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              leaveRequests.map((req) => {
                const emp = req.employee;
                const user = emp?.user;
                const isPending = req.status === 'pending';
                const isProcessing = processingId === req.id;

                return (
                  <TableRow key={req.id} className="hover:bg-slate-50/50">
                    {/* Employee (Manager Only) */}
                    {isManager && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] uppercase">
                            {user?.name ? user.name.charAt(0) : 'E'}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{user?.name || 'Employee'}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{emp?.employee_code || ''}</p>
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {/* Category */}
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-slate-50">
                        {req.leave_type?.name || 'General Leave'}
                      </Badge>
                    </TableCell>

                    {/* Period */}
                    <TableCell className="text-xs text-slate-700 whitespace-nowrap">
                      {req.start_date ? String(req.start_date).slice(0, 10) : ''}
                      <span className="text-slate-400 mx-1">→</span>
                      {req.end_date ? String(req.end_date).slice(0, 10) : ''}
                    </TableCell>

                    {/* Total Days */}
                    <TableCell className="text-xs font-bold text-slate-900">
                      {req.total_days} {req.total_days === 1 ? 'day' : 'days'}
                    </TableCell>

                    {/* Reason */}
                    <TableCell className="text-xs text-slate-600 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(req.status)}</TableCell>

                    {/* Manager Remarks */}
                    <TableCell className="text-xs text-slate-500 italic max-w-xs truncate" title={req.review_remarks}>
                      {req.review_remarks || '—'}
                    </TableCell>

                    {/* State Machine Actions */}
                    <TableCell className="text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {isManager ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                                onClick={() => onOpenActionModal(req, 'approve')}
                                disabled={isProcessing}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs text-red-700 hover:bg-red-50 hover:border-red-300"
                                onClick={() => onOpenActionModal(req, 'reject')}
                                disabled={isProcessing}
                              >
                                <X className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-slate-500 hover:text-red-600"
                              onClick={() => onCancelRequest(req.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Ban className="h-3.5 w-3.5 mr-1" />
                              )}
                              Cancel
                            </Button>
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

