<?php

declare(strict_types=1);

namespace App\Modules\Medecin\DTOs;

final class CreateMedecinDTO
{
    public function __construct(
        public string $nom,
        public string $prenom,
        public string $email,
        public string $telephone,
        public string $genre,
        public string $mot_de_passe,
        public string $specialite,
        public string $numero_ordre,
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
            specialite: $data['specialite'],
            numero_ordre: $data['numero_ordre'],
        );
    }
}