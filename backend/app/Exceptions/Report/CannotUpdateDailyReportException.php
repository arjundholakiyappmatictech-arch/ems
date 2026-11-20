<?php

namespace App\Exceptions\Report;

use Exception;

class CannotUpdateDailyReportException extends Exception
{
    public function __construct(string $message = 'You can only update your own pending report on the day of submission.')
    {
        parent::__construct($message, 422);
    }
}

