import * as React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/80 bg-white text-slate-950 shadow-2xs transition-shadow duration-150',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-5 sm:p-6', className)} {...props} />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('font-semibold text-base leading-none tracking-tight text-slate-900', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <p className={cn('text-xs text-slate-500 leading-relaxed', className)} {...props} />
  );
}

function CardContent({ className, ...props }) {
  return <div className={cn('p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return (
    <div className={cn('flex items-center p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props} />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
