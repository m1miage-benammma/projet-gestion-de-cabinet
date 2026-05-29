<?php

declare(strict_types=1);

namespace App\Modules\Infirmiere\Exceptions;

use Exception;

final class InfirmiereNotFoundException extends Exception
{
    public static function byId(int $id): self
    {
        return new self("Infirmiere avec ID {$id} introuvable.");
    }
}