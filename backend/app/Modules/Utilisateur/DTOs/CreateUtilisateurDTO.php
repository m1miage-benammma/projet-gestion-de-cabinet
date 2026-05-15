<?php
declare(strict_types=1);
namespace App\Modules\Utilisateur\DTOs;

final class CreateUtilisateurDTO
{
    public function __construct(
        public string $nom,
        public string $prenom,
        public string $email,
        public ?string $telephone,
        public string $sexe,
        public string $motDePasse,
        public string $type,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            nom: $data['nom'],
            prenom: $data['prenom'],
            email: $data['email'],
            telephone: $data['telephone'] ?? null,
            sexe: $data['sexe'],
            motDePasse: $data['mot_de_passe'],
            type: $data['type'],
        );
    }
}