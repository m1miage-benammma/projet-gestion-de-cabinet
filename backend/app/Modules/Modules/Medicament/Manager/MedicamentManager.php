<?php

declare(strict_types=1);

namespace App\Modules\Medicament\Manager;

use App\Modules\Medicament\Entity\MedicamentEntity;
use App\Modules\Medicament\Repository\MedicamentRepository;

final class MedicamentManager
{
    public function __construct(private MedicamentRepository $repository) {}

    public function create(MedicamentEntity $entity): MedicamentEntity
    {
        return $this->repository->save($entity);
    }

    public function getById(int $id): MedicamentEntity
    {
        return $this->repository->findById($id);
    }

    public function getByOrdonnance(int $idOrdonnance): array
    {
        return $this->repository->findByOrdonnance($idOrdonnance);
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}