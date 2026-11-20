<?php

namespace App\Exceptions\Organization;

use Exception;

class CannotDeleteDepartmentException extends Exception
{
    public function __construct(string $message = 'Cannot delete department with active employees or designations.')
    {
        parent::__construct($message, 422);
    }
}

