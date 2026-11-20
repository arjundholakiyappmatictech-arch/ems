import * as React from 'react';
import {
  Building2,
  Briefcase,
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Organization Hierarchy
          </h1>
          <p className="text-sm text-slate-500">
            Configure functional departments, linked job designations, and team structures.
          </p>
        </div>

        {isManager && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenCreateDesigModal()}
              className="text-xs"
            >
              <Briefcase className="mr-1.5 h-4 w-4 text-slate-500" />
              New Designation
            </Button>
            <Button
              size="sm"
              onClick={onOpenCreateDeptModal}
              className="bg-blue-600 hover:bg-blue-700 text-xs"
            >
              <Building2 className="mr-1.5 h-4 w-4" />
              New Department
            </Button>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Filter departments and designations..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-xs"
        />
      </div>

      {/* Department Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500">
            No departments found. Click &quot;New Department&quot; above to create one.
          </div>
        ) : (
          departments.map((dept) => {
            // Find designations linked to this department
            const deptDesignations = designations.filter(
              (des) => String(des.department_id) === String(dept.id)
            );

            // Count employees in this department
            const deptEmployeeCount = employees.filter(
              (emp) => String(emp.department_id) === String(dept.id)
            ).length;

            return (
              <Card key={dept.id} className="flex flex-col justify-between hover:border-slate-300 transition-colors shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          {dept.name}
                        </CardTitle>
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
                          className="h-7 w-7 text-slate-400 hover:text-slate-700"
                          onClick={() => onOpenEditDeptModal(dept)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-400 hover:text-red-600"
                          onClick={() => onDeleteDept(dept.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <CardDescription className="pt-2 text-xs line-clamp-2">
                    {dept.description || 'No departmental description provided.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Designations ({deptDesignations.length})
                      </span>
                      {isManager && (
                        <button
                          type="button"
                          onClick={() => onOpenCreateDesigModal(dept.id)}
                          className="inline-flex items-center text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="h-3 w-3 mr-0.5" /> Add Title
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {deptDesignations.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No job titles yet.</span>
                      ) : (
                        deptDesignations.map((desig) => (
                          <span
                            key={desig.id}
                            className="group inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                          >
                            <Briefcase className="mr-1 h-3 w-3 text-slate-400" />
                            {desig.title}
                            {isManager && (
                              <button
                                type="button"
                                onClick={() => onOpenEditDesigModal(desig)}
                                className="ml-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity"
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </button>
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

