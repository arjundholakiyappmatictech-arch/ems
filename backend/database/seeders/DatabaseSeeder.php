<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\DailyReport;
use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // -----------------------------------------------------------------
            // 1. LEAVE TYPES
            // -----------------------------------------------------------------
            $annualLeave = LeaveType::create([
                'name' => 'Annual Leave',
                'days_per_year' => 18,
                'is_paid' => true,
                'is_active' => true,
            ]);

            $sickLeave = LeaveType::create([
                'name' => 'Sick Leave',
                'days_per_year' => 10,
                'is_paid' => true,
                'is_active' => true,
            ]);

            $casualLeave = LeaveType::create([
                'name' => 'Casual Leave',
                'days_per_year' => 7,
                'is_paid' => true,
                'is_active' => true,
            ]);

            $unpaidLeave = LeaveType::create([
                'name' => 'Unpaid Leave',
                'days_per_year' => 20,
                'is_paid' => false,
                'is_active' => true,
            ]);

            // -----------------------------------------------------------------
            // 2. DEPARTMENTS
            // -----------------------------------------------------------------
            $engineering = Department::create([
                'name' => 'Engineering',
                'code' => 'ENG',
                'description' => 'Core software engineering, architecture, and infrastructure.',
                'is_active' => true,
            ]);

            $product = Department::create([
                'name' => 'Product & Design',
                'code' => 'PRD',
                'description' => 'Product management, user experience, and design systems.',
                'is_active' => true,
            ]);

            $hr = Department::create([
                'name' => 'Human Resources',
                'code' => 'HR',
                'description' => 'Talent acquisition, employee relations, and culture.',
                'is_active' => true,
            ]);

            $marketing = Department::create([
                'name' => 'Sales & Marketing',
                'code' => 'MKT',
                'description' => 'Customer acquisition, enterprise sales, and branding.',
                'is_active' => true,
            ]);

            $finance = Department::create([
                'name' => 'Finance & Operations',
                'code' => 'FIN',
                'description' => 'Financial planning, budgeting, and corporate operations.',
                'is_active' => true,
            ]);

            // -----------------------------------------------------------------
            // 3. DESIGNATIONS
            // -----------------------------------------------------------------
            $desigEngVp = Designation::create([
                'department_id' => $engineering->id,
                'title' => 'VP of Engineering',
                'description' => 'Technical executive leading all engineering divisions.',
                'is_active' => true,
            ]);

            $desigSeniorFullStack = Designation::create([
                'department_id' => $engineering->id,
                'title' => 'Senior Full-Stack Engineer',
                'description' => 'Builds decoupled Next.js and Laravel applications.',
                'is_active' => true,
            ]);

            $desigFrontendLead = Designation::create([
                'department_id' => $engineering->id,
                'title' => 'Frontend Specialist',
                'description' => 'Expert in React 19, Tailwind CSS v4, and web performance.',
                'is_active' => true,
            ]);

            $desigBackendArch = Designation::create([
                'department_id' => $engineering->id,
                'title' => 'Backend Architect',
                'description' => 'Specializes in PostgreSQL, distributed systems, and API contracts.',
                'is_active' => true,
            ]);

            $desigProductHead = Designation::create([
                'department_id' => $product->id,
                'title' => 'Head of Product',
                'description' => 'Owns company product roadmaps and strategic vision.',
                'is_active' => true,
            ]);

            $desigUiUx = Designation::create([
                'department_id' => $product->id,
                'title' => 'Senior UI/UX Designer',
                'description' => 'Designs shadcn/ui components, design systems, and flows.',
                'is_active' => true,
            ]);

            $desigHrDirector = Designation::create([
                'department_id' => $hr->id,
                'title' => 'HR Director',
                'description' => 'Oversees personnel policies, compensation, and onboarding.',
                'is_active' => true,
            ]);

            $desigTalentSpecialist = Designation::create([
                'department_id' => $hr->id,
                'title' => 'Talent Acquisition Specialist',
                'description' => 'Identifies and hires top-tier technical and executive talent.',
                'is_active' => true,
            ]);

            $desigAccountExec = Designation::create([
                'department_id' => $marketing->id,
                'title' => 'Senior Account Executive',
                'description' => 'Closes mid-market and enterprise platform contracts.',
                'is_active' => true,
            ]);

            $desigFinancialAnalyst = Designation::create([
                'department_id' => $finance->id,
                'title' => 'Senior Financial Analyst',
                'description' => 'Financial reporting, runway forecasting, and audit compliance.',
                'is_active' => true,
            ]);

            // -----------------------------------------------------------------
            // 4. USERS & EMPLOYEES
            // -----------------------------------------------------------------
            $defaultPassword = Hash::make('password123');

            // 4.0 Admin Manager (admin@gmail.com / password)
            $userAdmin = User::create([
                'name' => 'Admin Manager',
                'email' => 'admin@gmail.com',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'is_active' => true,
            ]);

            $empAdmin = Employee::create([
                'user_id' => $userAdmin->id,
                'employee_code' => 'EMP-0000',
                'first_name' => 'Admin',
                'last_name' => 'Manager',
                'phone' => '+1-555-0000',
                'date_of_birth' => '1985-01-01',
                'gender' => 'other',
                'joining_date' => '2020-01-01',
                'department_id' => $engineering->id,
                'designation_id' => $desigEngVp->id,
                'manager_id' => null,
                'salary' => 150000.00,
                'status' => 'active',
            ]);

            // 4.1 Primary Manager (John Carter)
            $userJohn = User::create([
                'name' => 'John Carter',
                'email' => 'manager@ems.local',
                'password' => $defaultPassword,
                'role' => 'manager',
                'is_active' => true,
            ]);

            $empJohn = Employee::create([
                'user_id' => $userJohn->id,
                'employee_code' => 'EMP-0001',
                'first_name' => 'John',
                'last_name' => 'Carter',
                'phone' => '+1-555-0101',
                'date_of_birth' => '1985-04-12',
                'gender' => 'male',
                'joining_date' => '2020-01-15',
                'department_id' => $engineering->id,
                'designation_id' => $desigEngVp->id,
                'manager_id' => null,
                'salary' => 145000.00,
                'status' => 'active',
            ]);

            // 4.2 Product Lead / Manager (Sarah Chen)
            $userSarah = User::create([
                'name' => 'Sarah Chen',
                'email' => 'sarah.lead@ems.local',
                'password' => $defaultPassword,
                'role' => 'manager',
                'is_active' => true,
            ]);

            $empSarah = Employee::create([
                'user_id' => $userSarah->id,
                'employee_code' => 'EMP-0002',
                'first_name' => 'Sarah',
                'last_name' => 'Chen',
                'phone' => '+1-555-0102',
                'date_of_birth' => '1989-08-23',
                'gender' => 'female',
                'joining_date' => '2021-03-01',
                'department_id' => $product->id,
                'designation_id' => $desigProductHead->id,
                'manager_id' => $empJohn->id,
                'salary' => 128000.00,
                'status' => 'active',
            ]);

            // 4.3 HR Lead / Manager (Elena Rostova)
            $userElena = User::create([
                'name' => 'Elena Rostova',
                'email' => 'elena.hr@ems.local',
                'password' => $defaultPassword,
                'role' => 'manager',
                'is_active' => true,
            ]);

            $empElena = Employee::create([
                'user_id' => $userElena->id,
                'employee_code' => 'EMP-0003',
                'first_name' => 'Elena',
                'last_name' => 'Rostova',
                'phone' => '+1-555-0103',
                'date_of_birth' => '1990-11-14',
                'gender' => 'female',
                'joining_date' => '2021-06-15',
                'department_id' => $hr->id,
                'designation_id' => $desigHrDirector->id,
                'manager_id' => $empJohn->id,
                'salary' => 112000.00,
                'status' => 'active',
            ]);

            // 4.4 Alex Rivera (Senior Full-Stack Engineer)
            $userAlex = User::create([
                'name' => 'Alex Rivera',
                'email' => 'alex.dev@ems.local',
                'password' => $defaultPassword,
                'role' => 'employee',
                'is_active' => true,
            ]);

            $empAlex = Employee::create([
                'user_id' => $userAlex->id,
                'employee_code' => 'EMP-0004',
                'first_name' => 'Alex',
                'last_name' => 'Rivera',
                'phone' => '+1-555-0104',
                'date_of_birth' => '1993-02-19',
                'gender' => 'male',
                'joining_date' => '2022-01-10',
                'department_id' => $engineering->id,
                'designation_id' => $desigSeniorFullStack->id,
                'manager_id' => $empJohn->id,
                'salary' => 96000.00,
                'status' => 'active',
            ]);

            // 4.5 Marcus Vance (Frontend Specialist)
            $userMarcus = User::create([
                'name' => 'Marcus Vance',
                'email' => 'marcus.fe@ems.local',
                'password' => $defaultPassword,
                'role' => 'employee',
                'is_active' => true,
            ]);

            $empMarcus = Employee::create([
                'user_id' => $userMarcus->id,
                'employee_code' => 'EMP-0005',
                'first_name' => 'Marcus',
                'last_name' => 'Vance',
                'phone' => '+1-555-0105',
                'date_of_birth' => '1995-07-30',
                'gender' => 'male',
                'joining_date' => '2022-09-01',
                'department_id' => $engineering->id,
                'designation_id' => $desigFrontendLead->id,
                'manager_id' => $empJohn->id,
                'salary' => 84000.00,
                'status' => 'active',
            ]);

            // 4.6 Priya Sharma (Backend Architect)
            $userPriya = User::create([
                'name' => 'Priya Sharma',
                'email' => 'priya.be@ems.local',
                'password' => $defaultPassword,
                'role' => 'employee',
                'is_active' => true,
            ]);

            $empPriya = Employee::create([
                'user_id' => $userPriya->id,
                'employee_code' => 'EMP-0006',
                'first_name' => 'Priya',
                'last_name' => 'Sharma',
                'phone' => '+1-555-0106',
                'date_of_birth' => '1991-12-05',
                'gender' => 'female',
                'joining_date' => '2022-04-18',
                'department_id' => $engineering->id,
                'designation_id' => $desigBackendArch->id,
                'manager_id' => $empJohn->id,
                'salary' => 108000.00,
                'status' => 'active',
            ]);

            // 4.7 David Kim (Senior UI/UX Designer)
            $userDavid = User::create([
                'name' => 'David Kim',
                'email' => 'david.design@ems.local',
                'password' => $defaultPassword,
                'role' => 'employee',
                'is_active' => true,
            ]);

            $empDavid = Employee::create([
                'user_id' => $userDavid->id,
                'employee_code' => 'EMP-0007',
                'first_name' => 'David',
                'last_name' => 'Kim',
                'phone' => '+1-555-0107',
                'date_of_birth' => '1994-03-25',
                'gender' => 'male',
                'joining_date' => '2023-02-01',
                'department_id' => $product->id,
                'designation_id' => $desigUiUx->id,
                'manager_id' => $empSarah->id,
                'salary' => 89000.00,
                'status' => 'active',
            ]);

            // 4.8 Emily Watson (Talent Acquisition - Probation)
            $userEmily = User::create([
                'name' => 'Emily Watson',
                'email' => 'emily.talent@ems.local',
                'password' => $defaultPassword,
                'role' => 'employee',
                'is_active' => true,
            ]);

            $empEmily = Employee::create([
                'user_id' => $userEmily->id,
                'employee_code' => 'EMP-0008',
                'first_name' => 'Emily',
                'last_name' => 'Watson',
                'phone' => '+1-555-0108',
                'date_of_birth' => '1998-09-17',
                'gender' => 'female',
                'joining_date' => '2024-08-15',
                'department_id' => $hr->id,
                'designation_id' => $desigTalentSpecialist->id,
                'manager_id' => $empElena->id,
                'salary' => 74000.00,
                'status' => 'probation',
            ]);

            // 4.9 Liam Patel (Account Executive)
            $userLiam = User::create([
                'name' => 'Liam Patel',
                'email' => 'liam.sales@ems.local',
                'password' => $defaultPassword,
                'role' => 'employee',
                'is_active' => true,
            ]);

            $empLiam = Employee::create([
                'user_id' => $userLiam->id,
                'employee_code' => 'EMP-0009',
                'first_name' => 'Liam',
                'last_name' => 'Patel',
                'phone' => '+1-555-0109',
                'date_of_birth' => '1992-06-08',
                'gender' => 'male',
                'joining_date' => '2023-07-10',
                'department_id' => $marketing->id,
                'designation_id' => $desigAccountExec->id,
                'manager_id' => $empJohn->id,
                'salary' => 82000.00,
                'status' => 'active',
            ]);

            // 4.10 Sophia Zhang (Finance Analyst - On Leave)
            $userSophia = User::create([
                'name' => 'Sophia Zhang',
                'email' => 'sophia.fin@ems.local',
                'password' => $defaultPassword,
                'role' => 'employee',
                'is_active' => true,
            ]);

            $empSophia = Employee::create([
                'user_id' => $userSophia->id,
                'employee_code' => 'EMP-0010',
                'first_name' => 'Sophia',
                'last_name' => 'Zhang',
                'phone' => '+1-555-0110',
                'date_of_birth' => '1996-01-22',
                'gender' => 'female',
                'joining_date' => '2023-10-01',
                'department_id' => $finance->id,
                'designation_id' => $desigFinancialAnalyst->id,
                'manager_id' => $empJohn->id,
                'salary' => 86000.00,
                'status' => 'on_leave',
            ]);

            // -----------------------------------------------------------------
            // 5. ATTENDANCES (Today & Historical)
            // -----------------------------------------------------------------
            $today = Carbon::today();
            $yesterday = Carbon::yesterday();
            $twoDaysAgo = Carbon::today()->subDays(2);

            // Historical: Yesterday
            Attendance::create([
                'employee_id' => $empAlex->id,
                'date' => $yesterday->toDateString(),
                'clock_in' => $yesterday->copy()->setHour(9)->setMinute(0),
                'clock_out' => $yesterday->copy()->setHour(17)->setMinute(30),
                'total_hours' => 8.50,
                'status' => 'present',
                'notes' => 'Full shift completed.',
            ]);

            Attendance::create([
                'employee_id' => $empMarcus->id,
                'date' => $yesterday->toDateString(),
                'clock_in' => $yesterday->copy()->setHour(9)->setMinute(15),
                'clock_out' => $yesterday->copy()->setHour(18)->setMinute(0),
                'total_hours' => 8.75,
                'status' => 'present',
                'notes' => null,
            ]);

            // Today: Active punch records
            $attJohnToday = Attendance::create([
                'employee_id' => $empJohn->id,
                'date' => $today->toDateString(),
                'clock_in' => $today->copy()->setHour(8)->setMinute(45),
                'clock_out' => null,
                'total_hours' => null,
                'status' => 'present',
                'notes' => 'Early morning standup.',
            ]);

            $attAlexToday = Attendance::create([
                'employee_id' => $empAlex->id,
                'date' => $today->toDateString(),
                'clock_in' => $today->copy()->setHour(9)->setMinute(0),
                'clock_out' => $today->copy()->setHour(17)->setMinute(45),
                'total_hours' => 8.75,
                'status' => 'present',
                'notes' => 'Completed scheduled tasks.',
            ]);

            $attMarcusToday = Attendance::create([
                'employee_id' => $empMarcus->id,
                'date' => $today->toDateString(),
                'clock_in' => $today->copy()->setHour(9)->setMinute(20),
                'clock_out' => null,
                'total_hours' => null,
                'status' => 'present',
                'notes' => null,
            ]);

            // -----------------------------------------------------------------
            // 6. DAILY WORK REPORTS
            // -----------------------------------------------------------------
            // Alex: Submitted report today
            DailyReport::create([
                'employee_id' => $empAlex->id,
                'attendance_id' => $attAlexToday->id,
                'date' => $today->toDateString(),
                'tasks_completed' => "1. Implemented complete 2-verb REST API endpoints across all features.\n2. Built ADR-001 BaseController and sanitized exception handling.",
                'blockers' => 'None. Awaiting frontend integration kickoff.',
                'next_plan' => 'Begin Next.js 16 container and TanStack Query hook implementation.',
                'status' => 'submitted',
            ]);

            // Marcus: Reviewed report from yesterday
            DailyReport::create([
                'employee_id' => $empMarcus->id,
                'attendance_id' => null,
                'date' => $yesterday->toDateString(),
                'tasks_completed' => "1. Configured shadcn/ui primitives in pure JavaScript.\n2. Validated pure JS Zod schemas for forms.",
                'blockers' => 'None.',
                'next_plan' => 'Assemble layout components and responsive navigation header.',
                'status' => 'reviewed',
                'manager_remarks' => 'Superb work maintaining 100% pure JavaScript and clean token usage.',
                'reviewed_by' => $userJohn->id,
                'reviewed_at' => $today->copy()->setHour(10)->setMinute(30),
            ]);

            // -----------------------------------------------------------------
            // 7. LEAVE REQUESTS (State Machine Workflow)
            // -----------------------------------------------------------------
            // 7.1 Sophia: Approved Extended Leave (explains 'on_leave' status)
            LeaveRequest::create([
                'employee_id' => $empSophia->id,
                'leave_type_id' => $annualLeave->id,
                'start_date' => $today->copy()->subDays(2)->toDateString(),
                'end_date' => $today->copy()->addDays(5)->toDateString(),
                'total_days' => 8.0,
                'reason' => 'Annual family vacation overseas.',
                'status' => 'approved',
                'actioned_by' => $userJohn->id,
                'action_reason' => 'Approved. Team coverage confirmed.',
                'actioned_at' => $today->copy()->subDays(5),
            ]);

            // 7.2 Alex: Pending Casual Leave (Ready to test manager approval flow)
            LeaveRequest::create([
                'employee_id' => $empAlex->id,
                'leave_type_id' => $casualLeave->id,
                'start_date' => $today->copy()->addDays(7)->toDateString(),
                'end_date' => $today->copy()->addDays(8)->toDateString(),
                'total_days' => 2.0,
                'reason' => 'Attending family wedding ceremony.',
                'status' => 'pending',
                'actioned_by' => null,
                'action_reason' => null,
                'actioned_at' => null,
            ]);

            // 7.3 Marcus: Approved Sick Leave (Past)
            LeaveRequest::create([
                'employee_id' => $empMarcus->id,
                'leave_type_id' => $sickLeave->id,
                'start_date' => $today->copy()->subDays(10)->toDateString(),
                'end_date' => $today->copy()->subDays(9)->toDateString(),
                'total_days' => 2.0,
                'reason' => 'Viral fever and doctor recommended bed rest.',
                'status' => 'approved',
                'actioned_by' => $userJohn->id,
                'action_reason' => 'Get well soon!',
                'actioned_at' => $today->copy()->subDays(10),
            ]);

            // 7.4 Liam: Rejected Request
            LeaveRequest::create([
                'employee_id' => $empLiam->id,
                'leave_type_id' => $annualLeave->id,
                'start_date' => $today->copy()->addDays(2)->toDateString(),
                'end_date' => $today->copy()->addDays(6)->toDateString(),
                'total_days' => 5.0,
                'reason' => 'Personal trip.',
                'status' => 'rejected',
                'actioned_by' => $userJohn->id,
                'action_reason' => 'Critical sales quota closing week; please reschedule for next month.',
                'actioned_at' => $yesterday,
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
