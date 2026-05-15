<?php

declare(strict_types=1);

namespace App\Modules\Patient\Exceptions;

use Exception;

final class PatientNotFoundException extends Exception
{
    public static function byId(int $id): self
    {
        return new self("Patient avec ID {$id} introuvable.");
    }
}