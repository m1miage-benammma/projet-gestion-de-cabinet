<?php

declare(strict_types=1);

namespace App\Modules\Disponibilite\Services;

use App\Modules\Disponibilite\DTOs\CreateDisponibiliteDTO;
use App\Modules\Disponibilite\DTOs\DisponibiliteOutputDTO;
use App\Modules\Disponibilite\Entity\DisponibiliteEntity;
use App\Modules\Disponibilite\Manager\DisponibiliteManager;

final class DisponibiliteService
{
    public function __construct(private DisponibiliteManager $manager) {}

    // Selon le diagramme Medecin :
    // +definitDisponibilite() → ajouter créneau
    // +mettreAJour()          → modifier créneau
    // +supprimer()            → supprimer créneau

    public function definirDisponibilite(CreateDisponibiliteDTO $dto): DisponibiliteOutputDTO
    {
        $entity = new DisponibiliteEntity(
            id_disponibilite: 0,
            id_medecin: $dto->id_medecin,
            jour: $dto->jour,
            heure_debut: $dto->heure_debut,
            heure_fin: $dto->heure_fin,
        );

        return DisponibiliteOutputDTO::fromEntity($this->manager->create($entity));
    }

    public function getByMedecin(int $idMedecin): array
    {
        return array_map(
            fn (DisponibiliteEntity $e) => DisponibiliteOutputDTO::fromEntity($e),
            $this->manager->getByMedecin($idMedecin)
        );
    }

    public function supprimer(int $id): bool
    {
        return $this->manager->delete($id);
    }
}