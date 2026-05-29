<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

final class RegisterDTO
{
    public function __construct(
        public string $nom,
        public string $prenom,
        public string $email,
        public string $telephone,
        public string $genre,
        public string $mot_de_passe,
        public string $role = 'patient',
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            nom: $data['nom'],
            prenom: $data['prenom'],
            email: $data['email'],
            telephone: $data['telephone'],
            genre: $data['genre'],
            mot_de_passe: $data['mot_de_passe'],
            role: $data['role'] ?? 'patient',
        );
    }
}