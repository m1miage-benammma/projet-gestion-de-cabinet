<?php

declare(strict_types=1);

namespace App\Modules\Patient\DTOs;

final class CreatePatientDTO
{
    public function __construct(
        public string $nom,
        public string $prenom,
        public string $email,
        public string $telephone,
        public string $genre,
        public string $mot_de_passe,
        public string $date_naissance,
        public string $adresse,
        public string $groupe_sanguin,
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
            date_naissance: $data['date_naissance'],
            adresse: $data['adresse'],
            groupe_sanguin: $data['groupe_sanguin'],
        );
    }
}