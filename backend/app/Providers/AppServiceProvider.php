<?php

declare(strict_types=1);

namespace App\Providers;

use App\Modules\Task\Handler\CreateTaskHandler;
use App\Modules\Task\Handler\ListTasksHandler;
use App\Modules\Task\Manager\TaskManager;
use App\Modules\Task\Repository\TaskRepository;
use App\Modules\Task\Services\TaskService;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->registerTaskModule();
    }

    public function boot(): void
    {
    }

    private function registerTaskModule(): void
    {
        $this->app->singleton(TaskRepository::class);
        $this->app->singleton(TaskManager::class, function ($app) {
            return new TaskManager($app->make(TaskRepository::class));
        });
        $this->app->singleton(TaskService::class, function ($app) {
            return new TaskService($app->make(TaskManager::class));
        });
        $this->app->singleton(CreateTaskHandler::class, function ($app) {
            return new CreateTaskHandler($app->make(TaskService::class));
        });
        $this->app->singleton(ListTasksHandler::class, function ($app) {
            return new ListTasksHandler($app->make(TaskService::class));
        });
    }
}
