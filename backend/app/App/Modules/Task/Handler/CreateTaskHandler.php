<?php

declare(strict_types=1);

namespace App\Modules\Task\Handler;

use App\Modules\Task\DTOs\CreateTaskDTO;
use App\Modules\Task\DTOs\TaskOutputDTO;
use App\Modules\Task\Services\TaskService;

final class CreateTaskHandler
{
    public function __construct(private TaskService $service) {}

    public function handle(CreateTaskDTO $dto): TaskOutputDTO
    {
        return $this->service->createTask($dto);
    }
}
