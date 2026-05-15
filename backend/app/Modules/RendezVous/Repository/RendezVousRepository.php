<?php

declare(strict_types=1);

namespace App\Modules\RendezVous\Repository;

use App\Modules\RendezVous\Entity\RendezVousEntity;
use App\Modules\RendezVous\Exceptions\RendezVousNotFoundException;
use Illuminate\Support\Facades\DB;

final class RendezVousRepository
{
    public function save(RendezVousEntity $entity): RendezVousEntity
    {
        if ($entity->getIdRdv() === 0) {
            $id = DB::table('rendez_vous')->insertGetId([
                'id_patient'       => $entity->getIdPatient(),
                'id_disponibilite' => $entity->getIdDisponibilite(),
                'date_rdv'         => $entity->getDateRdv(),
                'heure_rdv'        => $entity->getHeureRdv(),
                'motif'            => $entity->getMotif(),
                'statut'           => $entity->getStatut(),
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);
            return $this->findById($id);
        }

        DB::table('rendez_vous')
            ->where('id_rdv', $entity->getIdRdv())
            ->update([
                'date_rdv'   => $entity->getDateRdv(),
                'heure_rdv'  => $entity->getHeureRdv(),
                'motif'      => $entity->getMotif(),
                'statut'     => $entity->getStatut(),
                'updated_at' => now(),
            ]);

        return $this->findById($entity->getIdRdv());
    }

    public function findById(int $id): RendezVousEntity
    {
        $rdv = DB::table('rendez_vous')->where('id_rdv', $id)->first();
        if (! $rdv) throw RendezVousNotFoundException::byId($id);
        return $this->hydrate((array) $rdv);
    }

    public function findAll(): array
    {
        return DB::table('rendez_vous')
            ->orderBy('date_rdv', 'desc')
            ->get()->map(fn ($r) => $this->hydrate((array) $r))->all();
    }

    public function findByPatient(int $idPatient): array
    {
        return DB::table('rendez_vous')
            ->where('id_patient', $idPatient)
            ->orderBy('date_rdv', 'desc')
            ->get()->map(fn ($r) => $this->hydrate((array) $r))->all();
    }

    public function findByMedecin(int $idMedecin): array
    {
        return DB::table('rendez_vous')
            ->join('disponibilites', 'rendez_vous.id_disponibilite', '=', 'disponibilites.id_disponibilite')
            ->where('disponibilites.id_medecin', $idMedecin)
            ->select('rendez_vous.*')
            ->orderBy('rendez_vous.date_rdv', 'desc')
            ->get()->map(fn ($r) => $this->hydrate((array) $r))->all();
    }

    // Chercher_RDV(date) → séquence Infirmière
    public function findByDate(string $date): array
    {
        return DB::table('rendez_vous')
            ->where('date_rdv', $date)
            ->orderBy('heure_rdv', 'asc')
            ->get()->map(fn ($r) => $this->hydrate((array) $r))->all();
    }

    private function hydrate(array $data): RendezVousEntity
    {
        return new RendezVousEntity(
            id_rdv: (int) $data['id_rdv'],
            id_patient: (int) $data['id_patient'],
            id_disponibilite: (int) $data['id_disponibilite'],
            date_rdv: $data['date_rdv'],
            heure_rdv: $data['heure_rdv'],
            motif: $data['motif'],
            statut: $data['statut'],
        );
    }
}