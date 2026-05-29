<?php

declare(strict_types=1);

namespace App\Modules\DossierMedical\Entity;

// Selon le diagramme :
// -id : Int
// -dateCreation : Date
// +ajouterConsultation() : void
// +consulter() : List

final class DossierMedicalEntity
{
    public function __construct(
        private int    $id_dossier,
        private int    $id_patient,
        private string $date_creation,
    ) {}

    public function getIdDossier(): int       { return $this->id_dossier; }
    public function getIdPatient(): int       { return $this->id_patient; }
    public function getDateCreation(): string { return $this->date_creation; }
}