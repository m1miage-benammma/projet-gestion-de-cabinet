<?php

declare(strict_types=1);

namespace App\Modules\Ordonnance\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Ordonnance\DTOs\CreateOrdonnanceDTO;
use App\Modules\Ordonnance\Exceptions\OrdonnanceNotFoundException;
use App\Modules\Ordonnance\Services\OrdonnanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class OrdonnanceController extends Controller
{
    public function __construct(private OrdonnanceService $service) {}

    // POST /ordonnances → +generer() selon le diagramme
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_consultation' => 'required|integer|exists:consultations,id_consultation',
            'date_emission'   => 'required|date',
            'instructions'    => 'nullable|string',
        ]);

        $dto    = CreateOrdonnanceDTO::fromArray($validated);
        $result = $this->service->generer($dto);

        return response()->json($result->toArray(), 201);
    }

    // GET /ordonnances/{id}
    public function show(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->getById($id)->toArray());
        } catch (OrdonnanceNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // GET /ordonnances/consultation/{id}
    public function byConsultation(int $id): JsonResponse
    {
        $result = $this->service->getByConsultation($id);
        if (! $result) {
            return response()->json(['message' => 'Aucune ordonnance pour cette consultation.'], 404);
        }
        return response()->json($result->toArray());
    }

    // GET /ordonnances/patient/{id} → +consulterOrdonnances() Patient
    public function byPatient(int $id): JsonResponse
    {
        $ordonnances = DB::table('ordonnances')
            ->join('consultations', 'ordonnances.id_consultation', '=', 'consultations.id_consultation')
            ->join('dossiers_medicaux', 'consultations.id_dossier', '=', 'dossiers_medicaux.id_dossier')
            ->where('dossiers_medicaux.id_patient', $id)
            ->select('ordonnances.*')
            ->orderBy('ordonnances.date_emission', 'desc')
            ->get();

        return response()->json($ordonnances);
    }

    // PUT /ordonnances/{id} → +modifier() selon le diagramme
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'date_emission' => 'required|date',
            'instructions'  => 'nullable|string',
        ]);

        try {
            $result = $this->service->modifier(
                $id,
                $validated['date_emission'],
                $validated['instructions'] ?? null,
            );
            return response()->json($result->toArray());
        } catch (OrdonnanceNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}