<?php

declare(strict_types=1);

namespace App\Modules\Soins\Services;

use App\Modules\Soins\DTOs\CreateSoinsDTO;
use App\Modules\Soins\DTOs\SoinsOutputDTO;
use App\Modules\Soins\Entity\SoinsEntity;
use App\Modules\Soins\Manager\SoinsManager;

final class SoinsService
{
    public function __construct(private SoinsManager $manager) {}

    // +enregistrer() selon le diagramme → Infirmiere enregistre un soin
    public function enregistrer(CreateSoinsDTO $dto): SoinsOutputDTO
    {
        $entity = new SoinsEntity(
            id_soin: 0,
            id_infirmiere: $dto->id_infirmiere,
            id_patient: $dto->id_patient,
            id_ordonnance: $dto->id_ordonnance,
            type_soin: $dto->type_soin,
            fiche_soin: $dto->fiche_soin,
            date: $dto->date,
            observation: $dto->observation,
        );

        return SoinsOutputDTO::fromEntity($this->manager->create($entity));
    }

    public function getById(int $id): SoinsOutputDTO
    {
        return SoinsOutputDTO::fromEntity($this->manager->getById($id));
    }

    // +consulter() selon le diagramme → liste des soins d'un patient
    public function consulterByPatient(int $idPatient): array
    {
        return array_map(
            fn (SoinsEntity $e) => SoinsOutputDTO::fromEntity($e),
            $this->manager->getByPatient($idPatient)
        );
    }

    public function consulterByInfirmiere(int $idInfirmiere): array
    {
        return array_map(
            fn (SoinsEntity $e) => SoinsOutputDTO::fromEntity($e),
            $this->manager->getByInfirmiere($idInfirmiere)
        );
    }
}