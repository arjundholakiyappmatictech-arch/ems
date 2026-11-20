<?php

namespace App\Exceptions\Attendance;

use Exception;

class NoEmployeeProfileException extends Exception
{
    public function __construct(string $message = 'No employee profile is linked to this account.')
    {
        parent::__construct($message, 422);
    }
}

