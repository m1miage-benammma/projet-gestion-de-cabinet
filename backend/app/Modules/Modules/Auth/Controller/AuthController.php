<?php

declare(strict_types=1);

namespace App\Modules\Auth\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Auth\DTOs\LoginDTO;
use App\Modules\Auth\DTOs\RegisterDTO;
use App\Modules\Auth\Exceptions\EmailAlreadyExistsException;
use App\Modules\Auth\Exceptions\InvalidCredentialsException;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AuthController extends Controller
{
    public function __construct(private AuthService $service) {}

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom'          => 'required|string|max:100',
            'prenom'       => 'required|string|max:100',
            'email'        => 'required|email:rfc,dns',
            'telephone'    => ['required', 'regex:/^(05|06|07)[0-9]{8}$/'],
            'genre'        => 'required|in:M,F',
            'mot_de_passe' => 'required|string|min:6',
            'role'         => 'nullable|in:patient,medecin,infirmiere',
        ]);

        try {
            $result = $this->service->register(RegisterDTO::fromArray($validated));
            return response()->json($result->toArray(), 201);
        } catch (EmailAlreadyExistsException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'        => 'required|email',
            'mot_de_passe' => 'required|string',
        ]);

        try {
            $result = $this->service->login(LoginDTO::fromArray($validated));
            return response()->json($result->toArray());
        } catch (InvalidCredentialsException $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }
    }

    // POST /logout
    public function logout(Request $request): JsonResponse
    {
        $user = $request->attributes->get('auth_user');
        if ($user) {
            $this->service->logout($user->id_utilisateur);
        }
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    // POST /forgot-password → Réinitialiser son mot de passe en cas d'oubli
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        try {
            $this->service->reinitialiserMotDePasse($validated['email']);
            return response()->json([
                'message' => 'Un nouveau mot de passe temporaire a été envoyé à votre adresse email.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}