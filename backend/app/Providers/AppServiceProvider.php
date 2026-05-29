<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

// Auth
use App\Modules\Auth\Services\AuthService;

// Utilisateur
use App\Modules\Utilisateur\Repository\UtilisateurRepository;
use App\Modules\Utilisateur\Manager\UtilisateurManager;
use App\Modules\Utilisateur\Services\UtilisateurService;

// Patient
use App\Modules\Patient\Repository\PatientRepository;
use App\Modules\Patient\Manager\PatientManager;
use App\Modules\Patient\Services\PatientService;

// Medecin
use App\Modules\Medecin\Repository\MedecinRepository;
use App\Modules\Medecin\Manager\MedecinManager;
use App\Modules\Medecin\Services\MedecinService;

// Infirmiere
use App\Modules\Infirmiere\Repository\InfirmiereRepository;
use App\Modules\Infirmiere\Manager\InfirmiereManager;
use App\Modules\Infirmiere\Services\InfirmiereService;

// Admin
use App\Modules\Admin\Services\AdminService;

// Disponibilite
use App\Modules\Disponibilite\Repository\DisponibiliteRepository;
use App\Modules\Disponibilite\Manager\DisponibiliteManager;
use App\Modules\Disponibilite\Services\DisponibiliteService;

// RendezVous
use App\Modules\RendezVous\Repository\RendezVousRepository;
use App\Modules\RendezVous\Manager\RendezVousManager;
use App\Modules\RendezVous\Services\RendezVousService;

// DossierMedical
use App\Modules\DossierMedical\Repository\DossierMedicalRepository;
use App\Modules\DossierMedical\Manager\DossierMedicalManager;
use App\Modules\DossierMedical\Services\DossierMedicalService;

// Consultation
use App\Modules\Consultation\Repository\ConsultationRepository;
use App\Modules\Consultation\Manager\ConsultationManager;
use App\Modules\Consultation\Services\ConsultationService;

// Ordonnance
use App\Modules\Ordonnance\Repository\OrdonnanceRepository;
use App\Modules\Ordonnance\Manager\OrdonnanceManager;
use App\Modules\Ordonnance\Services\OrdonnanceService;

// Medicament
use App\Modules\Medicament\Repository\MedicamentRepository;
use App\Modules\Medicament\Manager\MedicamentManager;
use App\Modules\Medicament\Services\MedicamentService;

// Soins
use App\Modules\Soins\Repository\SoinsRepository;
use App\Modules\Soins\Manager\SoinsManager;
use App\Modules\Soins\Services\SoinsService;

final class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Auth
        $this->app->singleton(AuthService::class);

        // Utilisateur
        $this->app->singleton(UtilisateurRepository::class);
        $this->app->singleton(UtilisateurManager::class, fn ($app) => new UtilisateurManager(
            $app->make(UtilisateurRepository::class)
        ));
        $this->app->singleton(UtilisateurService::class, fn ($app) => new UtilisateurService(
            $app->make(UtilisateurManager::class)
        ));

        // Patient
        $this->app->singleton(PatientRepository::class);
        $this->app->singleton(PatientManager::class, fn ($app) => new PatientManager(
            $app->make(PatientRepository::class)
        ));
        $this->app->singleton(PatientService::class, fn ($app) => new PatientService(
            $app->make(PatientManager::class)
        ));

        // Medecin
        $this->app->singleton(MedecinRepository::class);
        $this->app->singleton(MedecinManager::class, fn ($app) => new MedecinManager(
            $app->make(MedecinRepository::class)
        ));
        $this->app->singleton(MedecinService::class, fn ($app) => new MedecinService(
            $app->make(MedecinManager::class)
        ));

        // Infirmiere
        $this->app->singleton(InfirmiereRepository::class);
        $this->app->singleton(InfirmiereManager::class, fn ($app) => new InfirmiereManager(
            $app->make(InfirmiereRepository::class)
        ));
        $this->app->singleton(InfirmiereService::class, fn ($app) => new InfirmiereService(
            $app->make(InfirmiereManager::class)
        ));

        // Admin
        $this->app->singleton(AdminService::class);

        // Disponibilite
        $this->app->singleton(DisponibiliteRepository::class);
        $this->app->singleton(DisponibiliteManager::class, fn ($app) => new DisponibiliteManager(
            $app->make(DisponibiliteRepository::class)
        ));
        $this->app->singleton(DisponibiliteService::class, fn ($app) => new DisponibiliteService(
            $app->make(DisponibiliteManager::class)
        ));

        // RendezVous
        $this->app->singleton(RendezVousRepository::class);
        $this->app->singleton(RendezVousManager::class, fn ($app) => new RendezVousManager(
            $app->make(RendezVousRepository::class)
        ));
        $this->app->singleton(RendezVousService::class, fn ($app) => new RendezVousService(
            $app->make(RendezVousManager::class)
        ));

        // DossierMedical
        $this->app->singleton(DossierMedicalRepository::class);
        $this->app->singleton(DossierMedicalManager::class, fn ($app) => new DossierMedicalManager(
            $app->make(DossierMedicalRepository::class)
        ));
        $this->app->singleton(DossierMedicalService::class, fn ($app) => new DossierMedicalService(
            $app->make(DossierMedicalManager::class)
        ));

        // Consultation
        $this->app->singleton(ConsultationRepository::class);
        $this->app->singleton(ConsultationManager::class, fn ($app) => new ConsultationManager(
            $app->make(ConsultationRepository::class)
        ));
        $this->app->singleton(ConsultationService::class, fn ($app) => new ConsultationService(
            $app->make(ConsultationManager::class)
        ));

        // Ordonnance
        $this->app->singleton(OrdonnanceRepository::class);
        $this->app->singleton(OrdonnanceManager::class, fn ($app) => new OrdonnanceManager(
            $app->make(OrdonnanceRepository::class)
        ));
        $this->app->singleton(OrdonnanceService::class, fn ($app) => new OrdonnanceService(
            $app->make(OrdonnanceManager::class)
        ));

        // Medicament
        $this->app->singleton(MedicamentRepository::class);
        $this->app->singleton(MedicamentManager::class, fn ($app) => new MedicamentManager(
            $app->make(MedicamentRepository::class)
        ));
        $this->app->singleton(MedicamentService::class, fn ($app) => new MedicamentService(
            $app->make(MedicamentManager::class)
        ));

        // Soins
        $this->app->singleton(SoinsRepository::class);
        $this->app->singleton(SoinsManager::class, fn ($app) => new SoinsManager(
            $app->make(SoinsRepository::class)
        ));
        $this->app->singleton(SoinsService::class, fn ($app) => new SoinsService(
            $app->make(SoinsManager::class)
        ));
    }

    public function boot(): void {}
}