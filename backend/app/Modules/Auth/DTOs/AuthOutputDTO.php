<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

final class AuthOutputDTO
{
    public function __construct(
        public int    $id,
        public string $nom,
        public string $prenom,
        public string $email,
        public string $telephone,
        public string $genre,
        public string $role,
        public string $token,
    ) {}

    public function toArray(): array
    {
        return [
            'id'        => $this->id,
            'nom'       => $this->nom,
            'prenom'    => $this->prenom,
            'email'     => $this->email,
            'telephone' => $this->telephone,
            'genre'     => $this->genre,
            'role'      => $this->role,
            'token'     => $this->token,
        ];
    }
}
