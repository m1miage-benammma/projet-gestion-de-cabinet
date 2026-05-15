<?php

declare(strict_types=1);

namespace App\Modules\Utilisateur\Exceptions;

use Exception;

final class UtilisateurNotFoundException extends Exception
{
    public static function byId(int $id): self
    {
        return new self("Utilisateur avec ID {$id} introuvable.");
    }
}