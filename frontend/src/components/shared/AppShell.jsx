'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  FileText,
  CalendarDays,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeaderPunchWidget from './HeaderPunchWidget';
import { useAuthUser, useIsManager } from '@/lib/store/authStore';
import { useUIStore, useIsSidebarOpen } from '@/lib/store/uiStore';
import { useLogoutMutation } from '@/hooks/queries/useAuth';
import { cn } from '@/lib/utils';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const user = useAuthUser();
  const isManager = useIsManager();
  const isSidebarOpen = useIsSidebarOpen();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const logoutMutation = useLogoutMutation();

  const navItems = [
    {
      title: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      roles: ['manager', 'employee'],
    },
    {
      title: 'Employees',
      href: '/employees',
      icon: Users,
      roles: ['manager'],
    },
    {
      title: 'Organization',
      href: '/departments',
      icon: Building2,
      roles: ['manager'],
    },
    {
      title: 'Attendance',
      href: '/attendances',
      icon: Clock,
      roles: ['manager', 'employee'],
    },
    {
      title: 'Daily Reports',
      href: '/daily-reports',
      icon: FileText,
      roles: ['manager', 'employee'],
    },
    {
      title: 'Leave Requests',
      href: '/leave-requests',
      icon: CalendarDays,
      roles: ['manager', 'employee'],
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || 'employee')
  );

  return (
    <div className="flex min-h-screen bg-slate-50/60">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/90 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0 shadow-xl lg:shadow-none' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-extrabold shadow-2xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                Enterprise EMS
              </span>
              <span className="text-[10px] font-medium text-slate-400 block leading-tight">
                HR Workspace
              </span>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Menu
          </div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-blue-50/80 text-blue-700 font-semibold shadow-2xs border border-blue-200/50'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                <span className="flex-1">{item.title}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card in Sidebar Footer */}
        <div className="border-t border-slate-100 p-3.5 bg-slate-50/50">
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white p-2.5 shadow-2xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/80 text-blue-700 font-bold text-xs ring-1 ring-blue-200/60 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900 leading-tight">
                {user?.name || 'User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant={isManager ? 'default' : 'secondary'}
                  className="text-[9px] px-1.5 py-0 uppercase tracking-wider font-semibold"
                >
                  {user?.role || 'staff'}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xs sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-slate-900 font-semibold">Workspace</span>
              <span>/</span>
              <span className="capitalize">
                {pathname === '/' ? 'Overview' : pathname.replace('/', '').replace('-', ' ')}
              </span>
            </div>
          </div>

          {/* Header Right Actions: Live Punch Widget */}
          <div className="flex items-center gap-3">
            <HeaderPunchWidget />
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
