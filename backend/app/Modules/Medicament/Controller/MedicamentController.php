<?php

declare(strict_types=1);

namespace App\Modules\Medicament\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Medicament\DTOs\CreateMedicamentDTO;
use App\Modules\Medicament\Exceptions\MedicamentNotFoundException;
use App\Modules\Medicament\Services\MedicamentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MedicamentController extends Controller
{
    public function __construct(private MedicamentService $service) {}

    // POST /medicaments → ajouter médicament à une ordonnance
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_ordonnance' => 'required|integer|exists:ordonnances,id_ordonnance',
            'nom'           => 'required|string|max:255',
            'dosage'        => 'required|string|max:100',
            'duree'         => 'required|string|max:100',
        ]);

        $dto    = CreateMedicamentDTO::fromArray($validated);
        $result = $this->service->create($dto);

        return response()->json($result->toArray(), 201);
    }

    // GET /medicaments/ordonnance/{id} → tous les médicaments d'une ordonnance
    public function byOrdonnance(int $id): JsonResponse
    {
        return response()->json(
            array_map(fn ($m) => $m->toArray(), $this->service->getByOrdonnance($id))
        );
    }

    // DELETE /medicaments/{id}
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->delete($id);
            return response()->json(null, 204);
        } catch (MedicamentNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}