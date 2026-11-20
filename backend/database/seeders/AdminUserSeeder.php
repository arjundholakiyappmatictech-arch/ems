<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Designation;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $manager = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin Manager',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'is_active' => true,
            ]
        );

        // Ensure credentials and role are explicitly synchronized
        $manager->update([
            'name' => 'Admin Manager',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'is_active' => true,
        ]);

        $department = Department::first();
        $designation = Designation::first();

        Employee::firstOrCreate(
            ['user_id' => $manager->id],
            [
                'employee_code' => 'EMP-0000',
                'first_name' => 'Admin',
                'last_name' => 'Manager',
                'phone' => '+1-555-0000',
                'date_of_birth' => '1985-01-01',
                'gender' => 'other',
                'joining_date' => '2020-01-01',
                'department_id' => $department?->id,
                'designation_id' => $designation?->id,
                'manager_id' => null,
                'salary' => 150000.00,
                'status' => 'active',
            ]
        );
    }
}
