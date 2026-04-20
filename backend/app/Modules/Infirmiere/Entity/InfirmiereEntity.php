<?php

declare(strict_types=1);

namespace App\Modules\Infirmiere\Entity;

use App\Modules\Utilisateur\Entity\UtilisateurEntity;

// Selon le diagramme : -numeroEmploye, -dateEmbauche seulement
final class InfirmiereEntity extends UtilisateurEntity
{
    public function __construct(
        int    $id_utilisateur,
        string $nom,
        string $prenom,
        string $email,
        string $telephone,
        string $genre,
        private string $numero_employe,
        private string $date_embauche,
    ) {
        parent::__construct($id_utilisateur, $nom, $prenom, $email, $telephone, $genre, 'infirmiere');
    }

    public function getNumeroEmploye(): string { return $this->numero_employe; }
    public function getDateEmbauche(): string  { return $this->date_embauche; }
}