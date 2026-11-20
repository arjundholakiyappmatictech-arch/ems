<?php

namespace App\Exceptions\Auth;

use Exception;

class UnauthorizedRoleException extends Exception
{
    public function __construct(string $message = 'You do not have permission to perform this management action.')
    {
        parent::__construct($message, 403);
    }
}

