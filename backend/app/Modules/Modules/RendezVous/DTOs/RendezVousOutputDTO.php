<?php

declare(strict_types=1);

namespace App\Modules\RendezVous\DTOs;

use App\Modules\RendezVous\Entity\RendezVousEntity;

final class RendezVousOutputDTO
{
    public function __construct(
        public int    $id_rdv,
        public int    $id_patient,
        public int    $id_disponibilite,
        public string $date_rdv,
        public string $heure_rdv,
        public string $motif,
        public string $statut,
    ) {}

    public static function fromEntity(RendezVousEntity $entity): self
    {
        return new self(
            id_rdv: $entity->getIdRdv(),
            id_patient: $entity->getIdPatient(),
            id_disponibilite: $entity->getIdDisponibilite(),
            date_rdv: $entity->getDateRdv(),
            heure_rdv: $entity->getHeureRdv(),
            motif: $entity->getMotif(),
            statut: $entity->getStatut(),
        );
    }

    public function toArray(): array
    {
        return [
            'id_rdv'           => $this->id_rdv,
            'id_patient'       => $this->id_patient,
            'id_disponibilite' => $this->id_disponibilite,
            'date_rdv'         => $this->date_rdv,
            'heure_rdv'        => $this->heure_rdv,
            'motif'            => $this->motif,
            'statut'           => $this->statut,
        ];
    }
}