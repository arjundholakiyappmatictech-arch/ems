import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white shadow-2xs hover:bg-blue-700 active:bg-blue-800',
        destructive: 'bg-rose-600 text-white shadow-2xs hover:bg-rose-700 active:bg-rose-800',
        outline: 'border border-slate-200 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300',
        secondary: 'bg-slate-100 text-slate-900 shadow-2xs hover:bg-slate-200/80',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        link: 'text-blue-600 underline-offset-4 hover:underline',
        success: 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700 active:bg-emerald-800',
      },
      size: {
        default: 'h-9 px-3.5 py-2',
        sm: 'h-8 rounded-md px-2.5 text-xs',
        lg: 'h-10 rounded-lg px-6',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
