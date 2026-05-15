<?php

declare(strict_types=1);

namespace App\Modules\Auth\Services;

use App\Modules\Auth\DTOs\AuthOutputDTO;
use App\Modules\Auth\DTOs\LoginDTO;
use App\Modules\Auth\DTOs\RegisterDTO;
use App\Modules\Auth\Exceptions\EmailAlreadyExistsException;
use App\Modules\Auth\Exceptions\InvalidCredentialsException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

final class AuthService
{
    public function register(RegisterDTO $dto): AuthOutputDTO
    {
        if (DB::table('utilisateurs')->where('email', $dto->email)->exists()) {
            throw EmailAlreadyExistsException::make();
        }

        $role = $dto->role ?? 'patient';

        $id = DB::table('utilisateurs')->insertGetId([
            'nom'          => $dto->nom,
            'prenom'       => $dto->prenom,
            'email'        => $dto->email,
            'telephone'    => $dto->telephone ?? '',
            'genre'        => $dto->genre ?? 'M',
            'mot_de_passe' => Hash::make($dto->mot_de_passe),
            'role'         => $role,
            'actif'        => true,
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        if ($role === 'patient') {
            DB::table('patients')->insert([
                'id_utilisateur'       => $id,
                'date_naissance'       => $dto->date_naissance    ?? null,
                'adresse'              => $dto->adresse            ?? null,
                'groupe_sanguin'       => $dto->groupe_sanguin     ?? 'ND',
                'numero_cni'           => $dto->numero_cni         ?? null,
                'wilaya'               => $dto->wilaya             ?? null,
                'allergies'            => $dto->allergies          ?? null,
                'antecedents_medicaux' => $dto->antecedents        ?? null,
                'traitements_en_cours' => $dto->traitements        ?? null,
                'assurance_maladie'    => $dto->assurance_maladie  ?? null,
                'numero_assurance'     => $dto->numero_assurance   ?? null,
                'urgence_nom'          => $dto->urgence_nom        ?? null,
                'urgence_telephone'    => $dto->urgence_tel        ?? null,
                'created_at'           => now(),
                'updated_at'           => now(),
            ]);

            // CORRECTION : date_creation obligatoire dans dossiers_medicaux
            DB::table('dossiers_medicaux')->insert([
                'id_patient'    => $id,
                'date_creation' => now()->toDateString(),
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

        } elseif ($role === 'medecin') {
            DB::table('medecins')->insert([
                'id_utilisateur' => $id,
                'specialite'     => $dto->specialite   ?? 'Médecine générale',
                'numero_ordre'   => $dto->numero_ordre ?? null,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);

        } elseif (in_array($role, ['infirmiere', 'infirmier'])) {
            DB::table('infirmieres')->insert([
                'id_utilisateur' => $id,
                'numero_employe' => $dto->numero_employe ?? null,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }

        $user  = DB::table('utilisateurs')->where('id_utilisateur', $id)->first();
        $token = $this->creerToken($id, $user->role, 'utilisateur');

        return $this->buildOutput($user, $token);
    }

    public function login(LoginDTO $dto): AuthOutputDTO
    {
        $admin = DB::table('admins')->where('login', $dto->email)->first();
        if ($admin && Hash::check($dto->mot_de_passe, $admin->mot_de_passe)) {
            DB::table('personal_access_tokens')
                ->where('tokenable_type', 'admin')
                ->where('tokenable_id', $admin->id_admin)
                ->delete();
            $token = $this->creerToken($admin->id_admin, 'admin', 'admin');
            return new AuthOutputDTO(
                id: $admin->id_admin,
                nom: 'Administrateur', prenom: 'Système',
                email: $admin->login, telephone: '', genre: '',
                role: 'admin', token: $token,
            );
        }

        $user = DB::table('utilisateurs')->where('email', $dto->email)->first();
        if (!$user || !Hash::check($dto->mot_de_passe, $user->mot_de_passe)) {
            throw InvalidCredentialsException::make();
        }
        if (!$user->actif) {
            throw new \Exception('Votre compte est désactivé. Contactez l\'administration.');
        }

        DB::table('personal_access_tokens')
            ->where('tokenable_type', 'utilisateur')
            ->where('tokenable_id', $user->id_utilisateur)
            ->delete();

        $token = $this->creerToken($user->id_utilisateur, $user->role, 'utilisateur');
        return $this->buildOutput($user, $token);
    }

    public function logout(int $idUtilisateur): void
    {
        DB::table('personal_access_tokens')->where('tokenable_id', $idUtilisateur)->delete();
    }

    public function reinitialiserMotDePasse(string $email): void
    {
        $user = DB::table('utilisateurs')->where('email', $email)->first();
        if (!$user) throw new \Exception('Aucun compte associé à cet email.');
        $temp = substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 10);
        DB::table('utilisateurs')
            ->where('id_utilisateur', $user->id_utilisateur)
            ->update(['mot_de_passe' => Hash::make($temp), 'updated_at' => now()]);
        \Illuminate\Support\Facades\Log::info("Mot de passe temporaire [{$email}]: {$temp}");
    }

    private function buildOutput(object $user, string $token): AuthOutputDTO
    {
        $extra = [];
        if ($user->role === 'medecin') {
            $m = DB::table('medecins')->where('id_utilisateur', $user->id_utilisateur)->first();
            $extra = ['specialite' => $m?->specialite, 'numero_ordre' => $m?->numero_ordre];
        } elseif ($user->role === 'patient') {
            $p = DB::table('patients')->where('id_utilisateur', $user->id_utilisateur)->first();
            $extra = ['groupe_sanguin' => $p?->groupe_sanguin, 'date_naissance' => $p?->date_naissance];
        }
       return new AuthOutputDTO(
    id: $user->id_utilisateur,
    nom: $user->nom,
    prenom: $user->prenom,
    email: $user->email,
    telephone: $user->telephone,
    genre: $user->genre,
    role: $user->role,
    token: $token
);
    }

    private function creerToken(int $id, string $name, string $type): string
    {
        $plain  = bin2hex(random_bytes(40));
        $hashed = hash('sha256', $plain);
        DB::table('personal_access_tokens')->insert([
            'tokenable_type' => $type,
            'tokenable_id'   => $id,
            'name'           => $name,
            'token'          => $hashed,
            'abilities'      => '["*"]',
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
        return $plain;
    }
}