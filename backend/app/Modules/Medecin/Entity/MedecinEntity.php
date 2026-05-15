<?php

declare(strict_types=1);

namespace App\Modules\Medecin\Entity;

use App\Modules\Utilisateur\Entity\UtilisateurEntity;

final class MedecinEntity extends UtilisateurEntity
{
    public function __construct(
        int    $id_utilisateur,
        string $nom,
        string $prenom,
        string $email,
        string $telephone,
        string $genre,
        private string $specialite,
        private string $numero_ordre,
    ) {
        parent::__construct($id_utilisateur, $nom, $prenom, $email, $telephone, $genre, 'medecin');
    }

    public function getSpecialite(): string  { return $this->specialite; }
    public function getNumeroOrdre(): string { return $this->numero_ordre; }
}