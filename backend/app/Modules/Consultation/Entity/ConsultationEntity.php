<?php

declare(strict_types=1);

namespace App\Modules\Consultation\Entity;

// Selon le diagramme :
// -id, -date, -diagnostic, -traitement, -note
// +creer() : void
// +genererOrdonnance() : Ordonnance

final class ConsultationEntity
{
    public function __construct(
        private int     $id_consultation,
        private int     $id_dossier,
        private int     $id_medecin,
        private string  $date,
        private string  $diagnostic,
        private string  $traitement,
        private ?string $note = null,
    ) {}

    public function getIdConsultation(): int { return $this->id_consultation; }
    public function getIdDossier(): int      { return $this->id_dossier; }
    public function getIdMedecin(): int      { return $this->id_medecin; }
    public function getDate(): string        { return $this->date; }
    public function getDiagnostic(): string  { return $this->diagnostic; }
    public function getTraitement(): string  { return $this->traitement; }
    public function getNote(): ?string       { return $this->note; }
}