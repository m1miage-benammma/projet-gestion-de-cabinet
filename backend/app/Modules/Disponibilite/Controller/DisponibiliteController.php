<?php

declare(strict_types=1);

namespace App\Modules\Disponibilite\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Disponibilite\DTOs\CreateDisponibiliteDTO;
use App\Modules\Disponibilite\Exceptions\DisponibiliteNotFoundException;
use App\Modules\Disponibilite\Services\DisponibiliteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class DisponibiliteController extends Controller
{
    public function __construct(private DisponibiliteService $service) {}

    // POST /disponibilites → définir une disponibilité
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_medecin'  => 'required|integer|exists:medecins,id_utilisateur',
            'jour'        => 'required|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin'   => 'required|date_format:H:i|after:heure_debut',
        ]);

        $dto    = CreateDisponibiliteDTO::fromArray($validated);
        $result = $this->service->definirDisponibilite($dto);

        return response()->json($result->toArray(), 201);
    }

    // GET /disponibilites/medecin/{id} → voir les créneaux d'un médecin
    public function byMedecin(int $idMedecin): JsonResponse
    {
        $list = $this->service->getByMedecin($idMedecin);

        return response()->json(array_map(fn ($d) => $d->toArray(), $list));
    }

    // DELETE /disponibilites/{id} → supprimer un créneau
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->supprimer($id);
            return response()->json(null, 204);
        } catch (DisponibiliteNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}