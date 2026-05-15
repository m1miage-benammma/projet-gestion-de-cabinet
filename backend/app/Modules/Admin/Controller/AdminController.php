<?php

declare(strict_types=1);

namespace App\Modules\Admin\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Admin\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AdminController extends Controller
{
    public function __construct(private AdminService $service) {}

    // GET /admin/utilisateurs
    public function utilisateurs(): JsonResponse
    {
        return response()->json($this->service->getAllUtilisateurs());
    }

    // GET /admin/utilisateurs/{id}
    public function show(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->getUtilisateurById($id));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // PUT /admin/utilisateurs/{id} → modifier utilisateur (séquence Admin)
    public function modifier(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'nom'       => 'sometimes|string|max:100',
            'prenom'    => 'sometimes|string|max:100',
            'email'     => 'sometimes|email',
            'telephone' => ['sometimes', 'regex:/^(05|06|07)[0-9]{8}$/'],
            'genre'     => 'sometimes|in:M,F',
            'role'      => 'sometimes|in:patient,medecin,infirmiere,admin',
        ]);

        try {
            $this->service->modifierUtilisateur($id, $validated);
            return response()->json($this->service->getUtilisateurById($id));
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // PATCH /admin/utilisateurs/{id}/activer → +activerCompte()
    public function activer(int $id): JsonResponse
    {
        try {
            $this->service->activerCompte($id);
            return response()->json(['message' => 'Compte active avec succes.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // PATCH /admin/utilisateurs/{id}/desactiver → +desactiverCompte()
    public function desactiver(int $id): JsonResponse
    {
        try {
            $this->service->desactiverCompte($id);
            return response()->json(['message' => 'Compte desactive avec succes.']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // DELETE /admin/utilisateurs/{id} → +supprimerCompte()
    public function supprimer(int $id): JsonResponse
    {
        try {
            $this->service->supprimerCompte($id);
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // GET /admin/rapport → +genererRapport()
    public function rapport(): JsonResponse
    {
        return response()->json($this->service->genererRapport());
    }
}