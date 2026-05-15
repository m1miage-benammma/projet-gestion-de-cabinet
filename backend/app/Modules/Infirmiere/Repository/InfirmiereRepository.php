<?php

declare(strict_types=1);

namespace App\Modules\Infirmiere\Repository;

use App\Modules\Infirmiere\Entity\InfirmiereEntity;
use App\Modules\Infirmiere\Exceptions\InfirmiereNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

final class InfirmiereRepository
{
    public function save(InfirmiereEntity $entity, string $motDePasse): InfirmiereEntity
    {
        $id = DB::table('utilisateurs')->insertGetId([
            'nom'          => $entity->getNom(),
            'prenom'       => $entity->getPrenom(),
            'email'        => $entity->getEmail(),
            'telephone'    => $entity->getTelephone(),
            'genre'        => $entity->getGenre(),
            'mot_de_passe' => Hash::make($motDePasse),
            'role'         => 'infirmiere',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        DB::table('infirmieres')->insert([
            'id_utilisateur' => $id,
            'numero_employe' => $entity->getNumeroEmploye(),
            'date_embauche'  => $entity->getDateEmbauche(),
        ]);

        return $this->findById($id);
    }

    public function findById(int $id): InfirmiereEntity
    {
        $i = DB::table('utilisateurs')
            ->join('infirmieres', 'utilisateurs.id_utilisateur', '=', 'infirmieres.id_utilisateur')
            ->where('utilisateurs.id_utilisateur', $id)
            ->select('utilisateurs.*', 'infirmieres.numero_employe', 'infirmieres.date_embauche')
            ->first();

        if (! $i) {
            throw InfirmiereNotFoundException::byId($id);
        }

        return $this->hydrate((array) $i);
    }

    public function findAll(): array
    {
        return DB::table('utilisateurs')
            ->join('infirmieres', 'utilisateurs.id_utilisateur', '=', 'infirmieres.id_utilisateur')
            ->select('utilisateurs.*', 'infirmieres.numero_employe', 'infirmieres.date_embauche')
            ->get()
            ->map(fn ($i) => $this->hydrate((array) $i))
            ->all();
    }

    public function delete(int $id): bool
    {
        return DB::table('utilisateurs')->where('id_utilisateur', $id)->delete() > 0;
    }

    private function hydrate(array $data): InfirmiereEntity
    {
        return new InfirmiereEntity(
            id_utilisateur: (int) $data['id_utilisateur'],
            nom: $data['nom'],
            prenom: $data['prenom'],
            email: $data['email'],
            telephone: $data['telephone'],
            genre: $data['genre'],
            numero_employe: $data['numero_employe'],
            date_embauche: $data['date_embauche'],
        );
    }
}