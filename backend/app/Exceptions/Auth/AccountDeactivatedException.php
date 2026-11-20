<?php

namespace App\Exceptions\Auth;

use Exception;

class AccountDeactivatedException extends Exception
{
    public function __construct(string $message = 'Your account has been deactivated. Please contact your manager.')
    {
        parent::__construct($message, 403);
    }
}

