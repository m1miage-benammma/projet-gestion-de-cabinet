<?php

declare(strict_types=1);

namespace App\Modules\Medicament\Repository;

use App\Modules\Medicament\Entity\MedicamentEntity;
use App\Modules\Medicament\Exceptions\MedicamentNotFoundException;
use Illuminate\Support\Facades\DB;

final class MedicamentRepository
{
    public function save(MedicamentEntity $entity): MedicamentEntity
    {
        $id = DB::table('medicaments')->insertGetId([
            'id_ordonnance' => $entity->getIdOrdonnance(),
            'nom'           => $entity->getNom(),
            'dosage'        => $entity->getDosage(),
            'duree'         => $entity->getDuree(),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        return $this->findById($id);
    }

    public function findById(int $id): MedicamentEntity
    {
        $m = DB::table('medicaments')->where('id_medicament', $id)->first();

        if (! $m) {
            throw MedicamentNotFoundException::byId($id);
        }

        return $this->hydrate((array) $m);
    }

    public function findByOrdonnance(int $idOrdonnance): array
    {
        return DB::table('medicaments')
            ->where('id_ordonnance', $idOrdonnance)
            ->get()
            ->map(fn ($m) => $this->hydrate((array) $m))
            ->all();
    }

    public function delete(int $id): bool
    {
        return DB::table('medicaments')->where('id_medicament', $id)->delete() > 0;
    }

    private function hydrate(array $data): MedicamentEntity
    {
        return new MedicamentEntity(
            id_medicament: (int) $data['id_medicament'],
            id_ordonnance: (int) $data['id_ordonnance'],
            nom: $data['nom'],
            dosage: $data['dosage'],
            duree: $data['duree'],
        );
    }
}