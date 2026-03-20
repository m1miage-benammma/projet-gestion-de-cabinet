<?php
declare(strict_types=1);
namespace App\Modules\Utilisateur\Exceptions;

final class UtilisateurNotFoundException extends \RuntimeException
{
    public static function byId(int $id): self
    {
        return new self("Utilisateur avec id={$id} introuvable.");
    }
}