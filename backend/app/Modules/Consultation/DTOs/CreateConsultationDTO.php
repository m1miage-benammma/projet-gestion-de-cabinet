<?php

declare(strict_types=1);

namespace App\Modules\Consultation\DTOs;

final class CreateConsultationDTO
{
    public function __construct(
        public int     $id_dossier,
        public int     $id_medecin,
        public string  $date,
        public string  $diagnostic,
        public string  $traitement,
        public ?string $note = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id_dossier: $data['id_dossier'],
            id_medecin: $data['id_medecin'],
            date: $data['date'],
            diagnostic: $data['diagnostic'],
            traitement: $data['traitement'],
            note: $data['note'] ?? null,
        );
    }
}