import AuthGuard from '@/components/shared/AuthGuard';
import AppShell from '@/components/shared/AppShell';

export default function DashboardLayout({ children }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}

