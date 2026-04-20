<?php

declare(strict_types=1);

namespace App\Modules\DossierMedical\Controller;

use App\Http\Controllers\Controller;
use App\Modules\DossierMedical\Exceptions\DossierMedicalNotFoundException;
use App\Modules\DossierMedical\Services\DossierMedicalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DossierMedicalController extends Controller
{
    public function __construct(private DossierMedicalService $service) {}

    // POST /dossiers → créer un dossier pour un patient
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_patient' => 'required|integer|exists:patients,id_utilisateur',
        ]);

        try {
            $result = $this->service->creerDossier($validated['id_patient']);
            return response()->json($result->toArray(), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // GET /dossiers/patient/{id} → consulter dossier d'un patient
    // +consulter() selon le diagramme → retourne dossier + consultations
    public function byPatient(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->consulter($id));
        } catch (DossierMedicalNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // GET /dossiers/{id} → consulter dossier par ID
    public function show(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->getDossierById($id)->toArray());
        } catch (DossierMedicalNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}