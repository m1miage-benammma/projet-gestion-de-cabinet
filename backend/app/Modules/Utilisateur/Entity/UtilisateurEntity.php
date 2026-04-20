<?php

declare(strict_types=1);

namespace App\Modules\Utilisateur\Entity;

abstract class UtilisateurEntity
{
    public function __construct(
        protected int    $id_utilisateur,
        protected string $nom,
        protected string $prenom,
        protected string $email,
        protected string $telephone,
        protected string $genre,
        protected string $role,
    ) {}

    public function getIdUtilisateur(): int { return $this->id_utilisateur; }
    public function getNom(): string        { return $this->nom; }
    public function getPrenom(): string     { return $this->prenom; }
    public function getEmail(): string      { return $this->email; }
    public function getTelephone(): string  { return $this->telephone; }
    public function getGenre(): string      { return $this->genre; }
    public function getRole(): string       { return $this->role; }
}