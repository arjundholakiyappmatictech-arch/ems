<?php

namespace App\Exceptions\Attendance;

use Exception;

class AlreadyClockedInException extends Exception
{
    public function __construct(string $message = 'You have already clocked in for today.')
    {
        parent::__construct($message, 422);
    }
}

