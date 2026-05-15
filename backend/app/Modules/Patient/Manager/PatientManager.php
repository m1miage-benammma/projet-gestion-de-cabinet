<?php

declare(strict_types=1);

namespace App\Modules\Patient\Manager;

use App\Modules\Patient\Entity\PatientEntity;
use App\Modules\Patient\Repository\PatientRepository;

final class PatientManager
{
    public function __construct(private PatientRepository $repository) {}

    public function create(PatientEntity $entity, string $motDePasse): PatientEntity
    {
        return $this->repository->save($entity, $motDePasse);
    }

    public function getById(int $id): PatientEntity
    {
        return $this->repository->findById($id);
    }

    public function getAll(): array
    {
        return $this->repository->findAll();
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}