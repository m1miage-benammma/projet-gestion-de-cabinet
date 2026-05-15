<?php

declare(strict_types=1);

namespace App\Modules\Soins\DTOs;

use App\Modules\Soins\Entity\SoinsEntity;

final class SoinsOutputDTO
{
    public function __construct(
        public int     $id_soin,
        public int     $id_infirmiere,
        public int     $id_patient,
        public ?int    $id_ordonnance,
        public string  $type_soin,
        public string  $fiche_soin,
        public string  $date,
        public ?string $observation,
    ) {}

    public static function fromEntity(SoinsEntity $entity): self
    {
        return new self(
            id_soin: $entity->getIdSoin(),
            id_infirmiere: $entity->getIdInfirmiere(),
            id_patient: $entity->getIdPatient(),
            id_ordonnance: $entity->getIdOrdonnance(),
            type_soin: $entity->getTypeSoin(),
            fiche_soin: $entity->getFicheSoin(),
            date: $entity->getDate(),
            observation: $entity->getObservation(),
        );
    }

    public function toArray(): array
    {
        return [
            'id_soin'       => $this->id_soin,
            'id_infirmiere' => $this->id_infirmiere,
            'id_patient'    => $this->id_patient,
            'id_ordonnance' => $this->id_ordonnance,
            'type_soin'     => $this->type_soin,
            'fiche_soin'    => $this->fiche_soin,
            'date'          => $this->date,
            'observation'   => $this->observation,
        ];
    }
}