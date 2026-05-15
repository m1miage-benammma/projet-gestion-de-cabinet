<?php

declare(strict_types=1);

namespace App\Modules\Medecin\Manager;

use App\Modules\Medecin\Entity\MedecinEntity;
use App\Modules\Medecin\Repository\MedecinRepository;

final class MedecinManager
{
    public function __construct(private MedecinRepository $repository) {}

    public function create(MedecinEntity $entity, string $motDePasse): MedecinEntity
    {
        return $this->repository->save($entity, $motDePasse);
    }

    public function getById(int $id): MedecinEntity
    {
        return $this->repository->findById($id);
    }

    public function getAll(): array
    {
        return $this->repository->findAll();
    }

    public function getBySpecialite(string $specialite): array
    {
        return $this->repository->findBySpecialite($specialite);
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}