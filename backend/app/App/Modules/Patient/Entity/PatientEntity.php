<?php
declare(strict_types=1);
namespace App\Modules\Patient\Entity;

use App\Modules\Utilisateur\Entity\UtilisateurEntity;

class PatientEntity extends UtilisateurEntity
{
    public function __construct(
        private \DateTime $dateDeNaissance,
        private string $adresse,
        private string $groupeSanguin,
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
            type: 'patient',
            createdAt: $createdAt, updatedAt: $updatedAt,
        );
    }

    public function getDateDeNaissance(): \DateTime { return $this->dateDeNaissance; }
    public function getAdresse(): string { return $this->adresse; }
    public function getGroupeSanguin(): string { return $this->groupeSanguin; }

    public function toArray(): array
    {
        return array_merge(parent::toArray(), [
            'date_de_naissance' => $this->dateDeNaissance->format('Y-m-d'),
            'adresse'           => $this->adresse,
            'groupe_sanguin'    => $this->groupeSanguin,
        ]);
    }
}