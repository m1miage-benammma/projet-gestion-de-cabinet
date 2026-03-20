<?php
declare(strict_types=1);
namespace App\Modules\Utilisateur\Repository;

use App\Modules\Utilisateur\Entity\UtilisateurEntity;
use App\Modules\Utilisateur\Exceptions\UtilisateurNotFoundException;
use Illuminate\Support\Facades\DB;

final class UtilisateurRepository
{
    private const TABLE = 'utilisateurs';

    public function save(UtilisateurEntity $entity): UtilisateurEntity
    {
        $data = $entity->toArray();
        unset($data['id'], $data['created_at'], $data['updated_at']);

        if ($entity->getId() === 0) {
            $id = DB::table(self::TABLE)->insertGetId($data);
            return $this->findById($id);
        }

        DB::table(self::TABLE)->where('id', $entity->getId())->update($data);
        return $this->findById($entity->getId());
    }

    public function findById(int $id): UtilisateurEntity
    {
        $row = DB::table(self::TABLE)->find($id);
        if (!$row) throw UtilisateurNotFoundException::byId($id);
        return $this->hydrate((array) $row);
    }

    public function findAll(): array
    {
        return DB::table(self::TABLE)->get()
            ->map(fn($row) => $this->hydrate((array) $row))->all();
    }

    public function delete(int $id): bool
    {
        return DB::table(self::TABLE)->where('id', $id)->delete() > 0;
    }

    private function hydrate(array $data): UtilisateurEntity
    {
        return new UtilisateurEntity(
            id: (int) $data['id'],
            nom: $data['nom'],
            prenom: $data['prenom'],
            email: $data['email'],
            telephone: $data['telephone'],
            sexe: $data['sexe'],
            motDePasse: $data['mot_de_passe'],
            type: $data['type'],
            createdAt: new \DateTime($data['created_at']),
            updatedAt: new \DateTime($data['updated_at']),
        );
    }
}