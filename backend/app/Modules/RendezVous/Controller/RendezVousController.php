<?php

declare(strict_types=1);

namespace App\Modules\RendezVous\Controller;

use App\Http\Controllers\Controller;
use App\Modules\RendezVous\DTOs\CreateRendezVousDTO;
use App\Modules\RendezVous\Exceptions\RendezVousNotFoundException;
use App\Modules\RendezVous\Services\RendezVousService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class RendezVousController extends Controller
{
    public function __construct(private RendezVousService $service) {}

    // GET /rendez-vous — Tous les RDV enrichis
    public function index(): JsonResponse
    {
        $rdvs = DB::table('rendez_vous as rv')
            ->join('utilisateurs as u', 'rv.id_patient', '=', 'u.id_utilisateur')
            ->join('disponibilites as d', 'rv.id_disponibilite', '=', 'd.id_disponibilite')
            ->join('utilisateurs as um', 'd.id_medecin', '=', 'um.id_utilisateur')
            ->orderBy('rv.date_rdv', 'desc')
            ->select('rv.*', 'u.nom', 'u.prenom', 'u.email', 'u.telephone',
                     'um.nom as medecin_nom', 'um.prenom as medecin_prenom')
            ->get();
        return response()->json($rdvs);
    }

    // POST /rendez-vous
    public function store(Request $request): JsonResponse
    {
        $idUtilisateur   = (int) $request->input('id_patient');
        $idDisponibilite = (int) $request->input('id_disponibilite');
        $dateRdv         = $request->input('date_rdv');
        $heureRdv        = $request->input('heure_rdv');
        $motif           = $request->input('motif', 'Consultation');

        if (!$idUtilisateur || !$idDisponibilite || !$dateRdv || !$heureRdv) {
            return response()->json(['message' => 'Tous les champs sont requis.'], 422);
        }

        // CORRECTION CRITIQUE : résoudre id_utilisateur → id_utilisateur de la table patients
        $patient = DB::table('patients')->where('id_utilisateur', $idUtilisateur)->first();
        if (!$patient) {
            return response()->json(['message' => 'Profil patient introuvable.'], 422);
        }

        try {
            $dto = CreateRendezVousDTO::fromArray([
                'id_patient'       => $patient->id_utilisateur, // PK de patients
                'id_disponibilite' => $idDisponibilite,
                'date_rdv'         => $dateRdv,
                'heure_rdv'        => $heureRdv,
                'motif'            => $motif,
            ]);
            $result = $this->service->prendreRDV($dto);
            return response()->json($result->toArray(), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // GET /rendez-vous/{id}
    public function show(int $id): JsonResponse
    {
        $rdv = DB::table('rendez_vous as rv')
            ->join('utilisateurs as u', 'rv.id_patient', '=', 'u.id_utilisateur')
            ->join('disponibilites as d', 'rv.id_disponibilite', '=', 'd.id_disponibilite')
            ->join('utilisateurs as um', 'd.id_medecin', '=', 'um.id_utilisateur')
            ->where('rv.id_rdv', $id)
            ->select('rv.*', 'u.nom', 'u.prenom', 'u.email',
                     'um.nom as medecin_nom', 'um.prenom as medecin_prenom')
            ->first();
        if (!$rdv) return response()->json(['message' => "Rendez-vous #{$id} introuvable."], 404);
        return response()->json($rdv);
    }

    // GET /rendez-vous/patient/{id}
    public function byPatient(int $id): JsonResponse
    {
        $rdvs = DB::table('rendez_vous as rv')
            ->join('disponibilites as d', 'rv.id_disponibilite', '=', 'd.id_disponibilite')
            ->join('utilisateurs as um', 'd.id_medecin', '=', 'um.id_utilisateur')
            ->where('rv.id_patient', $id)
            ->orderBy('rv.date_rdv', 'desc')
            ->select('rv.*', 'um.nom as medecin_nom', 'um.prenom as medecin_prenom')
            ->get();
        return response()->json($rdvs);
    }

    // GET /rendez-vous/date/{date}
    public function byDate(string $date): JsonResponse
    {
        $rdvs = DB::table('rendez_vous as rv')
            ->join('utilisateurs as u', 'rv.id_patient', '=', 'u.id_utilisateur')
            ->join('disponibilites as d', 'rv.id_disponibilite', '=', 'd.id_disponibilite')
            ->join('utilisateurs as um', 'd.id_medecin', '=', 'um.id_utilisateur')
            ->where('rv.date_rdv', $date)
            ->orderBy('rv.heure_rdv', 'asc')
            ->select('rv.*', 'u.nom', 'u.prenom', 'u.email', 'u.telephone',
                     'um.nom as medecin_nom', 'um.prenom as medecin_prenom')
            ->get();
        return response()->json($rdvs);
    }

    // PATCH /rendez-vous/{id}/confirmer
    public function confirmer(int $id): JsonResponse
    {
        try {
            $result = $this->service->confirmer($id);
            return response()->json($result->toArray());
        } catch (RendezVousNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // PATCH /rendez-vous/{id}/annuler
    public function annuler(int $id): JsonResponse
    {
        try {
            $result = $this->service->annuler($id);
            return response()->json($result->toArray());
        } catch (RendezVousNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // PATCH /rendez-vous/{id}/modifier
    public function modifier(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'date_rdv'  => 'required|date',
            'heure_rdv' => 'required|date_format:H:i',
            'motif'     => 'required|string|max:255',
        ]);
        try {
            $result = $this->service->modifier($id, $validated['date_rdv'], $validated['heure_rdv'], $validated['motif']);
            return response()->json($result->toArray());
        } catch (RendezVousNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // PATCH /rendez-vous/{id}/patient-arrive
    public function patientArrive(int $id): JsonResponse
    {
        try {
            $result = $this->service->patientArrive($id);
            return response()->json($result->toArray());
        } catch (RendezVousNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // PATCH /rendez-vous/{id}/terminer
    public function terminer(int $id): JsonResponse
    {
        try {
            $result = $this->service->terminer($id);
            return response()->json($result->toArray());
        } catch (RendezVousNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}