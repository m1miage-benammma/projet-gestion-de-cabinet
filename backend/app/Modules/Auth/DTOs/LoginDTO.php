<?php

declare(strict_types=1);

namespace App\Modules\Auth\DTOs;

final class LoginDTO
{
    public function __construct(
        public string $email,
        public string $mot_de_passe,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            email: $data['email'],
            mot_de_passe: $data['mot_de_passe'],
        );
    }
}