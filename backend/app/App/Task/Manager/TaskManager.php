<?php

declare(strict_types=1);

namespace App\Modules\Task\Manager;

use App\Modules\Task\Entity\TaskEntity;
use App\Modules\Task\Repository\TaskRepository;

final class TaskManager
{
    public function __construct(private TaskRepository $repository) {}

    public function create(TaskEntity $entity): TaskEntity
    {
        return $this->repository->save($entity);
    }

    public function getById(int $id): TaskEntity
    {
        return $this->repository->findById($id);
    }

    public function getAll(): array
    {
        return $this->repository->findAll();
    }

    public function update(int $id, TaskEntity $entity): TaskEntity
    {
        $existing = $this->repository->findById($id);
        return $this->repository->save($entity);
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}
