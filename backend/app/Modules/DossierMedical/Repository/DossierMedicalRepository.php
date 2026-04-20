<?php

declare(strict_types=1);

namespace App\Modules\DossierMedical\Repository;

use App\Modules\DossierMedical\Entity\DossierMedicalEntity;
use App\Modules\DossierMedical\Exceptions\DossierMedicalNotFoundException;
use Illuminate\Support\Facades\DB;

final class DossierMedicalRepository
{
    // Créer un dossier pour un patient (1 dossier par patient)
    public function create(int $idPatient): DossierMedicalEntity
    {
        $id = DB::table('dossiers_medicaux')->insertGetId([
            'id_patient'    => $idPatient,
            'date_creation' => now()->toDateString(),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        return $this->findById($id);
    }

    public function findById(int $id): DossierMedicalEntity
    {
        $d = DB::table('dossiers_medicaux')->where('id_dossier', $id)->first();

        if (! $d) {
            throw DossierMedicalNotFoundException::byId($id);
        }

        return new DossierMedicalEntity(
            id_dossier: (int) $d->id_dossier,
            id_patient: (int) $d->id_patient,
            date_creation: $d->date_creation,
        );
    }

    // +consulter() selon le diagramme → findByPatient
    public function findByPatient(int $idPatient): DossierMedicalEntity
    {
        $d = DB::table('dossiers_medicaux')
            ->where('id_patient', $idPatient)
            ->first();

        if (! $d) {
            throw DossierMedicalNotFoundException::byPatient($idPatient);
        }

        return new DossierMedicalEntity(
            id_dossier: (int) $d->id_dossier,
            id_patient: (int) $d->id_patient,
            date_creation: $d->date_creation,
        );
    }

    // +consulter() → retourne le dossier avec toutes les consultations
    public function findByPatientWithConsultations(int $idPatient): array
    {
        $dossier = $this->findByPatient($idPatient);

        $consultations = DB::table('consultations')
            ->where('id_dossier', $dossier->getIdDossier())
            ->orderBy('date', 'desc')
            ->get()
            ->toArray();

        return [
            'dossier'       => [
                'id_dossier'    => $dossier->getIdDossier(),
                'id_patient'    => $dossier->getIdPatient(),
                'date_creation' => $dossier->getDateCreation(),
            ],
            'consultations' => $consultations,
        ];
    }
}