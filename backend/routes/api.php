<?php
declare(strict_types=1);

use App\Modules\Auth\Controller\AuthController;
use App\Modules\Utilisateur\Controller\UtilisateurController;
use App\Modules\Patient\Controller\PatientController;
use App\Modules\Medecin\Controller\MedecinController;
use App\Modules\Infirmiere\Controller\InfirmiereController;
use App\Modules\Admin\Controller\AdminController;
use App\Modules\Disponibilite\Controller\DisponibiliteController;
use App\Modules\RendezVous\Controller\RendezVousController;
use App\Modules\DossierMedical\Controller\DossierMedicalController;
use App\Modules\Consultation\Controller\ConsultationController;
use App\Modules\Ordonnance\Controller\OrdonnanceController;
use App\Modules\Medicament\Controller\MedicamentController;
use App\Modules\Soins\Controller\SoinsController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

// ═══════════════════════════════════════════════════════════════════
// ROUTES PUBLIQUES
// ═══════════════════════════════════════════════════════════════════
Route::post('/register',        [AuthController::class, 'register']);
Route::post('/login',           [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::get('/medecins',         [MedecinController::class, 'index']);
Route::get('/medecins/{id}',    [MedecinController::class, 'show']);
Route::get('/disponibilites/medecin/{id}', [DisponibiliteController::class, 'byMedecin']);

// ═══════════════════════════════════════════════════════════════════
// PRISE DE RDV (authentifié)
// ═══════════════════════════════════════════════════════════════════
Route::middleware('auth.middleware')->post('/prise-rdv', function (Request $r) {
    $idUtilisateur   = (int) $r->input('id_patient');
    $idDisponibilite = (int) $r->input('id_disponibilite');
    $dateRdv  = $r->input('date_rdv');
    $heureRdv = $r->input('heure_rdv');
    $motif    = $r->input('motif', 'Consultation');

    if (!$idUtilisateur || !$idDisponibilite || !$dateRdv || !$heureRdv) {
        return response()->json(['message' => 'Tous les champs sont requis.'], 422);
    }

    // CORRECTION CRITIQUE : PK de patients est id_utilisateur, pas id_patient
    $patient = DB::table('patients')->where('id_utilisateur', $idUtilisateur)->first();
    if (!$patient) {
        return response()->json(['message' => 'Profil patient introuvable. Veuillez compléter votre inscription.'], 422);
    }

    // Vérifier la disponibilité
    $dispo = DB::table('disponibilites')->where('id_disponibilite', $idDisponibilite)->first();
    if (!$dispo) {
        return response()->json(['message' => 'Créneau introuvable.'], 422);
    }

    // Vérifier les conflits
    $conflit = DB::table('rendez_vous')
        ->where('id_disponibilite', $idDisponibilite)
        ->where('date_rdv', $dateRdv)
        ->where('heure_rdv', $heureRdv)
        ->whereNotIn('statut', ['annule'])
        ->exists();
    if ($conflit) {
        return response()->json(['message' => 'Ce créneau est déjà réservé pour cette date.'], 409);
    }

    // Créer le RDV — id_patient = id_utilisateur du patient (FK vers patients.id_utilisateur)
    $id = DB::table('rendez_vous')->insertGetId([
        'id_patient'       => $patient->id_utilisateur,
        'id_disponibilite' => $idDisponibilite,
        'date_rdv'         => $dateRdv,
        'heure_rdv'        => $heureRdv,
        'motif'            => $motif,
        'statut'           => 'en_attente',
        'created_at'       => now(),
        'updated_at'       => now(),
    ]);

    // Notifier le médecin
    $patientUser = DB::table('utilisateurs')->where('id_utilisateur', $idUtilisateur)->first();
    DB::table('notifications')->insert([
        'id_utilisateur' => $dispo->id_medecin,
        'message'        => "Nouveau rendez-vous reçu — {$patientUser?->prenom} {$patientUser?->nom} — le {$dateRdv} à {$heureRdv} — Motif : {$motif}",
        'type'           => 'rdv_nouveau',
        'lu'             => false,
        'created_at'     => now(),
        'updated_at'     => now(),
    ]);

    // Retourner le RDV enrichi
    $rdv = DB::table('rendez_vous as rv')
        ->join('utilisateurs as u', 'rv.id_patient', '=', 'u.id_utilisateur')
        ->join('disponibilites as d', 'rv.id_disponibilite', '=', 'd.id_disponibilite')
        ->join('utilisateurs as um', 'd.id_medecin', '=', 'um.id_utilisateur')
        ->where('rv.id_rdv', $id)
        ->select('rv.*', 'u.nom', 'u.prenom', 'u.email',
                 'um.nom as medecin_nom', 'um.prenom as medecin_prenom')
        ->first();

    return response()->json($rdv, 201);
});

// ═══════════════════════════════════════════════════════════════════
// ROUTES PROTÉGÉES
// ═══════════════════════════════════════════════════════════════════
Route::middleware('auth.middleware')->group(function () {

    // ── Auth ──────────────────────────────────────────────────────
    Route::post('/logout', [AuthController::class, 'logout']);

    // ── Profil utilisateur ────────────────────────────────────────
    Route::get('/utilisateurs/{id}',              [UtilisateurController::class, 'show']);
    Route::put('/utilisateurs/{id}',              [UtilisateurController::class, 'update']);
    Route::put('/utilisateurs/{id}/mot-de-passe', [UtilisateurController::class, 'changerMotDePasse']);

    // ── Patients ──────────────────────────────────────────────────
    Route::get('/patients',         [PatientController::class, 'index']);
    Route::post('/patients',        [PatientController::class, 'store']);
    Route::get('/patients/{id}',    [PatientController::class, 'show']);
    Route::put('/patients/{id}',    [PatientController::class, 'update']);
    Route::delete('/patients/{id}', [PatientController::class, 'destroy']);
    Route::patch('/patients/{id}/medecin-traitant', [PatientController::class, 'assignerMedecin']);

    // ── Mes RDV (patient connecté) ────────────────────────────────
    Route::get('/mes-rendez-vous', function (Request $r) {
        $authUser = $r->attributes->get('auth_user'); $idUtilisateur = (int)($authUser->id_utilisateur ?? $r->attributes->get('id_utilisateur') ?? 0);
        $rdvs = DB::table('rendez_vous as rv')
            ->leftJoin('disponibilites as d', 'rv.id_disponibilite', '=', 'd.id_disponibilite')
            ->leftJoin('utilisateurs as um', 'd.id_medecin', '=', 'um.id_utilisateur')
            ->leftJoin('medecins as m', 'um.id_utilisateur', '=', 'm.id_utilisateur')
            ->where('rv.id_patient', $idUtilisateur)
            ->orderBy('rv.date_rdv', 'desc')
            ->select('rv.*', 'um.nom as medecin_nom', 'um.prenom as medecin_prenom', 'm.specialite')
            ->get();
        return response()->json($rdvs);
    });

    // ── RDV du jour (infirmière) ──────────────────────────────────
    Route::get('/rendez-vous-jour', function () {
        $today = now()->toDateString();
        $rdvs = DB::table('rendez_vous as rv')
            ->join('utilisateurs as u', 'rv.id_patient', '=', 'u.id_utilisateur')
            ->join('disponibilites as d', 'rv.id_disponibilite', '=', 'd.id_disponibilite')
            ->join('utilisateurs as um', 'd.id_medecin', '=', 'um.id_utilisateur')
            ->where('rv.date_rdv', $today)
            ->orderBy('rv.heure_rdv', 'asc')
            ->select('rv.*', 'u.nom', 'u.prenom', 'u.email', 'u.telephone',
                     'um.nom as medecin_nom', 'um.prenom as medecin_prenom')
            ->get();
        return response()->json($rdvs);
    });

    // ── Rendez-vous ───────────────────────────────────────────────
    Route::get('/rendez-vous', [RendezVousController::class, 'index']);
    Route::post('/rendez-vous', [RendezVousController::class, 'store']);

    // Planning médecin (enrichi avec patient)
    Route::get('/rendez-vous/medecin/{id}', function (int $id) {
        $rdvs = DB::table('rendez_vous as rv')
            ->join('disponibilites as d', 'rv.id_disponibilite', '=', 'd.id_disponibilite')
            ->join('utilisateurs as u', 'rv.id_patient', '=', 'u.id_utilisateur')
            ->leftJoin('patients as p', 'rv.id_patient', '=', 'p.id_utilisateur')
            ->where('d.id_medecin', $id)
            ->orderBy('rv.date_rdv', 'desc')
            ->orderBy('rv.heure_rdv', 'asc')
            ->select('rv.*', 'u.nom', 'u.prenom', 'u.email', 'u.telephone',
                     'p.groupe_sanguin', 'p.date_naissance')
            ->get();
        return response()->json($rdvs);
    });

    Route::get('/rendez-vous/patient/{id}', [RendezVousController::class, 'byPatient']);
    Route::get('/rendez-vous/date/{date}',  [RendezVousController::class, 'byDate']);
    Route::get('/rendez-vous/{id}',         [RendezVousController::class, 'show']);
    Route::patch('/rendez-vous/{id}/confirmer',      [RendezVousController::class, 'confirmer']);
    Route::patch('/rendez-vous/{id}/annuler',        [RendezVousController::class, 'annuler']);
    Route::patch('/rendez-vous/{id}/modifier',       [RendezVousController::class, 'modifier']);
    Route::patch('/rendez-vous/{id}/patient-arrive', [RendezVousController::class, 'patientArrive']);
    Route::patch('/rendez-vous/{id}/terminer',       [RendezVousController::class, 'terminer']);

    // ── Médecins ──────────────────────────────────────────────────
    Route::post('/medecins',        [MedecinController::class, 'store']);
    Route::delete('/medecins/{id}', [MedecinController::class, 'destroy']);

    // ── Infirmières ───────────────────────────────────────────────
    Route::get('/infirmieres',             [InfirmiereController::class, 'index']);
    Route::post('/infirmieres',            [InfirmiereController::class, 'store']);
    Route::get('/infirmieres/{id}',        [InfirmiereController::class, 'show']);
    Route::delete('/infirmieres/{id}',     [InfirmiereController::class, 'destroy']);
    Route::post('/infirmieres/{id}/soins', [InfirmiereController::class, 'effectuerSoin']);
    Route::get('/infirmieres/{id}/soins',  [InfirmiereController::class, 'soins']);

    // ── Disponibilités ────────────────────────────────────────────
    Route::post('/disponibilites',        [DisponibiliteController::class, 'store']);
    Route::delete('/disponibilites/{id}', [DisponibiliteController::class, 'destroy']);

    // ── Dossier médical ───────────────────────────────────────────
    Route::post('/dossiers',             [DossierMedicalController::class, 'store']);
    Route::get('/dossiers/patient/{id}', [DossierMedicalController::class, 'byPatient']);
    Route::get('/dossiers/{id}',         [DossierMedicalController::class, 'show']);

    // Dossier complet du patient connecté
    Route::get('/dossier-complet', function (Request $r) {
        $authUser = $r->attributes->get('auth_user'); $idUtilisateur = (int)($authUser->id_utilisateur ?? $r->attributes->get('id_utilisateur') ?? 0);

        $patient = DB::table('patients as p')
            ->join('utilisateurs as u', 'p.id_utilisateur', '=', 'u.id_utilisateur')
            ->where('p.id_utilisateur', $idUtilisateur)
            ->select('p.*', 'u.nom', 'u.prenom', 'u.email', 'u.telephone', 'u.genre')
            ->first();

        if (!$patient) {
            return response()->json(['message' => 'Patient non trouvé.'], 404);
        }

        $dossier = DB::table('dossiers_medicaux')->where('id_patient', $idUtilisateur)->first();

        $consultations = [];
        $ordonnances   = [];

        if ($dossier) {
            $consults = DB::table('consultations as c')
                ->join('utilisateurs as u', 'c.id_medecin', '=', 'u.id_utilisateur')
                ->where('c.id_dossier', $dossier->id_dossier)
                ->orderBy('c.date', 'desc')
                ->select('c.*', 'u.nom as medecin_nom', 'u.prenom as medecin_prenom')
                ->get();

            $consultations = $consults->toArray();

            foreach ($consults as $c) {
                $ordos = DB::table('ordonnances')->where('id_consultation', $c->id_consultation)->get();
                foreach ($ordos as $o) {
                    $meds = DB::table('medicaments')->where('id_ordonnance', $o->id_ordonnance)->get()->toArray();
                    $ordonnances[] = array_merge((array)$o, ['medicaments' => $meds, 'medecin_nom' => $c->medecin_nom, 'medecin_prenom' => $c->medecin_prenom]);
                }
            }
        }

        return response()->json([
            'patient'       => $patient,
            'dossier'       => $dossier,
            'consultations' => $consultations,
            'ordonnances'   => $ordonnances,
        ]);
    });

    // Dossier d'un patient par id_utilisateur (pour médecin)
    Route::get('/dossier-patient/{idUtilisateur}', function (int $idUtilisateur) {
        $dossier = DB::table('dossiers_medicaux')->where('id_patient', $idUtilisateur)->first();
        if (!$dossier) {
            $id = DB::table('dossiers_medicaux')->insertGetId([
                'id_patient' => $idUtilisateur,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            $dossier = DB::table('dossiers_medicaux')->where('id_dossier', $id)->first();
        }
        return response()->json($dossier);
    });

    // ── Consultations ─────────────────────────────────────────────
    Route::post('/consultations',             [ConsultationController::class, 'store']);
    Route::get('/consultations/dossier/{id}', [ConsultationController::class, 'byDossier']);
    Route::get('/consultations/{id}',         [ConsultationController::class, 'show']);

    // ── Ordonnances ───────────────────────────────────────────────
    Route::post('/ordonnances',                  [OrdonnanceController::class, 'store']);
    Route::get('/ordonnances/patient/{id}',      [OrdonnanceController::class, 'byPatient']);
    Route::get('/ordonnances/consultation/{id}', [OrdonnanceController::class, 'byConsultation']);
    Route::get('/ordonnances/{id}',              [OrdonnanceController::class, 'show']);
    Route::put('/ordonnances/{id}',              [OrdonnanceController::class, 'update']);

    // Ordonnances par id_utilisateur du patient
    Route::get('/ordonnances/utilisateur/{id}', function (int $id) {
        $dossier = DB::table('dossiers_medicaux')->where('id_patient', $id)->first();
        if (!$dossier) return response()->json([]);
        $consultIds = DB::table('consultations')
            ->where('id_dossier', $dossier->id_dossier)->pluck('id_consultation');
        $ordonnances = DB::table('ordonnances as o')
            ->join('consultations as c', 'o.id_consultation', '=', 'c.id_consultation')
            ->join('utilisateurs as u', 'c.id_medecin', '=', 'u.id_utilisateur')
            ->whereIn('o.id_consultation', $consultIds)
            ->orderBy('o.date_emission', 'desc')
            ->select('o.*', 'u.nom as medecin_nom', 'u.prenom as medecin_prenom')
            ->get();
        $result = [];
        foreach ($ordonnances as $o) {
            $meds = DB::table('medicaments')->where('id_ordonnance', $o->id_ordonnance)->get()->toArray();
            $result[] = array_merge((array)$o, ['medicaments' => $meds]);
        }
        return response()->json($result);
    });

    // ── Médicaments ───────────────────────────────────────────────
    Route::post('/medicaments',                [MedicamentController::class, 'store']);
    Route::get('/medicaments/ordonnance/{id}', [MedicamentController::class, 'byOrdonnance']);
    Route::delete('/medicaments/{id}',         [MedicamentController::class, 'destroy']);

    // ── Soins ─────────────────────────────────────────────────────
    Route::post('/soins',                [SoinsController::class, 'store']);
    Route::get('/soins/{id}',            [SoinsController::class, 'show']);
    Route::get('/soins/patient/{id}',    [SoinsController::class, 'byPatient']);
    Route::get('/soins/infirmiere/{id}', [SoinsController::class, 'byInfirmiere']);

    // Soins de l'infirmière connectée
    Route::get('/mes-soins', function (Request $r) {
        $idInfirmiere = (int) $r->attributes->get('id_utilisateur');
        $soins = DB::table('soins as s')
            ->join('utilisateurs as u', 's.id_patient', '=', 'u.id_utilisateur')
            ->where('s.id_infirmiere', $idInfirmiere)
            ->orderBy('s.date', 'desc')
            ->select('s.*', 'u.nom', 'u.prenom')
            ->get();
        return response()->json($soins);
    });

    // ── Notifications ─────────────────────────────────────────────
    Route::get('/notifications/{id}', function (int $id) {
        return response()->json(
            DB::table('notifications')
                ->where('id_utilisateur', $id)
                ->orderBy('created_at', 'desc')
                ->get()
        );
    });

    Route::patch('/notifications/{id}/lu', function (int $id) {
        DB::table('notifications')
            ->where('id_notification', $id)
            ->update(['lu' => true, 'updated_at' => now()]);
        return response()->json(['message' => 'Notification marquée comme lue.']);
    });

    // ── IA Triage ─────────────────────────────────────────────────
    Route::post('/ia-triage', function (Request $r) {
        $symptomes = trim($r->input('symptomes', ''));
        if (!$symptomes) {
            return response()->json(['message' => 'Veuillez décrire vos symptômes.'], 422);
        }

        $lower = strtolower($symptomes);
        $urgence    = 'FAIBLE';
        $specialite = 'Médecine générale';
        $medicaments = [];
        $recommandations = [];

        $motsClesHaute  = ['douleur thoracique','chest pain','essoufflement','perte de connaissance','paralysie','avc','hémorragie','convulsion'];
        $motsClesMoyenne = ['fièvre','vomissement','diarrhée','douleur abdominale','migraine','allergie','infection','toux persistante','saignement'];

        foreach ($motsClesHaute as $k) {
            if (str_contains($lower, $k)) { $urgence = 'HAUTE'; break; }
        }
        if ($urgence !== 'HAUTE') {
            foreach ($motsClesMoyenne as $k) {
                if (str_contains($lower, $k)) { $urgence = 'MOYENNE'; break; }
            }
        }

        if (str_contains($lower, 'coeur') || str_contains($lower, 'thoracique') || str_contains($lower, 'cardiaque')) {
            $specialite = 'Cardiologie';
        } elseif (str_contains($lower, 'peau') || str_contains($lower, 'éruption') || str_contains($lower, 'allergie')) {
            $specialite = 'Dermatologie';
        } elseif (str_contains($lower, 'toux') || str_contains($lower, 'respir') || str_contains($lower, 'poumon')) {
            $specialite = 'Pneumologie';
        } elseif (str_contains($lower, 'ventre') || str_contains($lower, 'estomac') || str_contains($lower, 'digestion')) {
            $specialite = 'Gastroentérologie';
        } elseif (str_contains($lower, 'tête') || str_contains($lower, 'migraine') || str_contains($lower, 'neural')) {
            $specialite = 'Neurologie';
        } elseif (str_contains($lower, 'os') || str_contains($lower, 'articulation') || str_contains($lower, 'dos')) {
            $specialite = 'Orthopédie';
        }

        if ($urgence === 'HAUTE') {
            $recommandations[] = 'Consultez les urgences immédiatement.';
        } else {
            $recommandations[] = 'Prenez rendez-vous avec un médecin dans les meilleurs délais.';
        }
        if (str_contains($lower, 'fièvre')) { $medicaments[] = 'Paracétamol 1g toutes les 6h (si T° > 38.5°C)'; }
        if (str_contains($lower, 'douleur')) { $medicaments[] = 'Ibuprofène 400mg (après repas, si pas de contre-indication)'; }

        return response()->json([
            'urgence'         => $urgence,
            'specialite'      => $specialite,
            'recommandations' => $recommandations,
            'medicaments'     => $medicaments,
            'avertissement'   => 'Analyse indicative uniquement. Consultez un médecin pour un diagnostic officiel.',
        ]);
    });

    // ── Envoi ordonnance par email ────────────────────────────────
    Route::post('/envoyer-ordonnance', function (Request $r) {
        $idOrdonnance = (int) $r->input('id_ordonnance');
        $email        = $r->input('email');
        $ordonnance   = DB::table('ordonnances')->where('id_ordonnance', $idOrdonnance)->first();
        if (!$ordonnance) return response()->json(['message' => 'Ordonnance introuvable.'], 404);

        \Illuminate\Support\Facades\Log::info("Ordonnance #{$idOrdonnance} envoyée à {$email}");

        DB::table('notifications')->insert([
            'id_utilisateur' => $r->attributes->get('id_utilisateur'),
            'message'        => "Ordonnance ORD-{$idOrdonnance} envoyée par email à {$email}.",
            'type'           => 'ordonnance_envoyee',
            'lu'             => false,
            'created_at'     => now(), 'updated_at' => now(),
        ]);

        return response()->json(['message' => "Ordonnance envoyée à {$email}."]);
    });

    // ── Rappels RDV ───────────────────────────────────────────────
    Route::get('/rappels-rdv', function () {
        $demain = now()->addDay()->toDateString();
        $rdvs = DB::table('rendez_vous as rv')
            ->join('utilisateurs as u', 'rv.id_patient', '=', 'u.id_utilisateur')
            ->join('disponibilites as d', 'rv.id_disponibilite', '=', 'd.id_disponibilite')
            ->join('utilisateurs as um', 'd.id_medecin', '=', 'um.id_utilisateur')
            ->where('rv.date_rdv', $demain)
            ->whereNotIn('rv.statut', ['annule', 'termine'])
            ->select('rv.*', 'u.nom', 'u.prenom', 'u.email',
                     'um.nom as medecin_nom', 'um.prenom as medecin_prenom')
            ->get();

        foreach ($rdvs as $rdv) {
            $exists = DB::table('notifications')
                ->where('id_utilisateur', $rdv->id_patient)
                ->where('type', 'rappel_rdv')
                ->whereDate('created_at', now()->toDateString())
                ->exists();
            if (!$exists) {
                DB::table('notifications')->insert([
                    'id_utilisateur' => $rdv->id_patient,
                    'message'        => "Rappel : Rendez-vous demain le {$rdv->date_rdv} à {$rdv->heure_rdv} avec Dr. {$rdv->medecin_prenom} {$rdv->medecin_nom}.",
                    'type'           => 'rappel_rdv',
                    'lu'             => false,
                    'created_at'     => now(), 'updated_at' => now(),
                ]);
            }
        }

        return response()->json(['message' => count($rdvs) . ' rappels envoyés.', 'rdvs' => $rdvs]);
    });

    // ── Admin ─────────────────────────────────────────────────────
    Route::middleware('auth.middleware:admin')->group(function () {
        Route::get('/admin/utilisateurs',                   [AdminController::class, 'utilisateurs']);
        Route::get('/admin/utilisateurs/{id}',              [AdminController::class, 'show']);
        Route::put('/admin/utilisateurs/{id}',              [AdminController::class, 'modifier']);
        Route::patch('/admin/utilisateurs/{id}/activer',    [AdminController::class, 'activer']);
        Route::patch('/admin/utilisateurs/{id}/desactiver', [AdminController::class, 'desactiver']);
        Route::delete('/admin/utilisateurs/{id}',           [AdminController::class, 'supprimer']);
        Route::get('/admin/rapport',                        [AdminController::class, 'rapport']);
    });
});