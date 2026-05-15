<?php

declare(strict_types=1);

namespace App\Modules\Patient\DTOs;

use App\Modules\Patient\Entity\PatientEntity;

final class PatientOutputDTO
{
    public function __construct(
        public int    $id_utilisateur,
        public string $nom,
        public string $prenom,
        public string $email,
        public string $telephone,
        public string $genre,
        public string $date_naissance,
        public string $adresse,
        public string $groupe_sanguin,
    ) {}

    public static function fromEntity(PatientEntity $entity): self
    {
        return new self(
            id_utilisateur: $entity->getIdUtilisateur(),
            nom: $entity->getNom(),
            prenom: $entity->getPrenom(),
            email: $entity->getEmail(),
            telephone: $entity->getTelephone(),
            genre: $entity->getGenre(),
            date_naissance: $entity->getDateNaissance(),
            adresse: $entity->getAdresse(),
            groupe_sanguin: $entity->getGroupeSanguin(),
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
            'date_naissance' => $this->date_naissance,
            'adresse'        => $this->adresse,
            'groupe_sanguin' => $this->groupe_sanguin,
        ];
    }
}
