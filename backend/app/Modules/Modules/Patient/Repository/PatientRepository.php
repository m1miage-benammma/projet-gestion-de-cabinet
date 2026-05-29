<?php

declare(strict_types=1);

namespace App\Modules\Patient\Repository;

use App\Modules\Patient\Entity\PatientEntity;
use App\Modules\Patient\Exceptions\PatientNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

final class PatientRepository
{
    public function save(PatientEntity $entity, string $motDePasse): PatientEntity
    {
        $id = DB::table('utilisateurs')->insertGetId([
            'nom'          => $entity->getNom(),
            'prenom'       => $entity->getPrenom(),
            'email'        => $entity->getEmail(),
            'telephone'    => $entity->getTelephone(),
            'genre'        => $entity->getGenre(),
            'mot_de_passe' => Hash::make($motDePasse),
            'role'         => 'patient',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        DB::table('patients')->insert([
            'id_utilisateur' => $id,
            'date_naissance' => $entity->getDateNaissance(),
            'adresse'        => $entity->getAdresse(),
            'groupe_sanguin' => $entity->getGroupeSanguin(),
        ]);

        return $this->findById($id);
    }

    public function findById(int $id): PatientEntity
    {
        $p = DB::table('utilisateurs')
            ->join('patients', 'utilisateurs.id_utilisateur', '=', 'patients.id_utilisateur')
            ->where('utilisateurs.id_utilisateur', $id)
            ->select('utilisateurs.*', 'patients.date_naissance', 'patients.adresse', 'patients.groupe_sanguin')
            ->first();

        if (! $p) {
            throw PatientNotFoundException::byId($id);
        }

        return $this->hydrate((array) $p);
    }

    public function findAll(): array
    {
        return DB::table('utilisateurs')
            ->join('patients', 'utilisateurs.id_utilisateur', '=', 'patients.id_utilisateur')
            ->select('utilisateurs.*', 'patients.date_naissance', 'patients.adresse', 'patients.groupe_sanguin')
            ->get()
            ->map(fn ($p) => $this->hydrate((array) $p))
            ->all();
    }

    public function delete(int $id): bool
    {
        return DB::table('utilisateurs')->where('id_utilisateur', $id)->delete() > 0;
    }

    private function hydrate(array $data): PatientEntity
    {
        return new PatientEntity(
            id_utilisateur: (int) $data['id_utilisateur'],
            nom: $data['nom'],
            prenom: $data['prenom'],
            email: $data['email'],
            telephone: $data['telephone'],
            genre: $data['genre'],
            date_naissance: $data['date_naissance'],
            adresse: $data['adresse'],
            groupe_sanguin: $data['groupe_sanguin'],
        );
    }
}