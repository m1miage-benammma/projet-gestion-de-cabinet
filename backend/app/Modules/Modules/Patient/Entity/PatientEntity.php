<?php

declare(strict_types=1);

namespace App\Modules\Patient\Entity;

use App\Modules\Utilisateur\Entity\UtilisateurEntity;

final class PatientEntity extends UtilisateurEntity
{
    public function __construct(
        int    $id_utilisateur,
        string $nom,
        string $prenom,
        string $email,
        string $telephone,
        string $genre,
        private string $date_naissance,
        private string $adresse,
        private string $groupe_sanguin,
    ) {
        parent::__construct($id_utilisateur, $nom, $prenom, $email, $telephone, $genre, 'patient');
    }

    public function getDateNaissance(): string { return $this->date_naissance; }
    public function getAdresse(): string       { return $this->adresse; }
    public function getGroupeSanguin(): string { return $this->groupe_sanguin; }
}