<?php

declare(strict_types=1);

namespace App\Modules\Medecin\DTOs;

use App\Modules\Medecin\Entity\MedecinEntity;

final class MedecinOutputDTO
{
    public function __construct(
        public int    $id_utilisateur,
        public string $nom,
        public string $prenom,
        public string $email,
        public string $telephone,
        public string $genre,
        public string $specialite,
        public string $numero_ordre,
    ) {}

    public static function fromEntity(MedecinEntity $entity): self
    {
        return new self(
            id_utilisateur: $entity->getIdUtilisateur(),
            nom: $entity->getNom(),
            prenom: $entity->getPrenom(),
            email: $entity->getEmail(),
            telephone: $entity->getTelephone(),
            genre: $entity->getGenre(),
            specialite: $entity->getSpecialite(),
            numero_ordre: $entity->getNumeroOrdre(),
        );
    }

    public function toArray(): array
    {
        return [
            'id_utilisateur' => $this->id_utilisateur,
            'nom'            => $this->nom,
            'prenom'         => $this->prenom,
            'email'          => $this->email,
            'telephone'      => $this->telephone,
            'genre'          => $this->genre,
            'specialite'     => $this->specialite,
            'numero_ordre'   => $this->numero_ordre,
        ];
    }
}