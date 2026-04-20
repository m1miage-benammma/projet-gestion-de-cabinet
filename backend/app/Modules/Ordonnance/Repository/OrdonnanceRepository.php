<?php

declare(strict_types=1);

namespace App\Modules\Ordonnance\Repository;

use App\Modules\Ordonnance\Entity\OrdonnanceEntity;
use App\Modules\Ordonnance\Exceptions\OrdonnanceNotFoundException;
use Illuminate\Support\Facades\DB;

final class OrdonnanceRepository
{
    // +generer() → créer une ordonnance
    public function save(OrdonnanceEntity $entity): OrdonnanceEntity
    {
        if ($entity->getIdOrdonnance() === 0) {
            $id = DB::table('ordonnances')->insertGetId([
                'id_consultation' => $entity->getIdConsultation(),
                'date_emission'   => $entity->getDateEmission(),
                'instructions'    => $entity->getInstructions(),
                'created_at'      => now(),
                'updated_at'      => now(),
            ]);

            return $this->findById($id);
        }

        // +modifier() → mettre à jour
        DB::table('ordonnances')
            ->where('id_ordonnance', $entity->getIdOrdonnance())
            ->update([
                'date_emission' => $entity->getDateEmission(),
                'instructions'  => $entity->getInstructions(),
                'updated_at'    => now(),
            ]);

        return $this->findById($entity->getIdOrdonnance());
    }

    public function findById(int $id): OrdonnanceEntity
    {
        $o = DB::table('ordonnances')->where('id_ordonnance', $id)->first();

        if (! $o) {
            throw OrdonnanceNotFoundException::byId($id);
        }

        return $this->hydrate((array) $o);
    }

    public function findByConsultation(int $idConsultation): ?OrdonnanceEntity
    {
        $o = DB::table('ordonnances')
            ->where('id_consultation', $idConsultation)
            ->first();

        return $o ? $this->hydrate((array) $o) : null;
    }

    private function hydrate(array $data): OrdonnanceEntity
    {
        return new OrdonnanceEntity(
            id_ordonnance: (int) $data['id_ordonnance'],
            id_consultation: (int) $data['id_consultation'],
            date_emission: $data['date_emission'],
            instructions: $data['instructions'] ?? null,
        );
    }
}