<?php

declare(strict_types=1);

namespace App\Modules\Consultation\Exceptions;

use Exception;

final class ConsultationNotFoundException extends Exception
{
    public static function byId(int $id): self
    {
        return new self("Consultation avec ID {$id} introuvable.");
    }
}