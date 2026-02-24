<?php

declare(strict_types=1);

use App\Modules\Task\Controller\TaskController;
use Illuminate\Support\Facades\Route;

Route::apiResource('tasks', TaskController::class);
