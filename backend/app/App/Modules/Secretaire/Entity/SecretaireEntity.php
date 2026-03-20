<?php
declare(strict_types=1);
namespace App\Modules\Secretaire\Entity;

use App\Modules\Utilisateur\Entity\UtilisateurEntity;

class SecretaireEntity extends UtilisateurEntity
{
    public function __construct(
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
            type: 'secretaire',
            createdAt: $createdAt, updatedAt: $updatedAt,
        );
    }
}