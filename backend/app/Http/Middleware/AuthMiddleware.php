<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AuthMiddleware
{
    public function handle(Request $request, Closure $next, string $role = ''): Response
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['message' => 'Token d\'authentification manquant.'], 401);
        }

        $plainToken  = substr($authHeader, 7);
        $hashedToken = hash('sha256', $plainToken);

        // Chercher le token dans personal_access_tokens
        $token = DB::table('personal_access_tokens')
            ->where('token', $hashedToken)
            ->first();

        if (!$token) {
            return response()->json(['message' => 'Token invalide ou expiré.'], 401);
        }

        // Injecter l'id_utilisateur dans les attributs de la requête
        $request->attributes->set('id_utilisateur', (int) $token->tokenable_id);
        $request->attributes->set('tokenable_type', $token->tokenable_type);

        // Vérification du rôle si exigé (ex: 'admin')
        if ($role === 'admin') {
            if ($token->tokenable_type !== 'admin') {
                return response()->json(['message' => 'Accès réservé aux administrateurs.'], 403);
            }
        }

        // Si c'est un utilisateur normal, vérifier qu'il est actif
        if ($token->tokenable_type === 'utilisateur') {
            $user = DB::table('utilisateurs')
                ->where('id_utilisateur', $token->tokenable_id)
                ->first();

            if (!$user || !$user->actif) {
                return response()->json(['message' => 'Compte désactivé ou introuvable.'], 403);
            }

            $request->attributes->set('user_role', $user->role);
        }

        return $next($request);
    }
}