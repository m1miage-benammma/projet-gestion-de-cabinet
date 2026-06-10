<?php

declare(strict_types=1);

namespace App\Modules\RendezVous\Services;

use App\Modules\RendezVous\DTOs\CreateRendezVousDTO;
use App\Modules\RendezVous\DTOs\RendezVousOutputDTO;
use App\Modules\RendezVous\Entity\RendezVousEntity;
use App\Modules\RendezVous\Exceptions\StatutInvalideException;
use App\Modules\RendezVous\Manager\RendezVousManager;
use Illuminate\Support\Facades\DB;

final class RendezVousService
{
    public function __construct(
        private RendezVousManager $manager
    ) {}

    public function prendreRDV(CreateRendezVousDTO $dto): RendezVousOutputDTO
    {
        $dispo = DB::table('disponibilites')
            ->where('id_disponibilite', $dto->id_disponibilite)
            ->first();

        if (!$dispo) {
            throw new \Exception("Créneau introuvable.");
        }

        // Vérifier si ce créneau est déjà réservé pour cette date ET heure précises
        $existe = DB::table('rendez_vous')
            ->where('id_disponibilite', $dto->id_disponibilite)
            ->where('date_rdv', $dto->date_rdv)
            ->where('heure_rdv', $dto->heure_rdv)
            ->whereNotIn('statut', ['annule'])
            ->exists();

        if ($existe) {
            throw new \Exception("Ce créneau est déjà réservé.");
        }

        $entity = new RendezVousEntity(
            id_rdv: 0,
            id_patient: $dto->id_patient,
            id_disponibilite: $dto->id_disponibilite,
            date_rdv: $dto->date_rdv,
            heure_rdv: $dto->heure_rdv,
            motif: $dto->motif,
            statut: 'en_attente',
        );

        $result = $this->manager->create($entity);

        // Notification infirmière
        $infirmieres = DB::table('utilisateurs')
            ->whereIn('role', ['infirmiere', 'infirmier'])
            ->get();

        foreach ($infirmieres as $inf) {
            $this->notifier(
                idUtilisateur: $inf->id_utilisateur,
                message: "Nouveau rendez-vous en attente de validation.",
                type: 'rdv_nouveau'
            );
        }

        return RendezVousOutputDTO::fromEntity($result);
    }

    public function confirmer(int $id): RendezVousOutputDTO
    {
        $entity = $this->manager->getById($id);

        if ($entity->getStatut() !== 'en_attente') {
            throw StatutInvalideException::make($entity->getStatut());
        }

        $entity->confirmer();

        $result = $this->manager->update($entity);

        // disponibilité médecin
        $dispo = DB::table('disponibilites')
            ->where('id_disponibilite', $entity->getIdDisponibilite())
            ->first();

        // notification patient
        $this->notifier(
            idUtilisateur: $entity->getIdPatient(),
            message: "Votre rendez-vous du {$entity->getDateRdv()} à {$entity->getHeureRdv()} a été confirmé.",
            type: 'rdv_confirme'
        );

        // notification médecin
        if ($dispo) {
            $this->notifier(
                idUtilisateur: $dispo->id_medecin,
                message: "Un rendez-vous a été confirmé pour le {$entity->getDateRdv()} à {$entity->getHeureRdv()}.",
                type: 'rdv_confirme_medecin'
            );
        }

        return RendezVousOutputDTO::fromEntity($result);
    }

    public function annuler(int $id): RendezVousOutputDTO
    {
        $entity = $this->manager->getById($id);

        if ($entity->getStatut() === 'annule') {
            throw StatutInvalideException::make($entity->getStatut());
        }

        $entity->annuler();

        $result = $this->manager->update($entity);

        // notification patient
        $this->notifier(
            idUtilisateur: $entity->getIdPatient(),
            message: "Votre rendez-vous du {$entity->getDateRdv()} à {$entity->getHeureRdv()} a été annulé.",
            type: 'rdv_annule'
        );

        return RendezVousOutputDTO::fromEntity($result);
    }

    public function modifier(int $id, string $dateRdv, string $heureRdv, string $motif): RendezVousOutputDTO
    {
        $entity = $this->manager->getById($id);
        $entity->modifier($dateRdv, $heureRdv, $motif);
        $result = $this->manager->update($entity);
        return RendezVousOutputDTO::fromEntity($result);
    }

    public function patientArrive(int $id): RendezVousOutputDTO
    {
        $entity = $this->manager->getById($id);
        $entity->patientArrive();
        $result = $this->manager->update($entity);
        return RendezVousOutputDTO::fromEntity($result);
    }

    public function terminer(int $id): RendezVousOutputDTO
    {
        $entity = $this->manager->getById($id);
        $entity->terminer();
        $result = $this->manager->update($entity);
        return RendezVousOutputDTO::fromEntity($result);
    }

    private function notifier(
        int $idUtilisateur,
        string $message,
        string $type
    ): void {
        DB::table('notifications')->insert([
            'id_utilisateur' => $idUtilisateur,
            'message' => $message,
            'type' => $type,
            'lu' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}