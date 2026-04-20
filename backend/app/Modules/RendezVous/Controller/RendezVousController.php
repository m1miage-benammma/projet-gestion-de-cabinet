<?php

declare(strict_types=1);

namespace App\Modules\RendezVous\Controller;

use App\Http\Controllers\Controller;
use App\Modules\RendezVous\DTOs\CreateRendezVousDTO;
use App\Modules\RendezVous\Exceptions\RendezVousNotFoundException;
use App\Modules\RendezVous\Exceptions\StatutInvalideException;
use App\Modules\RendezVous\Services\RendezVousService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class RendezVousController extends Controller
{
    public function __construct(private RendezVousService $service) {}

    // GET /rendez-vous
    public function index(): JsonResponse
    {
        return response()->json(array_map(fn ($r) => $r->toArray(), $this->service->listAll()));
    }

    // POST /rendez-vous → +prendreRDV()
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_patient'       => 'required|integer|exists:patients,id_utilisateur',
            'id_disponibilite' => 'required|integer|exists:disponibilites,id_disponibilite',
            'date_rdv'         => 'required|date',
            'heure_rdv'        => 'required|date_format:H:i',
            'motif'            => 'required|string|max:255',
        ]);

        try {
            $dto    = CreateRendezVousDTO::fromArray($validated);
            $result = $this->service->prendreRDV($dto);
            return response()->json($result->toArray(), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // GET /rendez-vous/{id}
    public function show(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->getById($id)->toArray());
        } catch (RendezVousNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // GET /rendez-vous/patient/{id} → +consulterRDV() Patient
    public function byPatient(int $id): JsonResponse
    {
        return response()->json(array_map(fn ($r) => $r->toArray(), $this->service->listByPatient($id)));
    }

    // GET /rendez-vous/medecin/{id} → +consulterAgenda() Médecin
    public function byMedecin(int $id): JsonResponse
    {
        return response()->json(array_map(fn ($r) => $r->toArray(), $this->service->listByMedecin($id)));
    }

    // GET /rendez-vous/date/{date} → Chercher_RDV(date) séquence Infirmière
    public function byDate(string $date): JsonResponse
    {
        return response()->json(array_map(fn ($r) => $r->toArray(), $this->service->listByDate($date)));
    }

    // PATCH /rendez-vous/{id}/confirmer → +confirmer()
    public function confirmer(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->confirmer($id)->toArray());
        } catch (RendezVousNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (StatutInvalideException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // PATCH /rendez-vous/{id}/annuler → +annuler()
    public function annuler(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->annuler($id)->toArray());
        } catch (RendezVousNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (StatutInvalideException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // PATCH /rendez-vous/{id}/modifier → +modifier()
    public function modifier(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'date_rdv'  => 'required|date',
            'heure_rdv' => 'required|date_format:H:i',
            'motif'     => 'required|string|max:255',
        ]);

        try {
            return response()->json(
                $this->service->modifier($id, $validated['date_rdv'], $validated['heure_rdv'], $validated['motif'])->toArray()
            );
        } catch (RendezVousNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (StatutInvalideException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // PATCH /rendez-vous/{id}/patient-arrive → séquence Infirmière
    public function patientArrive(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->patientArrive($id)->toArray());
        } catch (RendezVousNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // PATCH /rendez-vous/{id}/terminer
    public function terminer(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->terminer($id)->toArray());
        } catch (RendezVousNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }
}