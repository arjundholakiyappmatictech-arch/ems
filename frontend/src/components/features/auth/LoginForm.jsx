import * as React from 'react';
import { Loader2, Lock, Mail, ShieldAlert, Sparkles, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginForm({
  register,
  errors,
  onSubmit,
  isLoading,
  serverError,
  onAutofill,
}) {
  return (
    <div className="space-y-6">
      {serverError && (
        <div className="flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 shadow-2xs">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-slate-700">
            Corporate Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="name@ems.local"
              className="pl-9 text-xs"
              disabled={isLoading}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] font-medium text-rose-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium text-slate-700">
              Password
            </Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-9 text-xs"
              disabled={isLoading}
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-[11px] font-medium text-rose-600">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full text-xs font-semibold gap-2 h-10 shadow-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In to Workplace</span>
          )}
        </Button>
      </form>

      {/* Internal System Notice */}
      <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-3">
        Internal Enterprise HRMS. Accounts are provisioned exclusively by management.
      </div>

      {/* 1-Click Demo Accounts */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Quick Demo Login</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-2 text-left text-xs transition-all hover:border-purple-500 hover:shadow-2xs active:scale-[0.98] cursor-pointer"
            onClick={() => onAutofill('admin@gmail.com', 'password')}
          >
            <div className="flex items-center gap-1 font-semibold text-slate-900">
              <Building2 className="h-3.5 w-3.5 text-purple-600" />
              <span>Admin Mgr</span>
            </div>
            <span className="text-[10px] text-slate-500 truncate w-full">admin@gmail.com</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-2 text-left text-xs transition-all hover:border-blue-500 hover:shadow-2xs active:scale-[0.98] cursor-pointer"
            onClick={() => onAutofill('manager@ems.local', 'password123')}
          >
            <div className="flex items-center gap-1 font-semibold text-slate-900">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              <span>Manager</span>
            </div>
            <span className="text-[10px] text-slate-500 truncate w-full">manager@ems.local</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-start rounded-lg border border-slate-200 bg-white p-2 text-left text-xs transition-all hover:border-emerald-500 hover:shadow-2xs active:scale-[0.98] cursor-pointer"
            onClick={() => onAutofill('employee@ems.local', 'password123')}
          >
            <div className="flex items-center gap-1 font-semibold text-slate-900">
              <User className="h-3.5 w-3.5 text-emerald-600" />
              <span>Employee</span>
            </div>
            <span className="text-[10px] text-slate-500 truncate w-full">employee@ems.local</span>
          </button>
        </div>
      </div>
    </div>
  );
}
