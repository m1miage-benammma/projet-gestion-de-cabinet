<?php

declare(strict_types=1);

namespace App\Modules\Ordonnance\DTOs;

use App\Modules\Ordonnance\Entity\OrdonnanceEntity;

final class OrdonnanceOutputDTO
{
    public function __construct(
        public int     $id_ordonnance,
        public int     $id_consultation,
        public string  $date_emission,
        public ?string $instructions,
    ) {}

    public static function fromEntity(OrdonnanceEntity $entity): self
    {
        return new self(
            id_ordonnance: $entity->getIdOrdonnance(),
            id_consultation: $entity->getIdConsultation(),
            date_emission: $entity->getDateEmission(),
            instructions: $entity->getInstructions(),
        );
    }

    public function toArray(): array
    {
        return [
            'id_ordonnance'   => $this->id_ordonnance,
            'id_consultation' => $this->id_consultation,
            'date_emission'   => $this->date_emission,
            'instructions'    => $this->instructions,
        ];
    }
}