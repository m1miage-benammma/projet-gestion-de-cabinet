<?php

declare(strict_types=1);

namespace App\Modules\Medicament\Entity;

// Selon le diagramme : -id, -nom, -dosage, -duree
// mkaynch -forme !

final class MedicamentEntity
{
    public function __construct(
        private int    $id_medicament,
        private int    $id_ordonnance,
        private string $nom,
        private string $dosage,
        private string $duree,
    ) {}

    public function getIdMedicament(): int { return $this->id_medicament; }
    public function getIdOrdonnance(): int { return $this->id_ordonnance; }
    public function getNom(): string       { return $this->nom; }
    public function getDosage(): string    { return $this->dosage; }
    public function getDuree(): string     { return $this->duree; }
}