import * as React from 'react';
import { Search, UserPlus, Shield, User, Power, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function EmployeeTable({
  employees = [],
  departments = [],
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentFilterChange,
  statusFilter,
  onStatusFilterChange,
  isManager,
  onOpenOnboardModal,
  onToggleStatus,
  updatingEmployeeId,
}) {
  const statusBadgeVariant = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, code..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Department Filter */}
          <select
            className="h-9 w-full sm:w-48 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            value={departmentFilter}
            onChange={(e) => onDepartmentFilterChange(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Action Button for Managers */}
        {isManager && (
          <Button
            size="sm"
            onClick={onOpenOnboardModal}
            className="bg-blue-600 hover:bg-blue-700 text-xs shrink-0"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            Onboard Employee
          </Button>
        )}
      </div>

      {/* Directory Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/75">
              <TableHead className="font-semibold text-slate-600">Employee</TableHead>
              <TableHead className="font-semibold text-slate-600">Role & Code</TableHead>
              <TableHead className="font-semibold text-slate-600">Department</TableHead>
              <TableHead className="font-semibold text-slate-600">Designation</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="font-semibold text-slate-600">Joined</TableHead>
              {isManager && <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isManager ? 7 : 6}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  No employees found matching the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => {
                const user = emp.user;
                const isUpdating = updatingEmployeeId === emp.id;

                return (
                  <TableRow key={emp.id} className="hover:bg-slate-50/50">
                    {/* Name & Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs uppercase">
                          {user?.name ? user.name.charAt(0) : 'E'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user?.name || 'Unnamed'}</p>
                          <p className="text-xs text-slate-500">{user?.email || 'No email'}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role & Employee Code */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-slate-700">{emp.employee_code}</span>
                        <span className="text-[11px] capitalize text-slate-500">
                          {user?.role || 'employee'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      <span className="text-xs font-medium text-slate-700">
                        {emp.department?.name || 'Unassigned'}
                      </span>
                    </TableCell>

                    {/* Designation */}
                    <TableCell>
                      <span className="text-xs text-slate-600">
                        {emp.designation?.title || 'General'}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant={statusBadgeVariant(emp.status)} className="capitalize text-[11px]">
                        {emp.status}
                      </Badge>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell>
                      <span className="text-xs text-slate-500">
                        {emp.date_of_joining ? String(emp.date_of_joining).slice(0, 10) : '—'}
                      </span>
                    </TableCell>

                    {/* Manager Action: Toggle Status */}
                    {isManager && (
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs hover:bg-slate-100"
                          disabled={isUpdating}
                          onClick={() =>
                            onToggleStatus(
                              emp.id,
                              emp.status === 'active' ? 'inactive' : 'active'
                            )
                          }
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Power
                              className={`h-3.5 w-3.5 mr-1 ${
                                emp.status === 'active'
                                  ? 'text-slate-400 hover:text-red-600'
                                  : 'text-emerald-600'
                              }`}
                            />
                          )}
                          {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    )}
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

