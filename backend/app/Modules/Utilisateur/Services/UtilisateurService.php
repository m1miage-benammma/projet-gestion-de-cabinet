<?php

declare(strict_types=1);

namespace App\Modules\Utilisateur\Services;

use App\Modules\Utilisateur\DTOs\UpdateProfilDTO;
use App\Modules\Utilisateur\DTOs\UtilisateurOutputDTO;
use App\Modules\Utilisateur\Manager\UtilisateurManager;

final class UtilisateurService
{
    public function __construct(private UtilisateurManager $manager) {}

    // Selon le diagramme : seConnecter() → géré par Auth
    // Selon le diagramme : seDeconnecter() → géré par Auth
    // Selon le diagramme : modifierProfil()

    public function getProfil(int $id): UtilisateurOutputDTO
    {
        return $this->manager->getProfil($id);
    }

    public function modifierProfil(int $id, UpdateProfilDTO $dto): UtilisateurOutputDTO
    {
        return $this->manager->modifierProfil($id, $dto);
    }

    public function modifierMotDePasse(int $id, string $ancienMotDePasse, string $nouveauMotDePasse): void
    {
        // Vérifier l'ancien mot de passe avant de changer
        $user = \Illuminate\Support\Facades\DB::table('utilisateurs')
            ->where('id_utilisateur', $id)
            ->first();

        if (! \Illuminate\Support\Facades\Hash::check($ancienMotDePasse, $user->mot_de_passe)) {
            throw new \Exception('Ancien mot de passe incorrect.');
        }

        $this->manager->modifierMotDePasse($id, $nouveauMotDePasse);
    }
}