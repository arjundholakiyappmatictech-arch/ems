'use client';

import * as React from 'react';
import {
  Building2,
  Briefcase,
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function DepartmentsView({
  departments = [],
  designations = [],
  employees = [],
  searchTerm,
  onSearchChange,
  isManager,
  onOpenCreateDeptModal,
  onOpenEditDeptModal,
  onDeleteDept,
  onOpenCreateDesigModal,
  onOpenEditDesigModal,
  onDeleteDesig,
}) {
  return (
    <div className="space-y-6">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Organization Hierarchy
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure functional business units, job designations, and staffing allocations.
          </p>
        </div>

        {isManager && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenCreateDesigModal()}
              className="text-xs h-9 px-3 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs font-medium"
            >
              <Briefcase className="h-4 w-4 text-slate-500" />
              <span>New Designation</span>
            </Button>
            <Button
              size="sm"
              onClick={onOpenCreateDeptModal}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs h-9 px-4 gap-1.5 shadow-2xs font-medium"
            >
              <Building2 className="h-4 w-4" />
              <span>New Department</span>
            </Button>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <Input
          placeholder="Filter departments and job titles..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8.5 h-8.5 text-xs bg-slate-50/50 focus:bg-white transition-colors"
        />
      </div>

      {/* Department Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {departments.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-14 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                <Building2 className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                No departments found
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                {searchTerm
                  ? 'No departments match your search criteria. Try a different keyword.'
                  : 'Start by creating your first organizational department.'}
              </p>
            </div>
          </div>
        ) : (
          departments.map((dept) => {
            // Find designations linked to this department
            const deptDesignations = designations.filter(
              (des) => String(des.department_id || des.department?.id) === String(dept.id)
            );

            // Count employees in this department
            const deptEmployeeCount =
              dept.employees_count ??
              employees.filter((emp) => String(emp.department_id) === String(dept.id)).length;

            return (
              <Card
                key={dept.id}
                className="overflow-hidden flex flex-col justify-between border border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 transition-all rounded-xl"
              >
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-blue-50 border border-blue-200/60 p-2 text-blue-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <CardTitle className="text-base font-bold text-slate-900">
                            {dept.name}
                          </CardTitle>
                          {dept.code && (
                            <span className="font-mono text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {dept.code}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <Badge variant="secondary" className="text-[11px] font-normal px-2 py-0">
                            <Users className="mr-1 h-3 w-3 text-slate-500" />
                            {deptEmployeeCount} {deptEmployeeCount === 1 ? 'member' : 'members'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {isManager && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          onClick={() => onOpenEditDeptModal(dept)}
                          title="Edit Department"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => onDeleteDept(dept.id)}
                          title="Delete Department"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <CardDescription className="pt-2 text-xs line-clamp-2 text-slate-500">
                    {dept.description || 'No departmental description provided.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 pt-2">
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Job Titles ({deptDesignations.length})
                      </span>
                      {isManager && (
                        <button
                          type="button"
                          onClick={() => onOpenCreateDesigModal(dept.id)}
                          className="inline-flex items-center text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Plus className="h-3 w-3 mr-0.5" /> Add Title
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {deptDesignations.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No job titles mapped yet.</span>
                      ) : (
                        deptDesignations.map((desig) => (
                          <span
                            key={desig.id}
                            className="group inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Briefcase className="mr-1 h-3 w-3 text-slate-400" />
                            <span>{desig.title}</span>
                            {isManager && (
                              <div className="flex items-center ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                <button
                                  type="button"
                                  onClick={() => onOpenEditDesigModal(desig)}
                                  className="text-slate-400 hover:text-blue-600 transition-colors"
                                  title="Edit Title"
                                >
                                  <Pencil className="h-2.5 w-2.5" />
                                </button>
                                {onDeleteDesig && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteDesig(desig.id)}
                                    className="text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Delete Title"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
