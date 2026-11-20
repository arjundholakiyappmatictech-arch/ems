import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-blue-200/80 bg-blue-50 text-blue-700 shadow-2xs hover:bg-blue-100/80',
        secondary: 'border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200/80',
        destructive: 'border-rose-200/80 bg-rose-50 text-rose-700 hover:bg-rose-100/80',
        success: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80',
        warning: 'border-amber-200/80 bg-amber-50 text-amber-800 hover:bg-amber-100/80',
        purple: 'border-purple-200/80 bg-purple-50 text-purple-700 hover:bg-purple-100/80',
        outline: 'border-slate-300 text-slate-700 bg-white shadow-2xs',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, dot = false, dotColor, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            dotColor || 'bg-current'
          )}
        />
      )}
      {props.children}
    </div>
  );
}

export { Badge, badgeVariants };
