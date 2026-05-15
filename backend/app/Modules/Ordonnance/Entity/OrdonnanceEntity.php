<?php

declare(strict_types=1);

namespace App\Modules\Ordonnance\Entity;

// Selon le diagramme :
// -id, -dateEmission, -instructions
// +generer() : void
// +modifier() : void

final class OrdonnanceEntity
{
    public function __construct(
        private int     $id_ordonnance,
        private int     $id_consultation,
        private string  $date_emission,
        private ?string $instructions = null,
    ) {}

    public function getIdOrdonnance(): int    { return $this->id_ordonnance; }
    public function getIdConsultation(): int  { return $this->id_consultation; }
    public function getDateEmission(): string { return $this->date_emission; }
    public function getInstructions(): ?string { return $this->instructions; }

    // +modifier() selon le diagramme
    public function modifier(string $dateEmission, ?string $instructions): void
    {
        $this->date_emission = $dateEmission;
        $this->instructions  = $instructions;
    }
}