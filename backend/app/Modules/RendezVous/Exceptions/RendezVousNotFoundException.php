<?php
declare(strict_types=1);
namespace App\Modules\RendezVous\Exceptions;
use Exception;
final class RendezVousNotFoundException extends Exception
{
    public static function byId(int $id): self
    {
        return new self("Rendez-vous avec ID {$id} introuvable.");
    }
}
