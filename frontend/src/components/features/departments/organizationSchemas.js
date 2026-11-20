import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  description: z.string().optional().default(''),
});

export const designationSchema = z.object({
  title: z.string().min(2, 'Designation title must be at least 2 characters'),
  department_id: z.coerce.number().min(1, 'Please select a parent department'),
  description: z.string().optional().default(''),
});

