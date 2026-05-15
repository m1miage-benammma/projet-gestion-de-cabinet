<?php

declare(strict_types=1);

namespace App\Modules\Disponibilite\DTOs;

final class CreateDisponibiliteDTO
{
    public function __construct(
        public int    $id_medecin,
        public string $jour,
        public string $heure_debut,
        public string $heure_fin,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id_medecin: $data['id_medecin'],
            jour: $data['jour'],
            heure_debut: $data['heure_debut'],
            heure_fin: $data['heure_fin'],
        );
    }
}