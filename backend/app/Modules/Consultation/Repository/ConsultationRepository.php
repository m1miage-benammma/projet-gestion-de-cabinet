<?php

declare(strict_types=1);

namespace App\Modules\Consultation\Repository;

use App\Modules\Consultation\Entity\ConsultationEntity;
use App\Modules\Consultation\Exceptions\ConsultationNotFoundException;
use Illuminate\Support\Facades\DB;

final class ConsultationRepository
{
    public function save(ConsultationEntity $entity): ConsultationEntity
    {
        $id = DB::table('consultations')->insertGetId([
            'id_dossier'  => $entity->getIdDossier(),
            'id_medecin'  => $entity->getIdMedecin(),
            'date'        => $entity->getDate(),
            'diagnostic'  => $entity->getDiagnostic(),
            'traitement'  => $entity->getTraitement(),
            'note'        => $entity->getNote(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        return $this->findById($id);
    }

    public function findById(int $id): ConsultationEntity
    {
        $c = DB::table('consultations')->where('id_consultation', $id)->first();

        if (! $c) {
            throw ConsultationNotFoundException::byId($id);
        }

        return $this->hydrate((array) $c);
    }

    // +consulter() → toutes les consultations d'un dossier
    public function findByDossier(int $idDossier): array
    {
        return DB::table('consultations')
            ->where('id_dossier', $idDossier)
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn ($c) => $this->hydrate((array) $c))
            ->all();
    }

    private function hydrate(array $data): ConsultationEntity
    {
        return new ConsultationEntity(
            id_consultation: (int) $data['id_consultation'],
            id_dossier: (int) $data['id_dossier'],
            id_medecin: (int) $data['id_medecin'],
            date: $data['date'],
            diagnostic: $data['diagnostic'],
            traitement: $data['traitement'],
            note: $data['note'] ?? null,
        );
    }
}