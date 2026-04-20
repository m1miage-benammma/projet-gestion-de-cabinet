<?php

declare(strict_types=1);

namespace App\Modules\Medecin\Services;

use App\Modules\Medecin\DTOs\CreateMedecinDTO;
use App\Modules\Medecin\DTOs\MedecinOutputDTO;
use App\Modules\Medecin\Entity\MedecinEntity;
use App\Modules\Medecin\Manager\MedecinManager;

final class MedecinService
{
    public function __construct(private MedecinManager $manager) {}

    // Selon le diagramme :
    // +definitDisponibilite() → module Disponibilite
    // +consulterAgenda()      → module RendezVous
    // +effectuerConsultation()→ module Consultation
    // +redigerOrdonnance()    → module Ordonnance
    // +mettreAJourDossier()   → module DossierMedical

    public function createMedecin(CreateMedecinDTO $dto): MedecinOutputDTO
    {
        $entity = new MedecinEntity(
            id_utilisateur: 0,
            nom: $dto->nom,
            prenom: $dto->prenom,
            email: $dto->email,
            telephone: $dto->telephone,
            genre: $dto->genre,
            specialite: $dto->specialite,
            numero_ordre: $dto->numero_ordre,
        );

        return MedecinOutputDTO::fromEntity(
            $this->manager->create($entity, $dto->mot_de_passe)
        );
    }

    public function getMedecin(int $id): MedecinOutputDTO
    {
        return MedecinOutputDTO::fromEntity($this->manager->getById($id));
    }

    public function listMedecins(): array
    {
        return array_map(
            fn (MedecinEntity $e) => MedecinOutputDTO::fromEntity($e),
            $this->manager->getAll()
        );
    }

    public function listBySpecialite(string $specialite): array
    {
        return array_map(
            fn (MedecinEntity $e) => MedecinOutputDTO::fromEntity($e),
            $this->manager->getBySpecialite($specialite)
        );
    }

    public function deleteMedecin(int $id): bool
    {
        return $this->manager->delete($id);
    }
}