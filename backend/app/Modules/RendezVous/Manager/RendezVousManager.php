<?php

declare(strict_types=1);

namespace App\Modules\RendezVous\Manager;

use App\Modules\RendezVous\Entity\RendezVousEntity;
use App\Modules\RendezVous\Repository\RendezVousRepository;

final class RendezVousManager
{
    public function __construct(private RendezVousRepository $repository) {}

    public function create(RendezVousEntity $entity): RendezVousEntity
    {
        return $this->repository->save($entity);
    }

    public function getById(int $id): RendezVousEntity
    {
        return $this->repository->findById($id);
    }

    public function getAll(): array
    {
        return $this->repository->findAll();
    }

    public function getByPatient(int $idPatient): array
    {
        return $this->repository->findByPatient($idPatient);
    }

    public function getByMedecin(int $idMedecin): array
    {
        return $this->repository->findByMedecin($idMedecin);
    }

    public function getByDate(string $date): array
    {
        return $this->repository->findByDate($date);
    }

    public function update(RendezVousEntity $entity): RendezVousEntity
    {
        return $this->repository->save($entity);
    }
}