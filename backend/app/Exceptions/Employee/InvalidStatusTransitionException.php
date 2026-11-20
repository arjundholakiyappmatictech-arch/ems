<?php

namespace App\Exceptions\Employee;

use Exception;

class InvalidStatusTransitionException extends Exception
{
    public function __construct(string $message = 'Invalid employee status transition.')
    {
        parent::__construct($message, 422);
    }
}

