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

// ═══════════════════════════════════════
// ROUTES PUBLIQUES (sans auth)
// ═══════════════════════════════════════
Route::post('/register',        [AuthController::class, 'register']);
Route::post('/login',           [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']); // Réinitialiser mot de passe

// ═══════════════════════════════════════
// ROUTES PROTÉGÉES (avec auth)
// ═══════════════════════════════════════
Route::middleware('auth.middleware')->group(function () {

    // LOGOUT
    Route::post('/logout', [AuthController::class, 'logout']);

    // UTILISATEUR
    Route::get('/utilisateurs/{id}',              [UtilisateurController::class, 'show']);
    Route::put('/utilisateurs/{id}',              [UtilisateurController::class, 'update']);
    Route::put('/utilisateurs/{id}/mot-de-passe', [UtilisateurController::class, 'changerMotDePasse']);

    // PATIENTS
    Route::get('/patients',         [PatientController::class, 'index']);
    Route::post('/patients',        [PatientController::class, 'store']);
    Route::get('/patients/{id}',    [PatientController::class, 'show']);
    Route::delete('/patients/{id}',              [PatientController::class, 'destroy']);
    Route::patch('/patients/{id}/medecin-traitant', [PatientController::class, 'assignerMedecin']); // +assignerMedecin() Infirmiere

    // MEDECINS — + ?specialite=X pour filtrer
    Route::get('/medecins',         [MedecinController::class, 'index']);
    Route::post('/medecins',        [MedecinController::class, 'store']);
    Route::get('/medecins/{id}',    [MedecinController::class, 'show']);
    Route::delete('/medecins/{id}', [MedecinController::class, 'destroy']);

    // INFIRMIERES
    Route::get('/infirmieres',             [InfirmiereController::class, 'index']);
    Route::post('/infirmieres',            [InfirmiereController::class, 'store']);
    Route::get('/infirmieres/{id}',        [InfirmiereController::class, 'show']);
    Route::delete('/infirmieres/{id}',     [InfirmiereController::class, 'destroy']);
    Route::post('/infirmieres/{id}/soins', [InfirmiereController::class, 'effectuerSoin']);
    Route::get('/infirmieres/{id}/soins',  [InfirmiereController::class, 'soins']);

    // ADMIN (rôle admin seulement)
    Route::middleware('auth.middleware:admin')->group(function () {
        Route::get('/admin/utilisateurs',                   [AdminController::class, 'utilisateurs']);
        Route::get('/admin/utilisateurs/{id}',              [AdminController::class, 'show']);
        Route::put('/admin/utilisateurs/{id}',              [AdminController::class, 'modifier']);
        Route::patch('/admin/utilisateurs/{id}/activer',    [AdminController::class, 'activer']);
        Route::patch('/admin/utilisateurs/{id}/desactiver', [AdminController::class, 'desactiver']);
        Route::delete('/admin/utilisateurs/{id}',           [AdminController::class, 'supprimer']);
        Route::get('/admin/rapport',                        [AdminController::class, 'rapport']);
    });

    // DISPONIBILITES
    Route::post('/disponibilites',             [DisponibiliteController::class, 'store']);
    Route::get('/disponibilites/medecin/{id}', [DisponibiliteController::class, 'byMedecin']);
    Route::delete('/disponibilites/{id}',      [DisponibiliteController::class, 'destroy']);

    // RENDEZ-VOUS
    Route::get('/rendez-vous',                       [RendezVousController::class, 'index']);
    Route::post('/rendez-vous',                      [RendezVousController::class, 'store']);
    Route::get('/rendez-vous/patient/{id}',          [RendezVousController::class, 'byPatient']);
    Route::get('/rendez-vous/medecin/{id}',          [RendezVousController::class, 'byMedecin']);
    Route::get('/rendez-vous/date/{date}',           [RendezVousController::class, 'byDate']); // séquence Infirmière
    Route::get('/rendez-vous/{id}',                  [RendezVousController::class, 'show']);
    Route::patch('/rendez-vous/{id}/confirmer',      [RendezVousController::class, 'confirmer']);
    Route::patch('/rendez-vous/{id}/annuler',        [RendezVousController::class, 'annuler']);
    Route::patch('/rendez-vous/{id}/modifier',       [RendezVousController::class, 'modifier']);
    Route::patch('/rendez-vous/{id}/patient-arrive', [RendezVousController::class, 'patientArrive']);
    Route::patch('/rendez-vous/{id}/terminer',       [RendezVousController::class, 'terminer']);

    // DOSSIERS MEDICAUX
    Route::post('/dossiers',             [DossierMedicalController::class, 'store']);
    Route::get('/dossiers/patient/{id}', [DossierMedicalController::class, 'byPatient']);
    Route::get('/dossiers/{id}',         [DossierMedicalController::class, 'show']);

    // CONSULTATIONS
    Route::post('/consultations',             [ConsultationController::class, 'store']);
    Route::get('/consultations/dossier/{id}', [ConsultationController::class, 'byDossier']);
    Route::get('/consultations/{id}',         [ConsultationController::class, 'show']);

    // ORDONNANCES
    Route::post('/ordonnances',                  [OrdonnanceController::class, 'store']);
    Route::get('/ordonnances/patient/{id}',      [OrdonnanceController::class, 'byPatient']); // +consulterOrdonnances() Patient
    Route::get('/ordonnances/consultation/{id}', [OrdonnanceController::class, 'byConsultation']);
    Route::get('/ordonnances/{id}',              [OrdonnanceController::class, 'show']);
    Route::put('/ordonnances/{id}',              [OrdonnanceController::class, 'update']);

    // MEDICAMENTS
    Route::post('/medicaments',                [MedicamentController::class, 'store']);
    Route::get('/medicaments/ordonnance/{id}', [MedicamentController::class, 'byOrdonnance']);
    Route::delete('/medicaments/{id}',         [MedicamentController::class, 'destroy']);

    // SOINS
    Route::post('/soins',                [SoinsController::class, 'store']);
    Route::get('/soins/{id}',            [SoinsController::class, 'show']);
    Route::get('/soins/patient/{id}',    [SoinsController::class, 'byPatient']);
    Route::get('/soins/infirmiere/{id}', [SoinsController::class, 'byInfirmiere']);

    // NOTIFICATIONS
    Route::get('/notifications/{id}', function (int $id) {
        return response()->json(
            DB::table('notifications')
                ->where('id_utilisateur', $id)
                ->orderBy('created_at', 'desc')
                ->get()
        );
    });

    Route::patch('/notifications/{id}/lu', function (int $id) {
        DB::table('notifications')->where('id_notification', $id)->update(['lu' => true]);
        return response()->json(['message' => 'Notification marquée comme lue.']);
    });
});