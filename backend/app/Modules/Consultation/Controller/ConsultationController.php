<?php

declare(strict_types=1);

namespace App\Modules\Consultation\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Consultation\DTOs\CreateConsultationDTO;
use App\Modules\Consultation\Exceptions\ConsultationNotFoundException;
use App\Modules\Consultation\Services\ConsultationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class ConsultationController extends Controller
{
    public function __construct(private ConsultationService $service) {}

    // POST /consultations → +creer() selon le diagramme
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_dossier'  => 'required|integer|exists:dossiers_medicaux,id_dossier',
            'id_medecin'  => 'required|integer|exists:medecins,id_utilisateur',
            'date'        => 'required|date',
            'diagnostic'  => 'required|string',
            'traitement'  => 'required|string',
            'note'        => 'nullable|string',
        ]);

        $dto    = CreateConsultationDTO::fromArray($validated);
        $result = $this->service->creer($dto);

        return response()->json($result->toArray(), 201);
    }

    // GET /consultations/{id}
    public function show(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->getById($id)->toArray());
        } catch (ConsultationNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // GET /consultations/dossier/{id} → toutes les consultations d'un dossier
    public function byDossier(int $id): JsonResponse
    {
        return response()->json(
            array_map(fn ($c) => $c->toArray(), $this->service->getByDossier($id))
        );
    }
}