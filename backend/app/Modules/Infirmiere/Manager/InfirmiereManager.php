<?php

declare(strict_types=1);

namespace App\Modules\Infirmiere\Manager;

use App\Modules\Infirmiere\Entity\InfirmiereEntity;
use App\Modules\Infirmiere\Repository\InfirmiereRepository;

final class InfirmiereManager
{
    public function __construct(private InfirmiereRepository $repository) {}

    public function create(InfirmiereEntity $entity, string $motDePasse): InfirmiereEntity
    {
        return $this->repository->save($entity, $motDePasse);
    }

    public function getById(int $id): InfirmiereEntity
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