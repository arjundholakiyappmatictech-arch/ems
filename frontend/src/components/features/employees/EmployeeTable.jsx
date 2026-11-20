import * as React from 'react';
import { Search, UserPlus, Power, Loader2, Users, X, Building2, Briefcase, ChevronDown } from 'lucide-react';
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
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" dot={true}>Active</Badge>;
      case 'probation':
        return <Badge variant="warning" dot={true}>Probation</Badge>;
      case 'on_leave':
        return <Badge variant="purple" dot={true}>On Leave</Badge>;
      case 'terminated':
      case 'inactive':
        return <Badge variant="destructive" dot={true}>Terminated</Badge>;
      default:
        return <Badge variant="outline" className="capitalize">{status || 'Unknown'}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, code..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="relative w-full sm:w-44">
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 cursor-pointer"
              value={departmentFilter}
              onChange={(e) => onDepartmentFilterChange(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-36">
            <select
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 cursor-pointer"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="probation">Probation</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>

        {/* Action Button for Managers */}
        {isManager && (
          <Button
            size="sm"
            onClick={onOpenOnboardModal}
            className="text-xs shrink-0 gap-1.5 shadow-2xs font-medium"
          >
            <UserPlus className="h-4 w-4" />
            <span>Onboard Member</span>
          </Button>
        )}
      </div>

      {/* Directory Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/75 border-b border-slate-100 text-[11px]">
              <TableHead className="font-semibold text-slate-700">Team Member</TableHead>
              <TableHead className="font-semibold text-slate-700">Code & Role</TableHead>
              <TableHead className="font-semibold text-slate-700">Department</TableHead>
              <TableHead className="font-semibold text-slate-700">Designation</TableHead>
              <TableHead className="font-semibold text-slate-700">Direct Manager</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700">Joined</TableHead>
              {isManager && <TableHead className="text-right font-semibold text-slate-700">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isManager ? 8 : 7} className="py-12 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <Users className="h-8 w-8 mx-auto text-slate-300" />
                    <p className="text-xs font-semibold text-slate-700">No employees match this filter</p>
                    <p className="text-[11px] text-slate-400">
                      Try adjusting your search criteria or clear the filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => {
                const user = emp.user || {};
                const isUpdating = updatingEmployeeId === emp.id;
                const initials = emp.first_name && emp.last_name
                  ? `${emp.first_name.charAt(0)}${emp.last_name.charAt(0)}`
                  : user.name ? user.name.slice(0, 2).toUpperCase() : 'EM';

                return (
                  <TableRow key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Name & Avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/70 text-blue-700 font-bold text-xs ring-1 ring-blue-200/50 shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 leading-tight">
                            {emp.first_name && emp.last_name ? `${emp.first_name} ${emp.last_name}` : user.name || 'Unnamed'}
                          </p>
                          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{user.email || emp.email || '—'}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role & Employee Code */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-medium text-slate-800">{emp.employee_code}</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                          {user.role || 'employee'}
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

                    {/* Reporting Manager */}
                    <TableCell>
                      {emp.manager ? (
                        <div className="text-xs text-slate-700">
                          <span>{emp.manager.first_name ? `${emp.manager.first_name} ${emp.manager.last_name}` : emp.manager.user?.name || 'Manager'}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Self-Directed</span>
                      )}
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      {getStatusBadge(emp.status)}
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell>
                      <span className="text-xs font-mono text-slate-500">
                        {emp.joining_date ? String(emp.joining_date).slice(0, 10) : '—'}
                      </span>
                    </TableCell>

                    {/* Manager Action: Toggle Status */}
                    {isManager && (
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 hover:bg-slate-100 font-medium"
                          disabled={isUpdating}
                          onClick={() =>
                            onToggleStatus(
                              emp.id,
                              emp.status === 'active' ? 'terminated' : 'active'
                            )
                          }
                        >
                          {isUpdating ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Power
                              className={`h-3 w-3 mr-1 ${
                                emp.status === 'active'
                                  ? 'text-slate-400 hover:text-rose-600'
                                  : 'text-emerald-600'
                              }`}
                            />
                          )}
                          <span className={emp.status === 'active' ? 'text-slate-600' : 'text-emerald-700'}>
                            {emp.status === 'active' ? 'Terminate' : 'Activate'}
                          </span>
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
