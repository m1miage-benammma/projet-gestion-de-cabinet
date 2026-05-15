<?php

declare(strict_types=1);

namespace App\Modules\RendezVous\Entity;

/**
 * RendezVousEntity
 *
 * Statuts en MINUSCULE — cohérence avec l'enum MySQL :
 *   en_attente → confirme → patient_arrive → termine
 *   (annule) depuis n'importe quel état actif
 */
final class RendezVousEntity
{
    public const STATUT_EN_ATTENTE     = 'en_attente';
    public const STATUT_CONFIRME       = 'confirme';
    public const STATUT_PATIENT_ARRIVE = 'patient_arrive';
    public const STATUT_ANNULE         = 'annule';
    public const STATUT_TERMINE        = 'termine';

    public const STATUTS = [
        self::STATUT_EN_ATTENTE,
        self::STATUT_CONFIRME,
        self::STATUT_PATIENT_ARRIVE,
        self::STATUT_ANNULE,
        self::STATUT_TERMINE,
    ];

    public function __construct(
        private int    $id_rdv,
        private int    $id_patient,
        private int    $id_disponibilite,
        private string $date_rdv,
        private string $heure_rdv,
        private string $motif,
        private string $statut = self::STATUT_EN_ATTENTE,
    ) {}

    public function getIdRdv(): int           { return $this->id_rdv; }
    public function getIdPatient(): int       { return $this->id_patient; }
    public function getIdDisponibilite(): int { return $this->id_disponibilite; }
    public function getDateRdv(): string      { return $this->date_rdv; }
    public function getHeureRdv(): string     { return $this->heure_rdv; }
    public function getMotif(): string        { return $this->motif; }
    public function getStatut(): string       { return $this->statut; }

    public function confirmer(): void
    {
        if ($this->statut !== self::STATUT_EN_ATTENTE) {
            throw new \LogicException("Impossible de confirmer : statut actuel = {$this->statut}");
        }
        $this->statut = self::STATUT_CONFIRME;
    }

    public function annuler(): void
    {
        if (in_array($this->statut, [self::STATUT_ANNULE, self::STATUT_TERMINE], true)) {
            throw new \LogicException("Impossible d'annuler : statut actuel = {$this->statut}");
        }
        $this->statut = self::STATUT_ANNULE;
    }

    public function modifier(string $dateRdv, string $heureRdv, string $motif): void
    {
        if (in_array($this->statut, [self::STATUT_ANNULE, self::STATUT_TERMINE], true)) {
            throw new \LogicException("Impossible de modifier : statut actuel = {$this->statut}");
        }
        $this->date_rdv  = $dateRdv;
        $this->heure_rdv = $heureRdv;
        $this->motif     = $motif;
    }

    public function patientArrive(): void
    {
        if ($this->statut !== self::STATUT_CONFIRME) {
            throw new \LogicException("Le patient doit avoir un RDV confirmé. Statut actuel : {$this->statut}");
        }
        $this->statut = self::STATUT_PATIENT_ARRIVE;
    }

    public function terminer(): void
    {
        $this->statut = self::STATUT_TERMINE;
    }
}