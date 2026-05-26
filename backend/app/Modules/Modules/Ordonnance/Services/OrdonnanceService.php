<?php

declare(strict_types=1);

namespace App\Modules\Ordonnance\Services;

use App\Modules\Ordonnance\DTOs\CreateOrdonnanceDTO;
use App\Modules\Ordonnance\DTOs\OrdonnanceOutputDTO;
use App\Modules\Ordonnance\Entity\OrdonnanceEntity;
use App\Modules\Ordonnance\Manager\OrdonnanceManager;

final class OrdonnanceService
{
    public function __construct(private OrdonnanceManager $manager) {}

    // +generer() selon le diagramme → Medecin génère une ordonnance
    public function generer(CreateOrdonnanceDTO $dto): OrdonnanceOutputDTO
    {
        $entity = new OrdonnanceEntity(
            id_ordonnance: 0,
            id_consultation: $dto->id_consultation,
            date_emission: $dto->date_emission,
            instructions: $dto->instructions,
        );

        return OrdonnanceOutputDTO::fromEntity($this->manager->create($entity));
    }

    public function getById(int $id): OrdonnanceOutputDTO
    {
        return OrdonnanceOutputDTO::fromEntity($this->manager->getById($id));
    }

    public function getByConsultation(int $idConsultation): ?OrdonnanceOutputDTO
    {
        $entity = $this->manager->getByConsultation($idConsultation);

        return $entity ? OrdonnanceOutputDTO::fromEntity($entity) : null;
    }

    // +modifier() selon le diagramme
    public function modifier(int $id, string $dateEmission, ?string $instructions): OrdonnanceOutputDTO
    {
        $entity = $this->manager->getById($id);
        $entity->modifier($dateEmission, $instructions);

        return OrdonnanceOutputDTO::fromEntity($this->manager->update($entity));
    }
}