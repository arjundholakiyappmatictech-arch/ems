import { z } from 'zod';

export const leaveRequestSchema = z
  .object({
    leave_type_id: z.coerce.number().min(1, 'Please select a leave category'),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    reason: z
      .string()
      .min(5, 'Please provide a reason for your leave request (at least 5 characters)'),
  })
  .refine((data) => !data.start_date || !data.end_date || data.end_date >= data.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });

export const leaveActionSchema = z.object({
  action_reason: z
    .string()
    .min(3, 'Please provide a clear rejection reason (at least 3 characters)')
    .max(1000, 'Reason cannot exceed 1000 characters'),
});
