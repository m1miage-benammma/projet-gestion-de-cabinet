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

        $id = DB::table('utilisateurs')->insertGetId([
            'nom'          => $dto->nom,
            'prenom'       => $dto->prenom,
            'email'        => $dto->email,
            'telephone'    => $dto->telephone,
            'genre'        => $dto->genre,
            'mot_de_passe' => Hash::make($dto->mot_de_passe),
            'role'         => $dto->role ?? 'patient',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        $user  = DB::table('utilisateurs')->where('id_utilisateur', $id)->first();
        $token = $this->creerTokenUtilisateur($id, $user->role);

        return new AuthOutputDTO(
            id: $id,
            nom: $user->nom,
            prenom: $user->prenom,
            email: $user->email,
            telephone: $user->telephone,
            genre: $user->genre,
            role: $user->role,
            token: $token,
        );
    }

    public function login(LoginDTO $dto): AuthOutputDTO
    {
        // 1 — Chercher d'abord dans table admins
        $admin = DB::table('admins')->where('login', $dto->email)->first();

        if ($admin && Hash::check($dto->mot_de_passe, $admin->mot_de_passe)) {
            DB::table('personal_access_tokens')
                ->where('tokenable_type', 'admin')
                ->where('tokenable_id', $admin->id_admin)
                ->delete();

            $token = $this->creerTokenAdmin($admin->id_admin);

            return new AuthOutputDTO(
                id: $admin->id_admin,
                nom: 'Administrateur',
                prenom: 'Système',
                email: $admin->login,
                telephone: '',
                genre: '',
                role: 'admin',
                token: $token,
            );
        }

        // 2 — Chercher dans table utilisateurs
        $user = DB::table('utilisateurs')->where('email', $dto->email)->first();

        if (! $user || ! Hash::check($dto->mot_de_passe, $user->mot_de_passe)) {
            throw InvalidCredentialsException::make();
        }

        DB::table('personal_access_tokens')
            ->where('tokenable_type', 'utilisateur')
            ->where('tokenable_id', $user->id_utilisateur)
            ->delete();

        $token = $this->creerTokenUtilisateur($user->id_utilisateur, $user->role);

        return new AuthOutputDTO(
            id: $user->id_utilisateur,
            nom: $user->nom,
            prenom: $user->prenom,
            email: $user->email,
            telephone: $user->telephone,
            genre: $user->genre,
            role: $user->role,
            token: $token,
        );
    }

    public function logout(int $idUtilisateur): void
    {
        DB::table('personal_access_tokens')
            ->where('tokenable_id', $idUtilisateur)
            ->delete();
    }

    // Réinitialiser son mot de passe en cas d'oubli
    public function reinitialiserMotDePasse(string $email): void
    {
        $user = DB::table('utilisateurs')->where('email', $email)->first();

        if (! $user) {
            throw new \Exception("Aucun compte associé à cet email.");
        }

        // Génère un mot de passe temporaire
        $motDePasseTemp = substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 10);

        DB::table('utilisateurs')
            ->where('id_utilisateur', $user->id_utilisateur)
            ->update([
                'mot_de_passe' => Hash::make($motDePasseTemp),
                'updated_at'   => now(),
            ]);

        // Log le mot de passe temporaire (en production: envoyer par email/SMS)
        \Illuminate\Support\Facades\Log::info("Mot de passe temporaire pour {$email}: {$motDePasseTemp}");
    }

    private function creerTokenUtilisateur(int $id, string $role): string
    {
        $plainText   = bin2hex(random_bytes(40));
        $hashedToken = hash('sha256', $plainText);

        DB::table('personal_access_tokens')->insert([
            'tokenable_type' => 'utilisateur',
            'tokenable_id'   => $id,
            'name'           => $role,
            'token'          => $hashedToken,
            'abilities'      => '["*"]',
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return $plainText;
    }

    private function creerTokenAdmin(int $id): string
    {
        $plainText   = bin2hex(random_bytes(40));
        $hashedToken = hash('sha256', $plainText);

        DB::table('personal_access_tokens')->insert([
            'tokenable_type' => 'admin',
            'tokenable_id'   => $id,
            'name'           => 'admin',
            'token'          => $hashedToken,
            'abilities'      => '["*"]',
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return $plainText;
    }
}