<?php

declare(strict_types=1);

namespace App\Modules\Soins\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Soins\DTOs\CreateSoinsDTO;
use App\Modules\Soins\Exceptions\SoinsNotFoundException;
use App\Modules\Soins\Services\SoinsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class SoinsController extends Controller
{
    public function __construct(private SoinsService $service) {}

    // POST /soins → +enregistrer() selon le diagramme
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_infirmiere' => 'required|integer|exists:infirmieres,id_utilisateur',
            'id_patient'    => 'required|integer|exists:patients,id_utilisateur',
            'id_ordonnance' => 'nullable|integer|exists:ordonnances,id_ordonnance',
            'type_soin'     => 'required|in:INJECTION,PANSEMENT,PERFUSION,PRISE_DE_SANG,SOINS_PLAIE,AUTRE',
            'fiche_soin'    => 'required|string',
            'date'          => 'required|date',
            'observation'   => 'nullable|string',
        ]);

        $dto    = CreateSoinsDTO::fromArray($validated);
        $result = $this->service->enregistrer($dto);

        return response()->json($result->toArray(), 201);
    }

    // GET /soins/{id}
    public function show(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->getById($id)->toArray());
        } catch (SoinsNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // GET /soins/patient/{id} → +consulter() selon le diagramme
    public function byPatient(int $id): JsonResponse
    {
        return response()->json(
            array_map(fn ($s) => $s->toArray(), $this->service->consulterByPatient($id))
        );
    }

    // GET /soins/infirmiere/{id}
    public function byInfirmiere(int $id): JsonResponse
    {
        return response()->json(
            array_map(fn ($s) => $s->toArray(), $this->service->consulterByInfirmiere($id))
        );
    }
}