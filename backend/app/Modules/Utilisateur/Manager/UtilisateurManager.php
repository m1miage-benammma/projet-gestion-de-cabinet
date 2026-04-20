<?php

declare(strict_types=1);

namespace App\Modules\Utilisateur\Manager;

use App\Modules\Utilisateur\DTOs\UpdateProfilDTO;
use App\Modules\Utilisateur\DTOs\UtilisateurOutputDTO;
use App\Modules\Utilisateur\Repository\UtilisateurRepository;

final class UtilisateurManager
{
    public function __construct(private UtilisateurRepository $repository) {}

    public function getProfil(int $id): UtilisateurOutputDTO
    {
        return $this->repository->findById($id);
    }

    public function modifierProfil(int $id, UpdateProfilDTO $dto): UtilisateurOutputDTO
    {
        return $this->repository->updateProfil($id, $dto);
    }

    public function modifierMotDePasse(int $id, string $nouveauMotDePasse): void
    {
        $this->repository->updateMotDePasse($id, $nouveauMotDePasse);
    }
}