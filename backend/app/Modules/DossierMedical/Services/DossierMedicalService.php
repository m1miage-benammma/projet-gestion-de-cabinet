<?php

declare(strict_types=1);

namespace App\Modules\DossierMedical\Services;

use App\Modules\DossierMedical\DTOs\DossierMedicalOutputDTO;
use App\Modules\DossierMedical\Manager\DossierMedicalManager;

final class DossierMedicalService
{
    public function __construct(private DossierMedicalManager $manager) {}

    // Créer un dossier pour un patient
    // Appelé automatiquement quand l'infirmière enregistre un patient
    public function creerDossier(int $idPatient): DossierMedicalOutputDTO
    {
        return DossierMedicalOutputDTO::fromEntity(
            $this->manager->create($idPatient)
        );
    }

    public function getDossierById(int $id): DossierMedicalOutputDTO
    {
        return DossierMedicalOutputDTO::fromEntity(
            $this->manager->getById($id)
        );
    }

    public function getDossierByPatient(int $idPatient): DossierMedicalOutputDTO
    {
        return DossierMedicalOutputDTO::fromEntity(
            $this->manager->getByPatient($idPatient)
        );
    }

    // +consulter() selon le diagramme → dossier complet avec consultations
    public function consulter(int $idPatient): array
    {
        return $this->manager->consulter($idPatient);
    }
}