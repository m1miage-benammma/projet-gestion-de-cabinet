<?php

declare(strict_types=1);

namespace App\Modules\Consultation\Services;

use App\Modules\Consultation\DTOs\ConsultationOutputDTO;
use App\Modules\Consultation\DTOs\CreateConsultationDTO;
use App\Modules\Consultation\Entity\ConsultationEntity;
use App\Modules\Consultation\Manager\ConsultationManager;

final class ConsultationService
{
    public function __construct(private ConsultationManager $manager) {}

    // +creer() selon le diagramme → Medecin effectue une consultation
    public function creer(CreateConsultationDTO $dto): ConsultationOutputDTO
    {
        $entity = new ConsultationEntity(
            id_consultation: 0,
            id_dossier: $dto->id_dossier,
            id_medecin: $dto->id_medecin,
            date: $dto->date,
            diagnostic: $dto->diagnostic,
            traitement: $dto->traitement,
            note: $dto->note,
        );

        return ConsultationOutputDTO::fromEntity($this->manager->create($entity));
    }

    public function getById(int $id): ConsultationOutputDTO
    {
        return ConsultationOutputDTO::fromEntity($this->manager->getById($id));
    }

    // Consulter toutes les consultations d'un dossier
    public function getByDossier(int $idDossier): array
    {
        return array_map(
            fn (ConsultationEntity $e) => ConsultationOutputDTO::fromEntity($e),
            $this->manager->getByDossier($idDossier)
        );
    }

    // +genererOrdonnance() → géré par module Ordonnance
    // La consultation retourne son id pour créer une ordonnance liée
}