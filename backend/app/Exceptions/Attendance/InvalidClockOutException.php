<?php

namespace App\Exceptions\Attendance;

use Exception;

class InvalidClockOutException extends Exception
{
    public function __construct(string $message = 'You have not clocked in today or have already clocked out.')
    {
        parent::__construct($message, 422);
    }
}

