<?php

namespace App\Exceptions\Leave;

use Exception;

class InsufficientLeaveBalanceException extends Exception
{
    public function __construct(string $message = 'You have exceeded the maximum allowed leave quota for this leave type this year.')
    {
        parent::__construct($message, 422);
    }
}

