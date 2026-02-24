<?php

declare(strict_types=1);

namespace App\Modules\Task\DTOs;

final class CreateTaskDTO
{
    public function __construct(
        public string $title,
        public ?string $description = null,
        public string $status = 'pending',
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            title: $data['title'],
            description: $data['description'] ?? null,
            status: $data['status'] ?? 'pending',
        );
    }

    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
        ];
    }
}
