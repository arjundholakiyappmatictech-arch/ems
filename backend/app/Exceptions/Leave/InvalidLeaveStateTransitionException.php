<?php

namespace App\Exceptions\Leave;

use Exception;

class InvalidLeaveStateTransitionException extends Exception
{
    public function __construct(string $message = 'Only pending leave requests can be transitioned or cancelled.')
    {
        parent::__construct($message, 422);
    }
}

