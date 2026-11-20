'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore, useIsAuthenticated, useIsHydrated } from '@/lib/store/authStore';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();
  const hydrate = useAuthStore((s) => s.hydrate);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  const isPublicRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  React.useEffect(() => {
    if (isHydrated && !isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    }
    if (isHydrated && isAuthenticated && isPublicRoute) {
      router.replace('/');
    }
  }, [isHydrated, isAuthenticated, isPublicRoute, router]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Checking credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}

