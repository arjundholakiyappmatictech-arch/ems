<?php

namespace App\Exceptions\Report;

use Exception;

class CannotReviewOwnReportException extends Exception
{
    public function __construct(string $message = 'Managers cannot review their own daily work reports.')
    {
        parent::__construct($message, 422);
    }
}

