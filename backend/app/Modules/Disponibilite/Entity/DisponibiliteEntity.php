<?php

declare(strict_types=1);

namespace App\Modules\Disponibilite\Entity;

final class DisponibiliteEntity
{
    public function __construct(
        private int    $id_disponibilite,
        private int    $id_medecin,
        private string $jour,
        private string $heure_debut,
        private string $heure_fin,
    ) {}

    public function getIdDisponibilite(): int { return $this->id_disponibilite; }
    public function getIdMedecin(): int       { return $this->id_medecin; }
    public function getJour(): string         { return $this->jour; }
    public function getHeureDebut(): string   { return $this->heure_debut; }
    public function getHeureFin(): string     { return $this->heure_fin; }
}