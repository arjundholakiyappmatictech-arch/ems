<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->restrictOnDelete();
            $table->string('employee_code', 50)->unique();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('phone', 30)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 20)->nullable(); // 'male', 'female', 'other'
            $table->date('joining_date');
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('designation_id')->nullable()->constrained('designations')->nullOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->decimal('salary', 12, 2)->default(0.00);
            $table->string('status', 20)->default('probation'); // 'active', 'probation', 'on_leave', 'terminated'
            $table->timestamps();

            $table->index('department_id');
            $table->index('designation_id');
            $table->index('manager_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};

