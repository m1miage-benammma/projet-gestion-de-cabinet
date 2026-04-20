<?php

declare(strict_types=1);

namespace App\Modules\Disponibilite\Exceptions;

use Exception;

final class DisponibiliteNotFoundException extends Exception
{
    public static function byId(int $id): self
    {
        return new self("Disponibilite avec ID {$id} introuvable.");
    }
}