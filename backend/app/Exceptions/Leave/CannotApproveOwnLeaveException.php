<?php

namespace App\Exceptions\Leave;

use Exception;

class CannotApproveOwnLeaveException extends Exception
{
    public function __construct(string $message = 'Managers cannot approve or reject their own leave requests.')
    {
        parent::__construct($message, 422);
    }
}

