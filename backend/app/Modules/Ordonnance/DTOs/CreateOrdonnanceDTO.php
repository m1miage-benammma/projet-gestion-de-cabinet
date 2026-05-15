<?php

declare(strict_types=1);

namespace App\Modules\Ordonnance\DTOs;

final class CreateOrdonnanceDTO
{
    public function __construct(
        public int     $id_consultation,
        public string  $date_emission,
        public ?string $instructions = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            id_consultation: $data['id_consultation'],
            date_emission: $data['date_emission'],
            instructions: $data['instructions'] ?? null,
        );
    }
}