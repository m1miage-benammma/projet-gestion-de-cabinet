<?php

declare(strict_types=1);

namespace App\Modules\Task\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Task\DTOs\CreateTaskDTO;
use App\Modules\Task\Handler\CreateTaskHandler;
use App\Modules\Task\Handler\ListTasksHandler;
use App\Modules\Task\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class TaskController extends Controller
{
    public function __construct(
        private CreateTaskHandler $createHandler,
        private ListTasksHandler $listHandler,
        private TaskService $service,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|min:3|max:255',
            'description' => 'nullable|string|max:1000',
            'status' => 'nullable|in:pending,in_progress,completed',
        ]);

        $dto = CreateTaskDTO::fromArray($validated);
        $result = $this->createHandler->handle($dto);

        return response()->json($result->toArray(), 201);
    }

    public function index(): JsonResponse
    {
        $tasks = $this->listHandler->handle();
        return response()->json(array_map(fn($task) => $task->toArray(), $tasks));
    }

    public function show(int $id): JsonResponse
    {
        $task = $this->service->getTask($id);
        return response()->json($task->toArray());
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|min:3|max:255',
            'description' => 'nullable|string|max:1000',
            'status' => 'nullable|in:pending,in_progress,completed',
        ]);

        $dto = CreateTaskDTO::fromArray($validated);
        $result = $this->service->updateTask($id, $dto);

        return response()->json($result->toArray());
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->deleteTask($id);
        return response()->json(null, 204);
    }
}
