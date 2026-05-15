<?php

declare(strict_types=1);

namespace App\Modules\Task\Exceptions;

use Exception;

final class TaskException extends Exception
{
}

final class TaskNotFoundException extends TaskException
{
    public static function byId(int $id): self
    {
        return new self("Task with ID {$id} not found.");
    }
}

final class TaskValidationException extends TaskException
{
    public static function fromErrors(array $errors): self
    {
        $message = implode(', ', array_map(
            fn($field, $error) => "$field: $error",
            array_keys($errors),
            $errors
        ));
        return new self("Validation failed: $message");
    }
}
