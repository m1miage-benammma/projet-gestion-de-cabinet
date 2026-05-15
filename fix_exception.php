<?php
// Crée le fichier StatutInvalideException.php manquant
$content = '<?php

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
';

$path = 'app/Modules/RendezVous/Exceptions/StatutInvalideException.php';
file_put_contents($path, $content);
echo "✅ Créé: $path\n";
