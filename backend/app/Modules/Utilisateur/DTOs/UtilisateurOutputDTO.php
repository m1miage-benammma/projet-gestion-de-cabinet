<?php

declare(strict_types=1);

namespace App\Modules\Utilisateur\DTOs;

final class UtilisateurOutputDTO
{
    public function __construct(
        public int    $id_utilisateur,
        public string $nom,
        public string $prenom,
        public string $email,
        public string $telephone,
        public string $genre,
        public string $role,
    ) {}

    public function toArray(): array
    {
        return [
            'id_utilisateur' => $this->id_utilisateur,
            'nom'            => $this->nom,
            'prenom'         => $this->prenom,
            'email'          => $this->email,
            'telephone'      => $this->telephone,
            'genre'          => $this->genre,
            'role'           => $this->role,
        ];
    }
}