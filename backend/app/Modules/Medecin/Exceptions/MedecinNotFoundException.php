<?php

declare(strict_types=1);

namespace App\Modules\Medecin\Exceptions;

use Exception;

final class MedecinNotFoundException extends Exception
{
    public static function byId(int $id): self
    {
        return new self("Medecin avec ID {$id} introuvable.");
    }
}