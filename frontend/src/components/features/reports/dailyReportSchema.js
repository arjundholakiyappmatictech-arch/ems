import { z } from 'zod';

export const dailyReportSchema = z.object({
  deliverables: z
    .string()
    .min(10, 'Please describe your completed deliverables (at least 10 characters)'),
  blockers: z.string().optional().default(''),
  next_plan: z.string().optional().default(''),
  report_date: z.string().min(1, 'Report date is required'),
});

export const reviewReportSchema = z.object({
  review_remarks: z
    .string()
    .min(2, 'Please provide review remarks or feedback'),
});

