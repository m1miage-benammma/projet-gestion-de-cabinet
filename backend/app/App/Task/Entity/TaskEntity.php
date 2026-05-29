<?php

declare(strict_types=1);

namespace App\Modules\Task\Entity;

final class TaskEntity
{
    public function __construct(
        private int $id,
        private string $title,
        private ?string $description,
        private string $status = 'pending',
        private ?\DateTime $createdAt = null,
        private ?\DateTime $updatedAt = null,
    ) {}

    public static function create(
        string $title,
        ?string $description = null,
        string $status = 'pending'
    ): self {
        return new self(
            id: 0,
            title: $title,
            description: $description,
            status: $status,
            createdAt: new \DateTime(),
            updatedAt: new \DateTime()
        );
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function updateStatus(string $status): void
    {
        $this->status = $status;
        $this->updatedAt = new \DateTime();
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'created_at' => $this->createdAt?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updatedAt?->format('Y-m-d H:i:s'),
        ];
    }
}
