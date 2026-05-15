<?php

declare(strict_types=1);

namespace App\Modules\Utilisateur\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Utilisateur\DTOs\UpdateProfilDTO;
use App\Modules\Utilisateur\Exceptions\UtilisateurNotFoundException;
use App\Modules\Utilisateur\Services\UtilisateurService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class UtilisateurController extends Controller
{
    public function __construct(private UtilisateurService $service) {}

    // GET /utilisateurs/{id} → consulter profil
    public function show(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->getProfil($id)->toArray());
        } catch (UtilisateurNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // PUT /utilisateurs/{id} → modifier profil (nom, prenom, telephone, email)
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'nom'       => 'required|string|max:100',
            'prenom'    => 'required|string|max:100',
            'telephone' => 'required|string|max:20',
            'email'     => 'required|email|unique:utilisateurs,email,' . $id . ',id_utilisateur',
        ]);

        try {
            $dto    = UpdateProfilDTO::fromArray($validated);
            $result = $this->service->modifierProfil($id, $dto);

            return response()->json($result->toArray());
        } catch (UtilisateurNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // PUT /utilisateurs/{id}/mot-de-passe → changer mot de passe
    public function changerMotDePasse(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'ancien_mot_de_passe'  => 'required|string',
            'nouveau_mot_de_passe' => 'required|string|min:6',
        ]);

        try {
            $this->service->modifierMotDePasse(
                $id,
                $validated['ancien_mot_de_passe'],
                $validated['nouveau_mot_de_passe']
            );

            return response()->json(['message' => 'Mot de passe modifie avec succes.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}