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
    public function __construct(private RendezVousManager $manager) {}

    // +prendreRDV() → Patient prend un RDV
    public function prendreRDV(CreateRendezVousDTO $dto): RendezVousOutputDTO
    {
        $dispo = DB::table('disponibilites')
            ->where('id_disponibilite', $dto->id_disponibilite)
            ->first();

        if (! $dispo) {
            throw new \Exception("Créneau introuvable.");
        }

        $entity = new RendezVousEntity(
            id_rdv: 0,
            id_patient: $dto->id_patient,
            id_disponibilite: $dto->id_disponibilite,
            date_rdv: $dto->date_rdv,
            heure_rdv: $dto->heure_rdv,
            motif: $dto->motif,
            statut: 'EN_ATTENTE',
        );

        $result = $this->manager->create($entity);

        // Notifier le médecin
        $this->notifier(
            idUtilisateur: $dispo->id_medecin,
            message: "Nouveau rendez-vous le {$dto->date_rdv} à {$dto->heure_rdv}.",
            type: 'rdv_nouveau'
        );

        return RendezVousOutputDTO::fromEntity($result);
    }

    public function getById(int $id): RendezVousOutputDTO
    {
        return RendezVousOutputDTO::fromEntity($this->manager->getById($id));
    }

    public function listAll(): array
    {
        return array_map(
            fn (RendezVousEntity $e) => RendezVousOutputDTO::fromEntity($e),
            $this->manager->getAll()
        );
    }

    public function listByPatient(int $idPatient): array
    {
        return array_map(
            fn (RendezVousEntity $e) => RendezVousOutputDTO::fromEntity($e),
            $this->manager->getByPatient($idPatient)
        );
    }

    public function listByMedecin(int $idMedecin): array
    {
        return array_map(
            fn (RendezVousEntity $e) => RendezVousOutputDTO::fromEntity($e),
            $this->manager->getByMedecin($idMedecin)
        );
    }

    // Chercher_RDV(date) → séquence Infirmière Fig 2.12
    public function listByDate(string $date): array
    {
        return array_map(
            fn (RendezVousEntity $e) => RendezVousOutputDTO::fromEntity($e),
            $this->manager->getByDate($date)
        );
    }

    // +confirmer()
    public function confirmer(int $id): RendezVousOutputDTO
    {
        $entity = $this->manager->getById($id);

        if ($entity->getStatut() !== 'EN_ATTENTE') {
            throw StatutInvalideException::make($entity->getStatut());
        }

        $entity->confirmer();
        $result = $this->manager->update($entity);

        $this->notifier(
            idUtilisateur: $entity->getIdPatient(),
            message: "Votre rendez-vous du {$entity->getDateRdv()} a été confirmé.",
            type: 'rdv_confirme'
        );

        return RendezVousOutputDTO::fromEntity($result);
    }

    // +annuler()
    public function annuler(int $id): RendezVousOutputDTO
    {
        $entity = $this->manager->getById($id);

        if (in_array($entity->getStatut(), ['ANNULE', 'TERMINE'])) {
            throw StatutInvalideException::make($entity->getStatut());
        }

        $entity->annuler();
        $result = $this->manager->update($entity);

        $this->notifier(
            idUtilisateur: $entity->getIdPatient(),
            message: "Votre rendez-vous du {$entity->getDateRdv()} a été annulé.",
            type: 'rdv_annule'
        );

        return RendezVousOutputDTO::fromEntity($result);
    }

    // +modifier()
    public function modifier(int $id, string $dateRdv, string $heureRdv, string $motif): RendezVousOutputDTO
    {
        $entity = $this->manager->getById($id);

        if (in_array($entity->getStatut(), ['ANNULE', 'TERMINE'])) {
            throw StatutInvalideException::make($entity->getStatut());
        }

        $entity->modifier($dateRdv, $heureRdv, $motif);
        return RendezVousOutputDTO::fromEntity($this->manager->update($entity));
    }

    // Patient arrivé → séquence Infirmière
    public function patientArrive(int $id): RendezVousOutputDTO
    {
        $entity = $this->manager->getById($id);
        $entity->patientArrive();
        return RendezVousOutputDTO::fromEntity($this->manager->update($entity));
    }

    // Terminer
    public function terminer(int $id): RendezVousOutputDTO
    {
        $entity = $this->manager->getById($id);
        $entity->terminer();
        return RendezVousOutputDTO::fromEntity($this->manager->update($entity));
    }

    private function notifier(int $idUtilisateur, string $message, string $type): void
    {
        DB::table('notifications')->insert([
            'id_utilisateur' => $idUtilisateur,
            'message'        => $message,
            'type'           => $type,
            'lu'             => false,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }
}