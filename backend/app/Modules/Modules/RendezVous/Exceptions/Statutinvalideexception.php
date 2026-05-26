<?php
declare(strict_types=1);
namespace App\Modules\RendezVous\Exceptions;
use Exception;
final class StatutInvalideException extends Exception
{
    public static function make(string $statut): self
    {
        return new self("Impossible de modifier un rendez-vous avec statut: {$statut}");
    }
}