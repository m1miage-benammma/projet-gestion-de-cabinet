<?php

declare(strict_types=1);

namespace App\Modules\Ordonnance\Exceptions;

use Exception;

final class OrdonnanceNotFoundException extends Exception
{
    public static function byId(int $id): self
    {
        return new self("Ordonnance avec ID {$id} introuvable.");
    }
}