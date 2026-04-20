<?php

declare(strict_types=1);

namespace App\Modules\Task\Handler;

use App\Modules\Task\Services\TaskService;

final class ListTasksHandler
{
    public function __construct(private TaskService $service) {}

    public function handle(): array
    {
        return $this->service->listTasks();
    }
}
