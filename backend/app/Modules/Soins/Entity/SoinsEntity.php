<?php

declare(strict_types=1);

namespace App\Modules\Soins\Entity;

// Selon le diagramme :
// -idSoin, -typeSoin : TypeSoin, -ficheSoin, -date, -observation
// +enregistrer() : void
// +consulter() : List

final class SoinsEntity
{
    // TypeSoin Enum selon le diagramme
    public const TYPES_VALIDES = [
        'INJECTION',
        'PANSEMENT',
        'PERFUSION',
        'PRISE_DE_SANG',
        'SOINS_PLAIE',
        'AUTRE',
    ];

    public function __construct(
        private int     $id_soin,
        private int     $id_infirmiere,
        private int     $id_patient,
        private ?int    $id_ordonnance,
        private string  $type_soin,
        private string  $fiche_soin,
        private string  $date,
        private ?string $observation = null,
    ) {}

    public function getIdSoin(): int          { return $this->id_soin; }
    public function getIdInfirmiere(): int    { return $this->id_infirmiere; }
    public function getIdPatient(): int       { return $this->id_patient; }
    public function getIdOrdonnance(): ?int   { return $this->id_ordonnance; }
    public function getTypeSoin(): string     { return $this->type_soin; }
    public function getFicheSoin(): string    { return $this->fiche_soin; }
    public function getDate(): string         { return $this->date; }
    public function getObservation(): ?string { return $this->observation; }
}