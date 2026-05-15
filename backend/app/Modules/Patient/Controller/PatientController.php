<?php

declare(strict_types=1);

namespace App\Modules\Patient\Controller;

use App\Http\Controllers\Controller;
use App\Modules\Patient\DTOs\CreatePatientDTO;
use App\Modules\Patient\Exceptions\PatientNotFoundException;
use App\Modules\Patient\Services\PatientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class PatientController extends Controller
{
    public function __construct(private PatientService $service) {}

    public function index(): JsonResponse
    {
        $list = $this->service->listPatients();
        return response()->json(array_map(fn ($p) => $p->toArray(), $list));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'email'          => 'required|email:rfc,dns|unique:utilisateurs,email',
            'telephone'      => ['required', 'regex:/^(05|06|07)[0-9]{8}$/'],
            'genre'          => 'required|in:M,F',
            'mot_de_passe'   => 'required|string|min:6',
            'date_naissance' => 'required|date',
            'adresse'        => 'required|string|max:255',
            'groupe_sanguin' => 'required|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
        ]);

        $dto    = CreatePatientDTO::fromArray($validated);
        $result = $this->service->createPatient($dto);

        return response()->json($result->toArray(), 201);
    }

    public function show(int $id): JsonResponse
    {
        try {
            return response()->json($this->service->getPatient($id)->toArray());
        } catch (PatientNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->service->deletePatient($id);
            return response()->json(null, 204);
        } catch (PatientNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], 404);
        }
    }

    // +assignerMedecin() → UC Infirmiere : Assigner un medecin traitant
    public function assignerMedecin(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'id_medecin' => 'required|integer|exists:medecins,id_utilisateur',
        ]);

        $patient = DB::table('patients')->where('id_utilisateur', $id)->first();

        if (! $patient) {
            return response()->json(['message' => 'Patient introuvable.'], 404);
        }

        DB::table('patients')
            ->where('id_utilisateur', $id)
            ->update([
                'id_medecin_traitant' => $validated['id_medecin'],
                'updated_at'          => now(),
            ]);

        $updated = DB::table('patients')
            ->join('utilisateurs', 'patients.id_utilisateur', '=', 'utilisateurs.id_utilisateur')
            ->where('patients.id_utilisateur', $id)
            ->select('patients.*', 'utilisateurs.nom', 'utilisateurs.prenom', 'utilisateurs.email')
            ->first();

        return response()->json([
            'message' => 'Médecin traitant assigné avec succès.',
            'patient' => $updated,
        ]);
    }
}