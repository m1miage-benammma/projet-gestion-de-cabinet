<?php

declare(strict_types=1);

namespace App\Modules\Disponibilite\DTOs;

use App\Modules\Disponibilite\Entity\DisponibiliteEntity;

final class DisponibiliteOutputDTO
{
    public function __construct(
        public int    $id_disponibilite,
        public int    $id_medecin,
        public string $jour,
        public string $heure_debut,
        public string $heure_fin,
    ) {}

    public static function fromEntity(DisponibiliteEntity $entity): self
    {
        return new self(
            id_disponibilite: $entity->getIdDisponibilite(),
            id_medecin: $entity->getIdMedecin(),
            jour: $entity->getJour(),
            heure_debut: $entity->getHeureDebut(),
            heure_fin: $entity->getHeureFin(),
        );
    }

    public function toArray(): array
    {
        return [
            'id_disponibilite' => $this->id_disponibilite,
            'id_medecin'       => $this->id_medecin,
            'jour'             => $this->jour,
            'heure_debut'      => $this->heure_debut,
            'heure_fin'        => $this->heure_fin,
        ];
    }
}