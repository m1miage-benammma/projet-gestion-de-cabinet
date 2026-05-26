<?php

declare(strict_types=1);

namespace App\Modules\DossierMedical\Manager;

use App\Modules\DossierMedical\Entity\DossierMedicalEntity;
use App\Modules\DossierMedical\Repository\DossierMedicalRepository;

final class DossierMedicalManager
{
    public function __construct(private DossierMedicalRepository $repository) {}

    public function create(int $idPatient): DossierMedicalEntity
    {
        return $this->repository->create($idPatient);
    }

    public function getById(int $id): DossierMedicalEntity
    {
        return $this->repository->findById($id);
    }

    public function getByPatient(int $idPatient): DossierMedicalEntity
    {
        return $this->repository->findByPatient($idPatient);
    }

    // +consulter() → dossier complet avec consultations
    public function consulter(int $idPatient): array
    {
        return $this->repository->findByPatientWithConsultations($idPatient);
    }
}