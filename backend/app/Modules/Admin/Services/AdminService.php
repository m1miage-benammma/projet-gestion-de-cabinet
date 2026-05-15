<?php

declare(strict_types=1);

namespace App\Modules\Admin\Services;

use Illuminate\Support\Facades\DB;

final class AdminService
{
    // Selon le diagramme :
    // +gererComptes()
    // +activerCompte()
    // +desactiverCompte()
    // +supprimerCompte()
    // +genererRapport()

    public function getAllUtilisateurs(): array
    {
        return DB::table('utilisateurs')
            ->select('id_utilisateur', 'nom', 'prenom', 'email', 'telephone', 'genre', 'role', 'actif', 'created_at')
            ->orderBy('role')
            ->get()
            ->toArray();
    }

    public function getUtilisateurById(int $id): object
    {
        $user = DB::table('utilisateurs')
            ->where('id_utilisateur', $id)
            ->select('id_utilisateur', 'nom', 'prenom', 'email', 'telephone', 'genre', 'role', 'actif', 'created_at')
            ->first();

        if (! $user) {
            throw new \Exception("Utilisateur avec ID {$id} introuvable.");
        }

        return $user;
    }

    // modifier utilisateur → séquence Admin (Fig. 2.13)
    public function modifierUtilisateur(int $id, array $data): bool
    {
        if (! DB::table('utilisateurs')->where('id_utilisateur', $id)->exists()) {
            throw new \Exception("Utilisateur avec ID {$id} introuvable.");
        }

        $data['updated_at'] = now();

        return DB::table('utilisateurs')
            ->where('id_utilisateur', $id)
            ->update($data) > 0;
    }

    // +activerCompte() ← f le diagramme
    public function activerCompte(int $id): bool
    {
        if (! DB::table('utilisateurs')->where('id_utilisateur', $id)->exists()) {
            throw new \Exception("Utilisateur avec ID {$id} introuvable.");
        }

        return DB::table('utilisateurs')
            ->where('id_utilisateur', $id)
            ->update(['actif' => true, 'updated_at' => now()]) > 0;
    }

    // +desactiverCompte() ← f le diagramme
    public function desactiverCompte(int $id): bool
    {
        if (! DB::table('utilisateurs')->where('id_utilisateur', $id)->exists()) {
            throw new \Exception("Utilisateur avec ID {$id} introuvable.");
        }

        return DB::table('utilisateurs')
            ->where('id_utilisateur', $id)
            ->update(['actif' => false, 'updated_at' => now()]) > 0;
    }

    // +supprimerCompte() ← f le diagramme
    public function supprimerCompte(int $id): bool
    {
        return DB::table('utilisateurs')->where('id_utilisateur', $id)->delete() > 0;
    }

    // +genererRapport() ← f le diagramme
    public function genererRapport(): array
    {
        return [
            'total_patients'      => DB::table('patients')->count(),
            'total_medecins'      => DB::table('medecins')->count(),
            'total_infirmieres'   => DB::table('infirmieres')->count(),
            'total_rdv'           => DB::table('rendez_vous')->count(),
            'rdv_en_attente'      => DB::table('rendez_vous')->where('statut', 'EN_ATTENTE')->count(),
            'rdv_confirmes'       => DB::table('rendez_vous')->where('statut', 'CONFIRME')->count(),
            'rdv_annules'         => DB::table('rendez_vous')->where('statut', 'ANNULE')->count(),
            'rdv_termines'        => DB::table('rendez_vous')->where('statut', 'TERMINE')->count(),
            'total_consultations' => DB::table('consultations')->count(),
            'total_ordonnances'   => DB::table('ordonnances')->count(),
            'total_soins'         => DB::table('soins')->count(),
        ];
    }
}