<?php

declare(strict_types=1);

namespace App\Modules\Utilisateur\Repository;

use App\Modules\Utilisateur\DTOs\UpdateProfilDTO;
use App\Modules\Utilisateur\DTOs\UtilisateurOutputDTO;
use App\Modules\Utilisateur\Exceptions\UtilisateurNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

final class UtilisateurRepository
{
    public function findById(int $id): UtilisateurOutputDTO
    {
        $user = DB::table('utilisateurs')
            ->where('id_utilisateur', $id)
            ->first();

        if (! $user) {
            throw UtilisateurNotFoundException::byId($id);
        }

        return new UtilisateurOutputDTO(
            id_utilisateur: (int) $user->id_utilisateur,
            nom: $user->nom,
            prenom: $user->prenom,
            email: $user->email,
            telephone: $user->telephone,
            genre: $user->genre,
            role: $user->role,
        );
    }

    public function updateProfil(int $id, UpdateProfilDTO $dto): UtilisateurOutputDTO
    {
        DB::table('utilisateurs')
            ->where('id_utilisateur', $id)
            ->update([
                'nom'        => $dto->nom,
                'prenom'     => $dto->prenom,
                'telephone'  => $dto->telephone,
                'email'      => $dto->email,
                'updated_at' => now(),
            ]);

        return $this->findById($id);
    }

    public function updateMotDePasse(int $id, string $nouveauMotDePasse): void
    {
        DB::table('utilisateurs')
            ->where('id_utilisateur', $id)
            ->update([
                'mot_de_passe' => Hash::make($nouveauMotDePasse),
                'updated_at'   => now(),
            ]);
    }

    public function seDeconnecter(int $id): void
    {
        // Ici on peut gérer les tokens si on les stocke en BDD
        // Pour l'instant on retourne juste confirmation
    }
}