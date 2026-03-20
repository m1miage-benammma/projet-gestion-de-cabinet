<?php
declare(strict_types=1);
namespace App\Modules\Utilisateur\DTOs;

use App\Modules\Utilisateur\Entity\UtilisateurEntity;

final class UtilisateurOutputDTO
{
    public function __construct(
        public int $id,
        public string $nom,
        public string $prenom,
        public string $email,
        public ?string $telephone,
        public string $sexe,
        public string $type,
        public string $createdAt,
        public string $updatedAt,
    ) {}

    public static function fromEntity(UtilisateurEntity $entity): self
    {
        return new self(
            id: $entity->getId(),
            nom: $entity->getNom(),
            prenom: $entity->getPrenom(),
            email: $entity->getEmail(),
            telephone: $entity->getTelephone(),
            sexe: $entity->getSexe(),
            type: $entity->getType(),
            createdAt: $entity->getCreatedAt()?->format('Y-m-d H:i:s') ?? '',
            updatedAt: $entity->getUpdatedAt()?->format('Y-m-d H:i:s') ?? '',
        );
    }

    public function toArray(): array
    {
        return [
            'id'         => $this->id,
            'nom'        => $this->nom,
            'prenom'     => $this->prenom,
            'email'      => $this->email,
            'telephone'  => $this->telephone,
            'sexe'       => $this->sexe,
            'type'       => $this->type,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}