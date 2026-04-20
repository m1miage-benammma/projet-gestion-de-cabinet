<?php

declare(strict_types=1);

namespace App\Modules\Soins\DTOs;

final class CreateSoinsDTO
{
    public function __construct(
        public int     $id_infirmiere,
        public int     $id_patient,
        public ?int    $id_ordonnance,
        public string  $type_soin,
        public string  $fiche_soin,
        public string  $date,
        public ?string $observation = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id_infirmiere: $data['id_infirmiere'],
            id_patient: $data['id_patient'],
            id_ordonnance: $data['id_ordonnance'] ?? null,
            type_soin: $data['type_soin'],
            fiche_soin: $data['fiche_soin'],
            date: $data['date'],
            observation: $data['observation'] ?? null,
        );
    }
}