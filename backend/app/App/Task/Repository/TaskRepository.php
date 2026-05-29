<?php

declare(strict_types=1);

namespace App\Modules\Task\Repository;

use App\Modules\Task\Entity\TaskEntity;
use App\Modules\Task\Exceptions\TaskNotFoundException;
use Illuminate\Support\Facades\DB;

final class TaskRepository
{
    private const TABLE = 'tasks';

    public function save(TaskEntity $entity): TaskEntity
    {
        $data = $entity->toArray();
        unset($data['id'], $data['created_at'], $data['updated_at']);

        if ($entity->getId() === 0) {
            $id = DB::table(self::TABLE)->insertGetId($data);
            return $this->findById($id);
        }

        DB::table(self::TABLE)
            ->where('id', $entity->getId())
            ->update($data);

        return $this->findById($entity->getId());
    }

    public function findById(int $id): TaskEntity
    {
        $task = DB::table(self::TABLE)->find($id);

        if (!$task) {
            throw TaskNotFoundException::byId($id);
        }

        return $this->hydrate((array) $task);
    }

    public function findAll(): array
    {
        $tasks = DB::table(self::TABLE)->get();
        return $tasks->map(fn($task) => $this->hydrate((array) $task))->all();
    }

    public function delete(int $id): bool
    {
        return DB::table(self::TABLE)->where('id', $id)->delete() > 0;
    }

    private function hydrate(array $data): TaskEntity
    {
        return new TaskEntity(
            id: (int) $data['id'],
            title: $data['title'],
            description: $data['description'],
            status: $data['status'],
            createdAt: new \DateTime($data['created_at']),
            updatedAt: new \DateTime($data['updated_at']),
        );
    }
}
