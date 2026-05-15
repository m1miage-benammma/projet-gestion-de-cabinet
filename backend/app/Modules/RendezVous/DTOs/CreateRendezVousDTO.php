<?php

declare(strict_types=1);

namespace App\Modules\RendezVous\DTOs;

final class CreateRendezVousDTO
{
    public function __construct(
        public int    $id_patient,
        public int    $id_disponibilite,
        public string $date_rdv,
        public string $heure_rdv,
        public string $motif,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id_patient: $data['id_patient'],
            id_disponibilite: $data['id_disponibilite'],
            date_rdv: $data['date_rdv'],
            heure_rdv: $data['heure_rdv'],
            motif: $data['motif'],
        );
    }
}