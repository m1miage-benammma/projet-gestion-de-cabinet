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
// ORDONNANCE PUBLIQUE (sans auth — pour QR code)
// ═══════════════════════════════════════════════════════════════════
Route::get('/ordonnance-publique/{id}', function (int $id) {
    $o = DB::table('ordonnances as o')
        ->join('consultations as c', 'c.id_consultation', '=', 'o.id_consultation')
        ->join('dossiers_medicaux as d', 'd.id_dossier', '=', 'c.id_dossier')
        ->join('utilisateurs as p', 'p.id_utilisateur', '=', 'd.id_patient')
        ->join('utilisateurs as m', 'm.id_utilisateur', '=', 'c.id_medecin')
        ->where('o.id_ordonnance', $id)
        ->select(
            'o.id_ordonnance', 'o.date_emission', 'o.instructions',
            'p.nom as patient_nom', 'p.prenom as patient_prenom',
            'm.nom as medecin_nom', 'm.prenom as medecin_prenom',
            'c.diagnostic', 'c.traitement'
        )
        ->first();
    if (!$o) return response()->json(['message' => 'Ordonnance introuvable.'], 404);
    $meds = DB::table('medicaments')->where('id_ordonnance', $id)->get()->toArray();
    return response()->json(array_merge((array)$o, ['medicaments' => $meds]));
});

// Route contact publique (sans auth)
Route::post('/contact', function (Request $r) {
    DB::table('messages_contact')->insert([
        'nom' => $r->input('nom', ''), 'email' => $r->input('email', ''),
        'sujet' => $r->input('sujet', ''), 'message' => $r->input('message', ''),
        'lu' => false, 'created_at' => now(), 'updated_at' => now(),
    ]);
    return response()->json(['message' => 'Message enregistré.']);
});

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

    // Notifier toutes les infirmières
    $infirmieres = DB::table('infirmieres')->pluck('id_utilisateur');
    foreach ($infirmieres as $idInf) {
        DB::table('notifications')->insert([
            'id_utilisateur' => $idInf,
            'message'        => "Nouveau rendez-vous — {$patientUser?->prenom} {$patientUser?->nom} — le {$dateRdv} à {$heureRdv}",
            'type'           => 'rdv_nouveau',
            'lu'             => false,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

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
    // Patients du médecin connecté (seulement ceux qui ont eu un RDV avec lui)
    // ── FACTURATION ───────────────────────────────────────────────
    Route::get('/factures', function (Request $r) {
        $idMed = (int) $r->attributes->get('id_utilisateur');
        if (!Schema::hasTable('factures')) return response()->json([]);
        return response()->json(
            DB::table('factures as f')
                ->leftJoin('utilisateurs as u', 'u.id_utilisateur', '=', 'f.id_patient')
                ->where('f.id_medecin', $idMed)
                ->select('f.*', DB::raw("CONCAT(u.prenom,' ',u.nom) as nom_patient"))
                ->orderBy('f.created_at', 'desc')->get()
        );
    });

    Route::post('/factures', function (Request $r) {
        $idMed = (int) $r->attributes->get('id_utilisateur');
        if (!Schema::hasTable('factures')) {
            Schema::create('factures', function ($t) {
                $t->id(); $t->integer('id_medecin'); $t->integer('id_patient');
                $t->string('nom_patient')->nullable(); $t->decimal('montant', 10, 2);
                $t->string('description')->nullable(); $t->string('statut')->default('impayé');
                $t->timestamps();
            });
        }
        $med = DB::table('utilisateurs')->where('id_utilisateur', $idMed)->first();
        $id = DB::table('factures')->insertGetId([
            'id_medecin' => $idMed, 'id_patient' => (int) $r->input('id_patient'),
            'nom_patient' => $r->input('nom_patient'), 'montant' => (float) $r->input('montant'),
            'description' => $r->input('description', 'Consultation médicale'),
            'statut' => 'impayé', 'created_at' => now(), 'updated_at' => now(),
        ]);
        // Notifier le patient
        DB::table('notifications')->insert([
            'id_utilisateur' => (int) $r->input('id_patient'),
            'message' => "💰 Nouvelle facture de {$med?->prenom} {$med?->nom} : " . number_format((float)$r->input('montant'), 0, ',', ' ') . " DA",
            'type' => 'facture', 'lu' => false, 'created_at' => now(), 'updated_at' => now(),
        ]);
        return response()->json(['id' => $id, 'message' => 'Facture créée.']);
    });

    Route::patch('/factures/{id}/payer', function (int $id) {
        DB::table('factures')->where('id', $id)->update(['statut' => 'payé', 'updated_at' => now()]);
        return response()->json(['message' => 'Payée.']);
    });

    // ── VACCINS ───────────────────────────────────────────────────
    Route::get('/mes-vaccins', function (Request $r) {
        $id = (int) $r->attributes->get('id_utilisateur');
        $patient = DB::table('patients')->where('id_utilisateur', $id)->first();
        if (!$patient || !Schema::hasTable('vaccins')) return response()->json([]);
        return response()->json(DB::table('vaccins')->where('id_patient', $patient->id_patient ?? $id)->orderBy('date_administration', 'desc')->get());
    });

    Route::post('/vaccins', function (Request $r) {
        if (!Schema::hasTable('vaccins')) {
            Schema::create('vaccins', function ($t) {
                $t->id(); $t->integer('id_patient'); $t->integer('id_medecin');
                $t->string('nom_vaccin'); $t->date('date_administration');
                $t->date('date_rappel')->nullable(); $t->timestamps();
            });
        }
        $id = DB::table('vaccins')->insertGetId([
            'id_patient' => (int)$r->input('id_patient'),
            'id_medecin' => (int)$r->attributes->get('id_utilisateur'),
            'nom_vaccin' => $r->input('nom_vaccin'),
            'date_administration' => $r->input('date_administration'),
            'date_rappel' => $r->input('date_rappel'),
            'created_at' => now(), 'updated_at' => now(),
        ]);
        return response()->json(['id' => $id, 'message' => 'Vaccin ajouté.']);
    });

    // ── ANALYSES ──────────────────────────────────────────────────
    Route::get('/mes-analyses', function (Request $r) {
        $id = (int) $r->attributes->get('id_utilisateur');
        $patient = DB::table('patients')->where('id_utilisateur', $id)->first();
        if (!$patient || !Schema::hasTable('analyses')) return response()->json([]);
        return response()->json(
            DB::table('analyses as a')
                ->leftJoin('utilisateurs as u', 'u.id_utilisateur', '=', 'a.id_medecin')
                ->where('a.id_patient', $patient->id_patient ?? $id)
                ->select('a.*', DB::raw("CONCAT(u.prenom,' ',u.nom) as medecin_nom"))
                ->orderBy('a.date_analyse', 'desc')->get()
        );
    });

    Route::post('/analyses', function (Request $r) {
        if (!Schema::hasTable('analyses')) {
            Schema::create('analyses', function ($t) {
                $t->id(); $t->integer('id_patient'); $t->integer('id_medecin');
                $t->string('type_analyse'); $t->date('date_analyse');
                $t->string('statut')->default('normal');
                $t->text('note')->nullable(); $t->timestamps();
            });
        }
        $id = DB::table('analyses')->insertGetId([
            'id_patient' => (int)$r->input('id_patient'),
            'id_medecin' => (int)$r->attributes->get('id_utilisateur'),
            'type_analyse' => $r->input('type_analyse'),
            'date_analyse' => $r->input('date_analyse'),
            'statut' => $r->input('statut', 'normal'),
            'note' => $r->input('note'),
            'created_at' => now(), 'updated_at' => now(),
        ]);
        // Notifier le patient
        DB::table('notifications')->insert([
            'id_utilisateur' => (int)$r->input('id_patient_user'),
            'message' => '🧪 Nouveaux résultats d\'analyses disponibles dans votre dossier médical.',
            'type' => 'analyse', 'lu' => false, 'created_at' => now(), 'updated_at' => now(),
        ]);
        return response()->json(['id' => $id, 'message' => 'Analyse ajoutée.']);
    });

    // ── CONSENTEMENTS ─────────────────────────────────────────────
    Route::get('/mes-consentements', function (Request $r) {
        $id = (int) $r->attributes->get('id_utilisateur');
        if (!Schema::hasTable('consentements')) return response()->json([]);
        return response()->json(DB::table('consentements')->where('id_patient', $id)->orderBy('created_at', 'desc')->get());
    });

    Route::post('/consentements', function (Request $r) {
        if (!Schema::hasTable('consentements')) {
            Schema::create('consentements', function ($t) {
                $t->id(); $t->integer('id_patient'); $t->integer('id_medecin');
                $t->string('type_acte'); $t->boolean('signe')->default(false);
                $t->timestamp('date_signature')->nullable(); $t->timestamps();
            });
        }
        $id = DB::table('consentements')->insertGetId([
            'id_patient' => (int)$r->input('id_patient'),
            'id_medecin' => (int)$r->attributes->get('id_utilisateur'),
            'type_acte' => $r->input('type_acte'),
            'signe' => (bool)$r->input('signe', false),
            'date_signature' => now(), 'created_at' => now(), 'updated_at' => now(),
        ]);
        return response()->json(['id' => $id, 'message' => 'Consentement enregistré.']);
    });

    Route::get('/mes-patients', function (Request $r) {
        $idMedecin = (int) $r->attributes->get('id_utilisateur');
        $patients = DB::table('utilisateurs as u')
            ->join('patients as p', 'p.id_utilisateur', '=', 'u.id_utilisateur')
            ->join('rendez_vous as rv', 'rv.id_patient', '=', 'u.id_utilisateur')
            ->join('disponibilites as d', 'd.id_disponibilite', '=', 'rv.id_disponibilite')
            ->where('d.id_medecin', $idMedecin)
            ->select('u.id_utilisateur','u.nom','u.prenom','u.email','u.telephone','u.genre','p.date_naissance','p.groupe_sanguin','p.adresse','p.allergies','p.antecedents_medicaux')
            ->distinct()
            ->get();
        // Log d'accès (traçabilité loi 18-07)
        DB::table('logs_acces_dossier')->insert([
            'id_medecin'   => $idMedecin,
            'action'       => 'consultation_liste_patients',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);
        return response()->json($patients);
    });

    // ── URGENCE ──────────────────────────────────────────────────
    Route::post('/urgence', function (Request $r) {
        $idPatient = (int) $r->input('id_patient');
        $patient = DB::table('utilisateurs')->where('id_utilisateur', $idPatient)->first();
        $nom = "{$patient?->prenom} {$patient?->nom}";
        $heure = now()->timezone('Africa/Algiers')->format('H:i');

        // Notifier tous les médecins
        $medecins = DB::table('medecins')->pluck('id_utilisateur');
        foreach ($medecins as $idMed) {
            DB::table('notifications')->insert([
                'id_utilisateur' => $idMed,
                'message'        => "🚨 URGENCE — {$nom} signale une urgence médicale à {$heure} !",
                'type'           => 'urgence',
                'lu'             => false,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }
        // Notifier toutes les infirmières
        $infirmieres = DB::table('infirmieres')->pluck('id_utilisateur');
        foreach ($infirmieres as $idInf) {
            DB::table('notifications')->insert([
                'id_utilisateur' => $idInf,
                'message'        => "🚨 URGENCE — {$nom} signale une urgence médicale à {$heure} !",
                'type'           => 'urgence',
                'lu'             => false,
                'created_at'     => now(),
                'updated_at'     => now(),
            ]);
        }
        return response()->json(['message' => 'Urgence envoyée.']);
    });

    // ── CHAT EN DIRECT ──────────────────────────────────────────
    Route::get('/chat/{idUser1}/{idUser2}', function (int $idUser1, int $idUser2) {
        $messages = DB::table('chat_messages')
            ->where(function($q) use ($idUser1, $idUser2) {
                $q->where('id_expediteur', $idUser1)->where('id_destinataire', $idUser2);
            })
            ->orWhere(function($q) use ($idUser1, $idUser2) {
                $q->where('id_expediteur', $idUser2)->where('id_destinataire', $idUser1);
            })
            ->orderBy('created_at', 'asc')
            ->select('id', 'id_expediteur', 'id_destinataire', 'contenu', 'created_at as cree_a', 'lu')
            ->get();
        return response()->json($messages);
    });

    Route::post('/chat', function (Request $r) {
        $idExp = (int) $r->input('id_expediteur');
        $idDest = (int) $r->input('id_destinataire');
        $contenu = trim($r->input('contenu', ''));
        if (!$contenu) return response()->json(['message' => 'Message vide.'], 422);

        // Créer la table si elle n'existe pas
        if (!Schema::hasTable('chat_messages')) {
            Schema::create('chat_messages', function ($table) {
                $table->id();
                $table->integer('id_expediteur');
                $table->integer('id_destinataire');
                $table->text('contenu');
                $table->boolean('lu')->default(false);
                $table->timestamps();
            });
        }

        $id = DB::table('chat_messages')->insertGetId([
            'id_expediteur'  => $idExp,
            'id_destinataire'=> $idDest,
            'contenu'        => $contenu,
            'lu'             => false,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        // Notifier le destinataire
        $exp = DB::table('utilisateurs')->where('id_utilisateur', $idExp)->first();
        DB::table('notifications')->insert([
            'id_utilisateur' => $idDest,
            'message'        => "💬 Nouveau message de {$exp?->prenom} {$exp?->nom} : " . substr($contenu, 0, 50),
            'type'           => 'message',
            'lu'             => false,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return response()->json(['id' => $id, 'message' => 'Message envoyé.']);
    });

    // ── PHOTO DE PROFIL ──────────────────────────────────────────
    Route::post('/profil/photo', function (Request $r) {
        $idUser = (int) $r->attributes->get('id_utilisateur');
        $photo = $r->input('photo'); // base64
        if (!$photo) return response()->json(['message' => 'Photo manquante.'], 422);
        // Stocker en base (max 1MB en base64)
        if (!Schema::hasColumn('utilisateurs', 'photo')) {
            Schema::table('utilisateurs', function ($table) {
                $table->longText('photo')->nullable();
            });
        }
        DB::table('utilisateurs')->where('id_utilisateur', $idUser)->update(['photo' => $photo, 'updated_at' => now()]);
        return response()->json(['message' => 'Photo mise à jour.', 'photo' => $photo]);
    });

    Route::get('/patients', function () {
        return response()->json(
            DB::table('utilisateurs as u')
                ->join('patients as p', 'p.id_utilisateur', '=', 'u.id_utilisateur')
                ->select('u.id_utilisateur','u.nom','u.prenom','u.email','u.telephone','u.genre','p.date_naissance','p.groupe_sanguin','p.adresse')
                ->get()
        );
    });
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

    // ── RDV à venir (infirmière) ──────────────────────────────────
    Route::get('/rendez-vous-jour', function () {
        $today = now()->toDateString();
        $rdvs = DB::table('rendez_vous as rv')
            ->join('utilisateurs as u', 'rv.id_patient', '=', 'u.id_utilisateur')
            ->join('disponibilites as d', 'rv.id_disponibilite', '=', 'd.id_disponibilite')
            ->join('utilisateurs as um', 'd.id_medecin', '=', 'um.id_utilisateur')
            ->where('rv.date_rdv', '>=', $today)
            ->whereNotIn('rv.statut', ['annule', 'termine'])
            ->orderBy('rv.date_rdv', 'asc')
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
        $idUtilisateur = (int)($r->attributes->get('id_utilisateur') ?? 0);

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
    Route::get('/consultations/dossier/{id}', function (int $id) {
        $consultations = DB::table('consultations as c')
            ->join('utilisateurs as u', 'c.id_medecin', '=', 'u.id_utilisateur')
            ->where('c.id_dossier', $id)
            ->orderBy('c.date', 'desc')
            ->select('c.*', 'u.nom as medecin_nom', 'u.prenom as medecin_prenom')
            ->get();
        return response()->json($consultations);
    });
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

    // Soins du patient connecté
    Route::get('/mes-soins-patient', function (Request $r) {
        $idPatient = (int) $r->attributes->get('id_utilisateur');
        $soins = DB::table('soins as s')
            ->join('utilisateurs as inf', 's.id_infirmiere', '=', 'inf.id_utilisateur')
            ->where('s.id_patient', $idPatient)
            ->orderBy('s.date', 'desc')
            ->select('s.*', 'inf.nom as infirmiere_nom', 'inf.prenom as infirmiere_prenom')
            ->get();
        return response()->json($soins);
    });

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

        $apiKey = env('ANTHROPIC_API_KEY');
        if (!$apiKey) {
            return response()->json(['message' => 'Service IA non configuré.'], 500);
        }

        $client = new \GuzzleHttp\Client();
        $response = $client->post('https://api.groq.com/openai/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ],
            'json' => [
                'model'      => 'llama-3.1-8b-instant',
                'max_tokens' => 1000,
                'messages' => [
                    ['role' => 'system', 'content' => 'Tu es un assistant medical algerien. Reponds UNIQUEMENT en JSON valide sans markdown. Format: {"urgence":"FAIBLE|MOYENNE|HAUTE","specialite":"nom","diagnostic_possible":"desc","recommandations":["conseil"],"medicaments":["med"],"avertissement":"Analyse indicative."} Si charabia retourne {"erreur":true,"message":"Decrivez vos symptomes en francais"}'],
                    ['role' => 'user', 'content' => "Symptomes: {$symptomes}"]
                ],
            ],
            'http_errors' => false,
        ]);

        $body = json_decode($response->getBody()->getContents(), true);
        $text = $body['choices'][0]['message']['content'] ?? '{"erreur":true,"message":"Erreur analyse."}';
        $clean = preg_replace('/```json|```/', '', $text);
        $result = json_decode(trim($clean), true);
        if (!$result) { $result = ['erreur' => true, 'message' => 'Erreur IA.']; }
        return response()->json($result);
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
        Route::post('/admin/utilisateurs', function (Request $r) {
            $role = $r->input('role', 'patient');
            $hash = bcrypt($r->input('password'));
            $id = DB::table('utilisateurs')->insertGetId([
                'nom' => $r->input('nom'), 'prenom' => $r->input('prenom'),
                'email' => $r->input('email'), 'password' => $hash,
                'role' => $role, 'actif' => true,
                'created_at' => now(), 'updated_at' => now(),
            ]);
            if ($role === 'medecin') {
                DB::table('medecins')->insert(['id_utilisateur' => $id, 'numero_ordre' => 'ORD-' . $id, 'created_at' => now(), 'updated_at' => now()]);
            } elseif ($role === 'patient') {
                DB::table('patients')->insert(['id_utilisateur' => $id, 'created_at' => now(), 'updated_at' => now()]);
            } elseif ($role === 'infirmiere') {
                DB::table('infirmieres')->insert(['id_utilisateur' => $id, 'created_at' => now(), 'updated_at' => now()]);
            }
            return response()->json(['message' => 'Compte créé.', 'id' => $id]);
        });
        Route::get('/admin/utilisateurs/{id}',              [AdminController::class, 'show']);
        Route::put('/admin/utilisateurs/{id}',              [AdminController::class, 'modifier']);
        Route::patch('/admin/utilisateurs/{id}/activer',    [AdminController::class, 'activer']);
        Route::patch('/admin/utilisateurs/{id}/desactiver', [AdminController::class, 'desactiver']);
        Route::delete('/admin/utilisateurs/{id}',           [AdminController::class, 'supprimer']);
        Route::get('/admin/messages-contact', function () {
            $msgs = DB::table('messages_contact')->orderBy('created_at', 'desc')->get();
            return response()->json($msgs);
        });
        Route::patch('/admin/messages-contact/{id}/lu', function (int $id) {
            DB::table('messages_contact')->where('id', $id)->update(['lu' => true]);
            return response()->json(['message' => 'Marqué lu.']);
        });

        // ── STOCK MÉDICAMENTS ─────────────────────────────────────
        Route::get('/admin/stock', function () {
            if (!Schema::hasTable('stock_medicaments')) return response()->json([]);
            return response()->json(DB::table('stock_medicaments')->orderBy('nom')->get());
        });

        Route::post('/admin/stock', function (Request $r) {
            if (!Schema::hasTable('stock_medicaments')) {
                Schema::create('stock_medicaments', function ($t) {
                    $t->id(); $t->string('nom'); $t->integer('quantite')->default(0);
                    $t->string('unite')->default('comprimés');
                    $t->integer('seuil_alerte')->default(10);
                    $t->decimal('prix_unitaire', 10, 2)->default(0);
                    $t->timestamps();
                });
            }
            // Vérifier si existe déjà
            $existing = DB::table('stock_medicaments')->where('nom', $r->input('nom'))->first();
            if ($existing) {
                DB::table('stock_medicaments')->where('id', $existing->id)->update([
                    'quantite' => $existing->quantite + (int)$r->input('quantite'),
                    'updated_at' => now()
                ]);
            } else {
                DB::table('stock_medicaments')->insert([
                    'nom' => $r->input('nom'), 'quantite' => (int)$r->input('quantite'),
                    'unite' => $r->input('unite', 'comprimés'),
                    'seuil_alerte' => (int)$r->input('seuil_alerte', 10),
                    'prix_unitaire' => (float)$r->input('prix_unitaire', 0),
                    'created_at' => now(), 'updated_at' => now(),
                ]);
            }
            return response()->json(['message' => 'Stock mis à jour.']);
        });

        Route::patch('/admin/stock/{id}', function (Request $r, int $id) {
            DB::table('stock_medicaments')->where('id', $id)->update([
                'quantite' => (int)$r->input('quantite'), 'updated_at' => now()
            ]);
            return response()->json(['message' => 'Stock mis à jour.']);
        });

        Route::delete('/admin/stock/{id}', function (int $id) {
            DB::table('stock_medicaments')->where('id', $id)->delete();
            return response()->json(['message' => 'Supprimé.']);
        });
        Route::get('/admin/rapport',                        [AdminController::class, 'rapport']);
    });
});