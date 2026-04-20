<?php

declare(strict_types=1);

namespace App\Modules\Medecin\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Medecin\DTOs\CreateMedecinDTO;
use App\Modules\Medecin\Exceptions\MedecinNotFoundException;
use App\Modules\Medecin\Services\MedecinService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class MedecinController extends Controller
{
    public function __construct(private MedecinService $service) {}

    public function index(Request $request): JsonResponse
    {
        $list = $request->has('specialite')
            ? $this->service->listBySpecialite($request->specialite)
            : $this->service->listMedecins();

        return response()->json(array_map(fn ($m) => $m->toArray(), $list));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom'          => 'required|string|max:100',
            'prenom'       => 'required|string|max:100',
            'email'        => 'required|email:rfc,dns|unique:utilisateurs,email',
            'telephone'    => ['required', 'regex:/^(05|06|07)[0-9]{8}$/'],
            'genre'        => 'required|in:M,F',
            'mot_de_passe' => 'required|string|min:6',
            'specialite'   => 'required|string|max:100',
            'numero_ordre' => 'required|string|unique:medecins,numero_ordre',
        ]);

        $dto    = CreateMedecinDTO::fromArray($validated);
        $result = $this->service->createMedecin($dto);

        return response()->json($result->toArray(), 201);
    }

    public function show(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->getMedecin($id)->toArray());
        } catch (MedecinNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deleteMedecin($id);
            return response()->json(null, 204);
        } catch (MedecinNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}