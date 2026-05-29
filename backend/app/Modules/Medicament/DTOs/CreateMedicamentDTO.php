<?php

declare(strict_types=1);

namespace App\Modules\Medicament\DTOs;

final class CreateMedicamentDTO
{
    public function __construct(
        public int    $id_ordonnance,
        public string $nom,
        public string $dosage,
        public string $duree,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id_ordonnance: $data['id_ordonnance'],
            nom: $data['nom'],
            dosage: $data['dosage'],
            duree: $data['duree'],
        );
    }
}