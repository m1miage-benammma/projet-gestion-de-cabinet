<?php

declare(strict_types=1);

namespace App\Modules\Utilisateur\DTOs;

final class UpdateProfilDTO
{
    public function __construct(
        public string $nom,
        public string $prenom,
        public string $telephone,
        public string $email,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            nom: $data['nom'],
            prenom: $data['prenom'],
            telephone: $data['telephone'],
            email: $data['email'],
        );
    }
}