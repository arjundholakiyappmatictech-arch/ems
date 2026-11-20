<?php

namespace App\Exceptions\Report;

use Exception;

class DuplicateDailyReportException extends Exception
{
    public function __construct(string $message = 'You have already submitted a daily report for today.')
    {
        parent::__construct($message, 422);
    }
}

