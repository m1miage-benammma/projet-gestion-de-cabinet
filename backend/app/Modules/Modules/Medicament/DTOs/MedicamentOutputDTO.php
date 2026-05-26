<?php

declare(strict_types=1);

namespace App\Modules\Medicament\DTOs;

use App\Modules\Medicament\Entity\MedicamentEntity;

final class MedicamentOutputDTO
{
    public function __construct(
        public int    $id_medicament,
        public int    $id_ordonnance,
        public string $nom,
        public string $dosage,
        public string $duree,
    ) {}

    public static function fromEntity(MedicamentEntity $entity): self
    {
        return new self(
            id_medicament: $entity->getIdMedicament(),
            id_ordonnance: $entity->getIdOrdonnance(),
            nom: $entity->getNom(),
            dosage: $entity->getDosage(),
            duree: $entity->getDuree(),
        );
    }

    public function toArray(): array
    {
        return [
            'id_medicament' => $this->id_medicament,
            'id_ordonnance' => $this->id_ordonnance,
            'nom'           => $this->nom,
            'dosage'        => $this->dosage,
            'duree'         => $this->duree,
        ];
    }
}