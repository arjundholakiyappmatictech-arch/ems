import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Temporary password must be at least 6 characters'),
  department_id: z.coerce.number().min(1, 'Please select a department'),
  designation_id: z.coerce.number().min(1, 'Please select a designation'),
  date_of_joining: z.string().min(1, 'Joining date is required'),
  phone: z.string().optional().default(''),
  salary: z.coerce.number().optional().default(0),
  role: z.enum(['employee', 'manager']).default('employee'),
});

