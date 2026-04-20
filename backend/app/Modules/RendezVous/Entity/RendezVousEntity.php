<?php

declare(strict_types=1);

namespace App\Modules\RendezVous\Entity;

// Selon le diagramme + séquences :
// StatutRDV : EN_ATTENTE, CONFIRME, ANNULE, TERMINE, PATIENT_ARRIVE

final class RendezVousEntity
{
    public const STATUTS = [
        'EN_ATTENTE',
        'CONFIRME',
        'ANNULE',
        'TERMINE',
        'PATIENT_ARRIVE', // ← ajouté selon séquence Infirmière
    ];

    public function __construct(
        private int    $id_rdv,
        private int    $id_patient,
        private int    $id_disponibilite,
        private string $date_rdv,
        private string $heure_rdv,
        private string $motif,
        private string $statut = 'EN_ATTENTE',
    ) {}

    public function getIdRdv(): int           { return $this->id_rdv; }
    public function getIdPatient(): int       { return $this->id_patient; }
    public function getIdDisponibilite(): int { return $this->id_disponibilite; }
    public function getDateRdv(): string      { return $this->date_rdv; }
    public function getHeureRdv(): string     { return $this->heure_rdv; }
    public function getMotif(): string        { return $this->motif; }
    public function getStatut(): string       { return $this->statut; }

    // +confirmer() selon le diagramme
    public function confirmer(): void
    {
        $this->statut = 'CONFIRME';
    }

    // +annuler() selon le diagramme
    public function annuler(): void
    {
        $this->statut = 'ANNULE';
    }

    // +modifier() selon le diagramme
    public function modifier(string $dateRdv, string $heureRdv, string $motif): void
    {
        $this->date_rdv  = $dateRdv;
        $this->heure_rdv = $heureRdv;
        $this->motif     = $motif;
    }

    // patient arrivé → séquence Infirmière
    public function patientArrive(): void
    {
        $this->statut = 'PATIENT_ARRIVE';
    }

    // terminer → après consultation
    public function terminer(): void
    {
        $this->statut = 'TERMINE';
    }
}