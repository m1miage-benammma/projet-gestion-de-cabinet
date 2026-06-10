<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

final class RegisterDTO
{
    public function __construct(
        public string  $nom,
        public string  $prenom,
        public string  $email,
        public string  $telephone,
        public string  $genre,
        public string  $mot_de_passe,
        public string  $role            = 'patient',
        public ?string $date_naissance  = null,
        public ?string $groupe_sanguin  = 'ND',
        public ?string $adresse         = null,
        public ?string $allergies       = null,
        public ?string $antecedents     = null,
        public ?string $urgence_nom     = null,
        public ?string $urgence_tel     = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            nom:            $data['nom'],
            prenom:         $data['prenom'],
            email:          $data['email'],
            telephone:      $data['telephone'],
            genre:          $data['genre'],
            mot_de_passe:   $data['mot_de_passe'],
            role:           $data['role']           ?? 'patient',
            date_naissance: $data['date_naissance'] ?? null,
            groupe_sanguin: $data['groupe_sanguin'] ?? 'ND',
            adresse:        $data['adresse']        ?? null,
            allergies:      $data['allergies']      ?? null,
            antecedents:    $data['antecedents']    ?? null,
            urgence_nom:    $data['urgence_nom']    ?? null,
            urgence_tel:    $data['urgence_tel']    ?? null,
        );
    }
}