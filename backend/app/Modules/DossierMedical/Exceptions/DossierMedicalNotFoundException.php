<?php

declare(strict_types=1);

namespace App\Modules\DossierMedical\Exceptions;

use Exception;

final class DossierMedicalNotFoundException extends Exception
{
    public static function byPatient(int $id): self
    {
        return new self("Dossier medical du patient {$id} introuvable.");
    }

    public static function byId(int $id): self
    {
        return new self("Dossier medical avec ID {$id} introuvable.");
    }
}