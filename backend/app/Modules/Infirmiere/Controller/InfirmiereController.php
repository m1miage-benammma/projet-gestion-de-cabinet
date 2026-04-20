<?php

declare(strict_types=1);

namespace App\Modules\Infirmiere\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Infirmiere\DTOs\CreateInfirmiereDTO;
use App\Modules\Infirmiere\Exceptions\InfirmiereNotFoundException;
use App\Modules\Infirmiere\Services\InfirmiereService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class InfirmiereController extends Controller
{
    public function __construct(private InfirmiereService $service) {}

    // GET /infirmieres
    public function index(): JsonResponse
    {
        return response()->json(array_map(fn ($i) => $i->toArray(), $this->service->listInfirmieres()));
    }

    // POST /infirmieres
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'email'          => 'required|email:rfc,dns|unique:utilisateurs,email',
            'telephone'      => ['required', 'regex:/^(05|06|07)[0-9]{8}$/'],
            'genre'          => 'required|in:M,F',
            'mot_de_passe'   => 'required|string|min:6',
            'numero_employe' => 'required|string|unique:infirmieres,numero_employe',
            'date_embauche'  => 'required|date',
        ]);

        $dto    = CreateInfirmiereDTO::fromArray($validated);
        $result = $this->service->createInfirmiere($dto);

        return response()->json($result->toArray(), 201);
    }

    // GET /infirmieres/{id}
    public function show(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->getInfirmiere($id)->toArray());
        } catch (InfirmiereNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // DELETE /infirmieres/{id}
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deleteInfirmiere($id);
            return response()->json(null, 204);
        } catch (InfirmiereNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // POST /infirmieres/{id}/soins → +effectuerSoin() selon le diagramme
    public function effectuerSoin(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'id_patient'    => 'required|integer|exists:patients,id_utilisateur',
            'id_ordonnance' => 'nullable|integer|exists:ordonnances,id_ordonnance',
            'type_soin'     => 'required|in:INJECTION,PANSEMENT,PERFUSION,PRISE_DE_SANG,SOINS_PLAIE,AUTRE',
            'fiche_soin'    => 'required|string',
            'date'          => 'required|date',
            'observation'   => 'nullable|string',
        ]);

        try {
            $result = $this->service->effectuerSoin(
                idInfirmiere: $id,
                idPatient: $validated['id_patient'],
                idOrdonnance: $validated['id_ordonnance'] ?? null,
                typeSoin: $validated['type_soin'],
                ficheSoin: $validated['fiche_soin'],
                date: $validated['date'],
                observation: $validated['observation'] ?? null,
            );

            return response()->json($result, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // GET /infirmieres/{id}/soins → voir les soins effectués
    public function soins(int $id): JsonResponse
    {
        return response()->json($this->service->getSoinsByInfirmiere($id));
    }
}