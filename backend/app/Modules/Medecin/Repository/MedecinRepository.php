<?php

declare(strict_types=1);

namespace App\Modules\Medecin\Repository;

use App\Modules\Medecin\Entity\MedecinEntity;
use App\Modules\Medecin\Exceptions\MedecinNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

final class MedecinRepository
{
    public function save(MedecinEntity $entity, string $motDePasse): MedecinEntity
    {
        $id = DB::table('utilisateurs')->insertGetId([
            'nom'          => $entity->getNom(),
            'prenom'       => $entity->getPrenom(),
            'email'        => $entity->getEmail(),
            'telephone'    => $entity->getTelephone(),
            'genre'        => $entity->getGenre(),
            'mot_de_passe' => Hash::make($motDePasse),
            'role'         => 'medecin',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        DB::table('medecins')->insert([
            'id_utilisateur' => $id,
            'specialite'     => $entity->getSpecialite(),
            'numero_ordre'   => $entity->getNumeroOrdre(),
        ]);

        return $this->findById($id);
    }

    public function findById(int $id): MedecinEntity
    {
        $m = DB::table('utilisateurs')
            ->join('medecins', 'utilisateurs.id_utilisateur', '=', 'medecins.id_utilisateur')
            ->where('utilisateurs.id_utilisateur', $id)
            ->select('utilisateurs.*', 'medecins.specialite', 'medecins.numero_ordre')
            ->first();

        if (! $m) {
            throw MedecinNotFoundException::byId($id);
        }

        return $this->hydrate((array) $m);
    }

    public function findAll(): array
    {
        return DB::table('utilisateurs')
            ->join('medecins', 'utilisateurs.id_utilisateur', '=', 'medecins.id_utilisateur')
            ->select('utilisateurs.*', 'medecins.specialite', 'medecins.numero_ordre')
            ->get()
            ->map(fn ($m) => $this->hydrate((array) $m))
            ->all();
    }

    public function findBySpecialite(string $specialite): array
    {
        return DB::table('utilisateurs')
            ->join('medecins', 'utilisateurs.id_utilisateur', '=', 'medecins.id_utilisateur')
            ->where('medecins.specialite', $specialite)
            ->select('utilisateurs.*', 'medecins.specialite', 'medecins.numero_ordre')
            ->get()
            ->map(fn ($m) => $this->hydrate((array) $m))
            ->all();
    }

    public function delete(int $id): bool
    {
        return DB::table('utilisateurs')->where('id_utilisateur', $id)->delete() > 0;
    }

    private function hydrate(array $data): MedecinEntity
    {
        return new MedecinEntity(
            id_utilisateur: (int) $data['id_utilisateur'],
            nom: $data['nom'],
            prenom: $data['prenom'],
            email: $data['email'],
            telephone: $data['telephone'],
            genre: $data['genre'],
            specialite: $data['specialite'],
            numero_ordre: $data['numero_ordre'],
        );
    }
}