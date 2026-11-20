import './globals.css';
import QueryProvider from '@/lib/providers/QueryProvider';

export const metadata = {
  title: 'Employee Management System',
  description: 'Enterprise HR, Attendance, and Leave Portal',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

