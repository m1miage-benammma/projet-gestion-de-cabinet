<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

final class AuthMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['message' => 'Token manquant. Veuillez vous connecter.'], 401);
        }

        $hashedToken = hash('sha256', $token);

        $accessToken = DB::table('personal_access_tokens')
            ->where('token', $hashedToken)
            ->first();

        if (! $accessToken) {
            return response()->json(['message' => 'Token invalide ou expiré.'], 401);
        }

        // Admin token
        if ($accessToken->tokenable_type === 'admin') {
            $admin = DB::table('admins')
                ->where('id_admin', $accessToken->tokenable_id)
                ->first();

            if (! $admin) {
                return response()->json(['message' => 'Administrateur introuvable.'], 401);
            }

            // Vérifier rôle si spécifié
            if (! empty($roles) && ! in_array('admin', $roles)) {
                return response()->json(['message' => 'Accès refusé. Rôle insuffisant.'], 403);
            }

            DB::table('personal_access_tokens')
                ->where('token', $hashedToken)
                ->update(['last_used_at' => now()]);

            $request->attributes->set('auth_user', (object)[
                'id_utilisateur' => $admin->id_admin,
                'login'          => $admin->login,
                'role'           => 'admin',
            ]);

            return $next($request);
        }

        // Utilisateur token
        $user = DB::table('utilisateurs')
            ->where('id_utilisateur', $accessToken->tokenable_id)
            ->first();

        if (! $user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 401);
        }

        if (! $user->actif) {
            return response()->json(['message' => 'Compte désactivé. Contactez l\'administrateur.'], 403);
        }

        if (! empty($roles) && ! in_array($user->role, $roles)) {
            return response()->json(['message' => 'Accès refusé. Rôle insuffisant.'], 403);
        }

        DB::table('personal_access_tokens')
            ->where('token', $hashedToken)
            ->update(['last_used_at' => now()]);

        $request->attributes->set('auth_user', $user);

        return $next($request);
    }
}