import { z } from 'zod';

export const dailyReportSchema = z.object({
  tasks_completed: z
    .string()
    .min(5, 'Please describe tasks and deliverables completed today (at least 5 characters)'),
  blockers: z.string().optional().default(''),
  next_plan: z.string().optional().default(''),
});

export const reviewReportSchema = z.object({
  manager_remarks: z
    .string()
    .min(2, 'Please provide manager feedback or remarks (at least 2 characters)')
    .max(2000, 'Remarks cannot exceed 2000 characters'),
});
