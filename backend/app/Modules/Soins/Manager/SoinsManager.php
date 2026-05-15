<?php

declare(strict_types=1);

namespace App\Modules\Soins\Manager;

use App\Modules\Soins\Entity\SoinsEntity;
use App\Modules\Soins\Repository\SoinsRepository;

final class SoinsManager
{
    public function __construct(private SoinsRepository $repository) {}

    public function create(SoinsEntity $entity): SoinsEntity
    {
        return $this->repository->save($entity);
    }

    public function getById(int $id): SoinsEntity
    {
        return $this->repository->findById($id);
    }

    public function getByPatient(int $idPatient): array
    {
        return $this->repository->findByPatient($idPatient);
    }

    public function getByInfirmiere(int $idInfirmiere): array
    {
        return $this->repository->findByInfirmiere($idInfirmiere);
    }
}