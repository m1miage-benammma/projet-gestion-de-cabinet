<?php

declare(strict_types=1);

namespace App\Modules\Soins\Exceptions;

use Exception;

final class SoinsNotFoundException extends Exception
{
    public static function byId(int $id): self
    {
        return new self("Soin avec ID {$id} introuvable.");
    }
}