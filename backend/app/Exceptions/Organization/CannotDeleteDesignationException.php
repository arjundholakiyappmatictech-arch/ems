<?php

namespace App\Exceptions\Organization;

use Exception;

class CannotDeleteDesignationException extends Exception
{
    public function __construct(string $message = 'Cannot delete designation with active employee assignments.')
    {
        parent::__construct($message, 422);
    }
}

