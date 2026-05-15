<?php

declare(strict_types=1);

namespace App\Modules\Task\DTOs;

use App\Modules\Task\Entity\TaskEntity;

final class TaskOutputDTO
{
    public function __construct(
        public int $id,
        public string $title,
        public ?string $description,
        public string $status,
        public string $createdAt,
        public string $updatedAt,
    ) {}

    public static function fromEntity(TaskEntity $entity): self
    {
        return new self(
            id: $entity->getId(),
            title: $entity->getTitle(),
            description: $entity->getDescription(),
            status: $entity->getStatus(),
            createdAt: $entity->getCreatedAt()?->format('Y-m-d H:i:s') ?? '',
            updatedAt: $entity->getUpdatedAt()?->format('Y-m-d H:i:s') ?? '',
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}
