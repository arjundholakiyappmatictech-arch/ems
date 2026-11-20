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
  Shield,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HeaderPunchWidget from './HeaderPunchWidget';
import { useAuthStore, useAuthUser, useIsManager } from '@/lib/store/authStore';
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
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-extrabold text-sm">
              EMS
            </div>
            <span className="text-base tracking-tight">Enterprise HR</span>
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Navigation
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
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-blue-600' : 'text-slate-400')} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* User Card in Sidebar Footer */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">{user?.name || 'User'}</p>
              <p className="truncate text-[11px] text-slate-500">{user?.email || ''}</p>
            </div>
            <Badge
              variant={isManager ? 'default' : 'secondary'}
              className="text-[10px] px-1.5 py-0 uppercase"
            >
              {user?.role || 'staff'}
            </Badge>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-slate-800 hidden sm:block">
              Employee Management Portal
            </h1>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Punch Widget */}
            <HeaderPunchWidget />

            <div className="h-5 w-px bg-slate-200" />

            {/* Logout Action */}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-600 hover:text-red-600 gap-1.5"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
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

