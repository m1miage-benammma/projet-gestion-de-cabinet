<?php

declare(strict_types=1);

namespace App\Modules\Consultation\DTOs;

use App\Modules\Consultation\Entity\ConsultationEntity;

final class ConsultationOutputDTO
{
    public function __construct(
        public int     $id_consultation,
        public int     $id_dossier,
        public int     $id_medecin,
        public string  $date,
        public string  $diagnostic,
        public string  $traitement,
        public ?string $note,
    ) {}

    public static function fromEntity(ConsultationEntity $entity): self
    {
        return new self(
            id_consultation: $entity->getIdConsultation(),
            id_dossier: $entity->getIdDossier(),
            id_medecin: $entity->getIdMedecin(),
            date: $entity->getDate(),
            diagnostic: $entity->getDiagnostic(),
            traitement: $entity->getTraitement(),
            note: $entity->getNote(),
        );
    }

    public function toArray(): array
    {
        return [
            'id_consultation' => $this->id_consultation,
            'id_dossier'      => $this->id_dossier,
            'id_medecin'      => $this->id_medecin,
            'date'            => $this->date,
            'diagnostic'      => $this->diagnostic,
            'traitement'      => $this->traitement,
            'note'            => $this->note,
        ];
    }
}