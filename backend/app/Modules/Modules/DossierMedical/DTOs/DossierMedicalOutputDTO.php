<?php

declare(strict_types=1);

namespace App\Modules\DossierMedical\DTOs;

use App\Modules\DossierMedical\Entity\DossierMedicalEntity;

final class DossierMedicalOutputDTO
{
    public function __construct(
        public int    $id_dossier,
        public int    $id_patient,
        public string $date_creation,
    ) {}

    public static function fromEntity(DossierMedicalEntity $entity): self
    {
        return new self(
            id_dossier: $entity->getIdDossier(),
            id_patient: $entity->getIdPatient(),
            date_creation: $entity->getDateCreation(),
        );
    }

    public function toArray(): array
    {
        return [
            'id_dossier'     => $this->id_dossier,
            'id_patient'     => $this->id_patient,
            'date_creation'  => $this->date_creation,
        ];
    }
}
