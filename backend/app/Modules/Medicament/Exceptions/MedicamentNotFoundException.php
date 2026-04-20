<?php

declare(strict_types=1);

namespace App\Modules\Medicament\Exceptions;

use Exception;

final class MedicamentNotFoundException extends Exception
{
    public static function byId(int $id): self
    {
        return new self("Medicament avec ID {$id} introuvable.");
    }
}