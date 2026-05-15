<?php

declare(strict_types=1);

namespace App\Modules\Infirmiere\DTOs;

use App\Modules\Infirmiere\Entity\InfirmiereEntity;

final class InfirmiereOutputDTO
{
    public function __construct(
        public int    $id_utilisateur,
        public string $nom,
        public string $prenom,
        public string $email,
        public string $telephone,
        public string $genre,
        public string $numero_employe,
        public string $date_embauche,
    ) {}

    public static function fromEntity(InfirmiereEntity $entity): self
    {
        return new self(
            id_utilisateur: $entity->getIdUtilisateur(),
            nom: $entity->getNom(),
            prenom: $entity->getPrenom(),
            email: $entity->getEmail(),
            telephone: $entity->getTelephone(),
            genre: $entity->getGenre(),
            numero_employe: $entity->getNumeroEmploye(),
            date_embauche: $entity->getDateEmbauche(),
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
            'numero_employe' => $this->numero_employe,
            'date_embauche'  => $this->date_embauche,
        ];
    }
}