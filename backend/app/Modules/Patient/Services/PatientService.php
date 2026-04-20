<?php

declare(strict_types=1);

namespace App\Modules\Patient\Services;

use App\Modules\Patient\DTOs\CreatePatientDTO;
use App\Modules\Patient\DTOs\PatientOutputDTO;
use App\Modules\Patient\Entity\PatientEntity;
use App\Modules\Patient\Manager\PatientManager;

final class PatientService
{
    public function __construct(private PatientManager $manager) {}

    public function createPatient(CreatePatientDTO $dto): PatientOutputDTO
    {
        $entity = new PatientEntity(
            id_utilisateur: 0,
            nom: $dto->nom,
            prenom: $dto->prenom,
            email: $dto->email,
            telephone: $dto->telephone,
            genre: $dto->genre,
            date_naissance: $dto->date_naissance,
            adresse: $dto->adresse,
            groupe_sanguin: $dto->groupe_sanguin,
        );

        return PatientOutputDTO::fromEntity(
            $this->manager->create($entity, $dto->mot_de_passe)
        );
    }

    public function getPatient(int $id): PatientOutputDTO
    {
        return PatientOutputDTO::fromEntity($this->manager->getById($id));
    }

    public function listPatients(): array
    {
        return array_map(
            fn (PatientEntity $e) => PatientOutputDTO::fromEntity($e),
            $this->manager->getAll()
        );
    }

    public function deletePatient(int $id): bool
    {
        return $this->manager->delete($id);
    }
}