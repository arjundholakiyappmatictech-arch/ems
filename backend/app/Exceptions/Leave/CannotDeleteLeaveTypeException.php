<?php

namespace App\Exceptions\Leave;

use Exception;

class CannotDeleteLeaveTypeException extends Exception
{
    public function __construct(string $message = 'Cannot delete leave type with existing employee requests.')
    {
        parent::__construct($message, 422);
    }
}

