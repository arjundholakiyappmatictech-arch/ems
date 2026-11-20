<?php

namespace App\Exceptions\Employee;

use Exception;

class InvalidReportingHierarchyException extends Exception
{
    public function __construct(string $message = 'An employee cannot be their own reporting manager.')
    {
        parent::__construct($message, 422);
    }
}

