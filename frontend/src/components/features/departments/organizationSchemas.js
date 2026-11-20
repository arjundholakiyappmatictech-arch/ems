import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(100),
  code: z
    .string()
    .min(2, 'Department code must be at least 2 characters')
    .max(20, 'Code cannot exceed 20 characters')
    .transform((val) => val.trim().toUpperCase()),
  description: z.string().optional().default(''),
});

export const designationSchema = z.object({
  title: z.string().min(2, 'Designation title must be at least 2 characters').max(100),
  department_id: z.coerce.number().min(1, 'Please select a parent department'),
  description: z.string().optional().default(''),
});
