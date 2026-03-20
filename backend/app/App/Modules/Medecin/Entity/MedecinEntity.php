<?php
declare(strict_types=1);
namespace App\Modules\Medecin\Entity;

use App\Modules\Utilisateur\Entity\UtilisateurEntity;

class MedecinEntity extends UtilisateurEntity
{
    public function __construct(
        private string $specialite,
        private string $numeroOrdre,
        int $id = 0,
        string $nom = '',
        string $prenom = '',
        string $email = '',
        ?string $telephone = null,
        string $sexe = '',
        string $motDePasse = '',
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null,
    ) {
        parent::__construct(
            id: $id, nom: $nom, prenom: $prenom,
            email: $email, telephone: $telephone,
            sexe: $sexe, motDePasse: $motDePasse,
            type: 'medecin',
            createdAt: $createdAt, updatedAt: $updatedAt,
        );
    }

    public function getSpecialite(): string { return $this->specialite; }
    public function getNumeroOrdre(): string { return $this->numeroOrdre; }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'specialite'   => $this->specialite,
            'numero_ordre' => $this->numeroOrdre,
        ]);
    }
}