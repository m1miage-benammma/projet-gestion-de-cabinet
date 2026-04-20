<?php

declare(strict_types=1);

namespace App\Modules\Infirmiere\Services;

use App\Modules\Infirmiere\DTOs\CreateInfirmiereDTO;
use App\Modules\Infirmiere\DTOs\InfirmiereOutputDTO;
use App\Modules\Infirmiere\Entity\InfirmiereEntity;
use App\Modules\Infirmiere\Manager\InfirmiereManager;
use Illuminate\Support\Facades\DB;

final class InfirmiereService
{
    public function __construct(private InfirmiereManager $manager) {}

    public function createInfirmiere(CreateInfirmiereDTO $dto): InfirmiereOutputDTO
    {
        $entity = new InfirmiereEntity(
            id_utilisateur: 0,
            nom: $dto->nom,
            prenom: $dto->prenom,
            email: $dto->email,
            telephone: $dto->telephone,
            genre: $dto->genre,
            numero_employe: $dto->numero_employe,
            date_embauche: $dto->date_embauche,
        );

        return InfirmiereOutputDTO::fromEntity(
            $this->manager->create($entity, $dto->mot_de_passe)
        );
    }

    public function getInfirmiere(int $id): InfirmiereOutputDTO
    {
        return InfirmiereOutputDTO::fromEntity($this->manager->getById($id));
    }

    public function listInfirmieres(): array
    {
        return array_map(
            fn (InfirmiereEntity $e) => InfirmiereOutputDTO::fromEntity($e),
            $this->manager->getAll()
        );
    }

    public function deleteInfirmiere(int $id): bool
    {
        return $this->manager->delete($id);
    }

    // +effectuerSoin() selon le diagramme
    // Prépare et enregistre un soin pour un patient
    public function effectuerSoin(
        int     $idInfirmiere,
        int     $idPatient,
        ?int    $idOrdonnance,
        string  $typeSoin,
        string  $ficheSoin,
        string  $date,
        ?string $observation = null,
    ): array {
        // Vérifier que le typeSoin est valide selon TypeSoin Enum
        $typesValides = ['INJECTION', 'PANSEMENT', 'PERFUSION', 'PRISE_DE_SANG', 'SOINS_PLAIE', 'AUTRE'];

        if (! in_array($typeSoin, $typesValides)) {
            throw new \InvalidArgumentException("Type de soin invalide: {$typeSoin}");
        }

        $id = DB::table('soins')->insertGetId([
            'id_infirmiere' => $idInfirmiere,
            'id_patient'    => $idPatient,
            'id_ordonnance' => $idOrdonnance,
            'type_soin'     => $typeSoin,
            'fiche_soin'    => $ficheSoin,
            'date'          => $date,
            'observation'   => $observation,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        return (array) DB::table('soins')->where('id_soin', $id)->first();
    }

    // +enregistrerSoin() selon le diagramme
    // Consulter les soins effectués par une infirmière
    public function getSoinsByInfirmiere(int $idInfirmiere): array
    {
        return DB::table('soins')
            ->where('id_infirmiere', $idInfirmiere)
            ->orderBy('date', 'desc')
            ->get()
            ->toArray();
    }
}