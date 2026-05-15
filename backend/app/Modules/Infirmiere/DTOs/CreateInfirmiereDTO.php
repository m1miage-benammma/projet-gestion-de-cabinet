<?php

declare(strict_types=1);

namespace App\Modules\Infirmiere\DTOs;

final class CreateInfirmiereDTO
{
    public function __construct(
        public string $nom,
        public string $prenom,
        public string $email,
        public string $telephone,
        public string $genre,
        public string $mot_de_passe,
        public string $numero_employe,
        public string $date_embauche,
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
            numero_employe: $data['numero_employe'],
            date_embauche: $data['date_embauche'],
        );
    }
}