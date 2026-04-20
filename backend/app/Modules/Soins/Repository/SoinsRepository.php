<?php

declare(strict_types=1);

namespace App\Modules\Soins\Repository;

use App\Modules\Soins\Entity\SoinsEntity;
use App\Modules\Soins\Exceptions\SoinsNotFoundException;
use Illuminate\Support\Facades\DB;

final class SoinsRepository
{
    // +enregistrer() → save
    public function save(SoinsEntity $entity): SoinsEntity
    {
        $id = DB::table('soins')->insertGetId([
            'id_infirmiere' => $entity->getIdInfirmiere(),
            'id_patient'    => $entity->getIdPatient(),
            'id_ordonnance' => $entity->getIdOrdonnance(),
            'type_soin'     => $entity->getTypeSoin(),
            'fiche_soin'    => $entity->getFicheSoin(),
            'date'          => $entity->getDate(),
            'observation'   => $entity->getObservation(),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        return $this->findById($id);
    }

    public function findById(int $id): SoinsEntity
    {
        $s = DB::table('soins')->where('id_soin', $id)->first();

        if (! $s) {
            throw SoinsNotFoundException::byId($id);
        }

        return $this->hydrate((array) $s);
    }

    // +consulter() → liste des soins d'un patient
    public function findByPatient(int $idPatient): array
    {
        return DB::table('soins')
            ->where('id_patient', $idPatient)
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn ($s) => $this->hydrate((array) $s))
            ->all();
    }

    public function findByInfirmiere(int $idInfirmiere): array
    {
        return DB::table('soins')
            ->where('id_infirmiere', $idInfirmiere)
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn ($s) => $this->hydrate((array) $s))
            ->all();
    }

    private function hydrate(array $data): SoinsEntity
    {
        return new SoinsEntity(
            id_soin: (int) $data['id_soin'],
            id_infirmiere: (int) $data['id_infirmiere'],
            id_patient: (int) $data['id_patient'],
            id_ordonnance: isset($data['id_ordonnance']) ? (int) $data['id_ordonnance'] : null,
            type_soin: $data['type_soin'],
            fiche_soin: $data['fiche_soin'],
            date: $data['date'],
            observation: $data['observation'] ?? null,
        );
    }
}