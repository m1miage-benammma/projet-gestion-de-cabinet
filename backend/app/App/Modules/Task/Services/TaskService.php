<?php

declare(strict_types=1);

namespace App\Modules\Task\Services;

use App\Modules\Task\DTOs\CreateTaskDTO;
use App\Modules\Task\DTOs\TaskOutputDTO;
use App\Modules\Task\Entity\TaskEntity;
use App\Modules\Task\Manager\TaskManager;

final class TaskService
{
    public function __construct(private TaskManager $manager) {}

    public function createTask(CreateTaskDTO $dto): TaskOutputDTO
    {
        $entity = TaskEntity::create(
            title: $dto->title,
            description: $dto->description,
            status: $dto->status
        );

        $saved = $this->manager->create($entity);
        return TaskOutputDTO::fromEntity($saved);
    }

    public function getTask(int $id): TaskOutputDTO
    {
        $entity = $this->manager->getById($id);
        return TaskOutputDTO::fromEntity($entity);
    }

    public function listTasks(): array
    {
        $entities = $this->manager->getAll();
        return array_map(
            fn(TaskEntity $entity) => TaskOutputDTO::fromEntity($entity),
            $entities
        );
    }

    public function updateTask(int $id, CreateTaskDTO $dto): TaskOutputDTO
    {
        $existing = $this->manager->getById($id);
        $entity = new TaskEntity(
            id: $existing->getId(),
            title: $dto->title,
            description: $dto->description,
            status: $dto->status,
            createdAt: $existing->getCreatedAt(),
            updatedAt: new \DateTime(),
        );

        $saved = $this->manager->update($id, $entity);
        return TaskOutputDTO::fromEntity($saved);
    }

    public function deleteTask(int $id): bool
    {
        return $this->manager->delete($id);
    }
}
