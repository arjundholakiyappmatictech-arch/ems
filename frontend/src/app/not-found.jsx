import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-xs max-w-md space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">404</h2>
        <p className="text-sm font-semibold text-slate-700">Page Not Found</p>
        <p className="text-xs text-slate-500">
          The requested page could not be found or you may not have sufficient permissions to access it.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
