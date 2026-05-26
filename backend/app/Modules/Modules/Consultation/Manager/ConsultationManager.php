<?php

declare(strict_types=1);

namespace App\Modules\Consultation\Manager;

use App\Modules\Consultation\Entity\ConsultationEntity;
use App\Modules\Consultation\Repository\ConsultationRepository;

final class ConsultationManager
{
    public function __construct(private ConsultationRepository $repository) {}

    public function create(ConsultationEntity $entity): ConsultationEntity
    {
        return $this->repository->save($entity);
    }

    public function getById(int $id): ConsultationEntity
    {
        return $this->repository->findById($id);
    }

    public function getByDossier(int $idDossier): array
    {
        return $this->repository->findByDossier($idDossier);
    }
}