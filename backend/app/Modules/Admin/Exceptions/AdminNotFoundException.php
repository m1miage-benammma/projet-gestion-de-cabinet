<?php

declare(strict_types=1);

namespace App\Modules\Admin\Exceptions;

use Exception;

final class AdminNotFoundException extends Exception
{
    public static function byId(int $id): self
    {
        return new self("Admin avec ID {$id} introuvable.");
    }
}