<?php
declare(strict_types=1);
namespace App\Modules\Utilisateur\Manager;

use App\Modules\Utilisateur\Entity\UtilisateurEntity;
use App\Modules\Utilisateur\Repository\UtilisateurRepository;

final class UtilisateurManager
{
    public function __construct(private UtilisateurRepository $repository) {}

    public function create(UtilisateurEntity $entity): UtilisateurEntity
    {
        return $this->repository->save($entity);
    }

    public function getById(int $id): UtilisateurEntity
    {
        return $this->repository->findById($id);
    }

    public function getAll(): array
    {
        return $this->repository->findAll();
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }
}