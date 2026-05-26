<?php

declare(strict_types=1);

namespace App\Modules\Ordonnance\Manager;

use App\Modules\Ordonnance\Entity\OrdonnanceEntity;
use App\Modules\Ordonnance\Repository\OrdonnanceRepository;

final class OrdonnanceManager
{
    public function __construct(private OrdonnanceRepository $repository) {}

    public function create(OrdonnanceEntity $entity): OrdonnanceEntity
    {
        return $this->repository->save($entity);
    }

    public function getById(int $id): OrdonnanceEntity
    {
        return $this->repository->findById($id);
    }

    public function getByConsultation(int $idConsultation): ?OrdonnanceEntity
    {
        return $this->repository->findByConsultation($idConsultation);
    }

    public function update(OrdonnanceEntity $entity): OrdonnanceEntity
    {
        return $this->repository->save($entity);
    }
}