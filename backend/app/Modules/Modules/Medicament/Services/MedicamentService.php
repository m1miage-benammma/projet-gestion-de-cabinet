<?php

declare(strict_types=1);

namespace App\Modules\Medicament\Services;

use App\Modules\Medicament\DTOs\CreateMedicamentDTO;
use App\Modules\Medicament\DTOs\MedicamentOutputDTO;
use App\Modules\Medicament\Entity\MedicamentEntity;
use App\Modules\Medicament\Manager\MedicamentManager;

final class MedicamentService
{
    public function __construct(private MedicamentManager $manager) {}

    public function create(CreateMedicamentDTO $dto): MedicamentOutputDTO
    {
        $entity = new MedicamentEntity(
            id_medicament: 0,
            id_ordonnance: $dto->id_ordonnance,
            nom: $dto->nom,
            dosage: $dto->dosage,
            duree: $dto->duree,
        );

        return MedicamentOutputDTO::fromEntity($this->manager->create($entity));
    }

    public function getById(int $id): MedicamentOutputDTO
    {
        return MedicamentOutputDTO::fromEntity($this->manager->getById($id));
    }

    public function getByOrdonnance(int $idOrdonnance): array
    {
        return array_map(
            fn (MedicamentEntity $e) => MedicamentOutputDTO::fromEntity($e),
            $this->manager->getByOrdonnance($idOrdonnance)
        );
    }

    public function delete(int $id): bool
    {
        return $this->manager->delete($id);
    }
}