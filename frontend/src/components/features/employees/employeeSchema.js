import { z } from 'zod';

export const employeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Please enter a valid work email address'),
  password: z.string().min(8, 'Temporary password must be at least 8 characters'),
  department_id: z.coerce.number().min(1, 'Please select a department'),
  designation_id: z.coerce.number().min(1, 'Please select a designation'),
  joining_date: z.string().min(1, 'Joining date is required'),
  phone: z.string().optional().default(''),
  manager_id: z.coerce.number().optional().nullable(),
  salary: z.coerce.number().min(0, 'Salary cannot be negative').optional().default(0),
  role: z.enum(['employee', 'manager']).default('employee'),
  status: z.enum(['active', 'probation', 'on_leave', 'terminated']).default('probation'),
});
