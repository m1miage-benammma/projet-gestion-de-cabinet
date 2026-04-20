<?php

declare(strict_types=1);

namespace App\Modules\Disponibilite\Manager;

use App\Modules\Disponibilite\Entity\DisponibiliteEntity;
use App\Modules\Disponibilite\Repository\DisponibiliteRepository;

final class DisponibiliteManager
{
    public function __construct(private DisponibiliteRepository $repository) {}

    public function create(DisponibiliteEntity $entity): DisponibiliteEntity
    {
        return $this->repository->save($entity);
    }

    public function getById(int $id): DisponibiliteEntity
    {
        return $this->repository->findById($id);
    }

    public function getByMedecin(int $idMedecin): array
    {
        return $this->repository->findByMedecin($idMedecin);
    }

    public function update(DisponibiliteEntity $entity): DisponibiliteEntity
    {
        return $this->repository->save($entity);
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}