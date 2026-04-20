<?php

declare(strict_types=1);

namespace App\Modules\Disponibilite\Repository;

use App\Modules\Disponibilite\Entity\DisponibiliteEntity;
use App\Modules\Disponibilite\Exceptions\DisponibiliteNotFoundException;
use Illuminate\Support\Facades\DB;

final class DisponibiliteRepository
{
    public function save(DisponibiliteEntity $entity): DisponibiliteEntity
    {
        if ($entity->getIdDisponibilite() === 0) {
            $id = DB::table('disponibilites')->insertGetId([
                'id_medecin'  => $entity->getIdMedecin(),
                'jour'        => $entity->getJour(),
                'heure_debut' => $entity->getHeureDebut(),
                'heure_fin'   => $entity->getHeureFin(),
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);

            return $this->findById($id);
        }

        DB::table('disponibilites')
            ->where('id_disponibilite', $entity->getIdDisponibilite())
            ->update([
                'jour'        => $entity->getJour(),
                'heure_debut' => $entity->getHeureDebut(),
                'heure_fin'   => $entity->getHeureFin(),
                'updated_at'  => now(),
            ]);

        return $this->findById($entity->getIdDisponibilite());
    }

    public function findById(int $id): DisponibiliteEntity
    {
        $d = DB::table('disponibilites')->where('id_disponibilite', $id)->first();

        if (! $d) {
            throw DisponibiliteNotFoundException::byId($id);
        }

        return $this->hydrate((array) $d);
    }

    public function findByMedecin(int $idMedecin): array
    {
        return DB::table('disponibilites')
            ->where('id_medecin', $idMedecin)
            ->orderBy('jour')
            ->get()
            ->map(fn ($d) => $this->hydrate((array) $d))
            ->all();
    }

    public function delete(int $id): bool
    {
        return DB::table('disponibilites')->where('id_disponibilite', $id)->delete() > 0;
    }

    private function hydrate(array $data): DisponibiliteEntity
    {
        return new DisponibiliteEntity(
            id_disponibilite: (int) $data['id_disponibilite'],
            id_medecin: (int) $data['id_medecin'],
            jour: $data['jour'],
            heure_debut: $data['heure_debut'],
            heure_fin: $data['heure_fin'],
        );
    }
}