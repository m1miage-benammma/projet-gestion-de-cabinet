import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../../shared/header/header.component";
import { AuthService } from "../../core/services/auth.service";
import { ApiService } from "../../core/services/api.service";
import { ToastService } from "../../core/services/toast.service";

@Component({
  selector: "app-admin",
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: "./admin.component.html"
})
export class AdminComponent implements OnInit {

  TABS = [
    { id: "dashboard",    label: "Tableau de bord", icon: "bar-chart-2" },
    { id: "utilisateurs", label: "Utilisateurs",    icon: "users" },
  ];

  activeTab = "dashboard";
  sidebarOpen = false;
  loading: any = {};
  successMsg = "";
  errorMsg = "";

  utilisateurs: any[] = [];
  rapport: any = null;
  animatedStats: any = { rdv: 0, patients: 0, medecins: 0, consultations: 0 };

  // Formulaire création
  showCreateForm = false;
  createRole = "medecin";
  createNom = ""; createPrenom = ""; createEmail = ""; createTelephone = "";
  createGenre = "M"; createPassword = "";
  createSpecialite = ""; createNumeroOrdre = ""; createNumeroEmploye = "";
  createLoading = false; createError = ""; createSuccess = "";

  // Filtres
  filterRole = "";
  filterSearch = "";

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public toast: ToastService
  ) {}

  ngOnInit() {
    this.chargerRapport();
    this.chargerUtilisateurs();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.successMsg = "";
    this.errorMsg = "";
    if (tab === "utilisateurs") this.chargerUtilisateurs();
    if (tab === "dashboard")    this.chargerRapport();
  }

  chargerUtilisateurs() {
    this.loading["users"] = true;
    this.api.getUtilisateurs().subscribe({
      next: u => { this.utilisateurs = u; this.loading["users"] = false; },
      error: () => this.loading["users"] = false
    });
  }

  chargerRapport() {
    this.api.getRapport().subscribe({
      next: r => {
        this.rapport = r;
        this.animateStats(r);
      },
      error: () => {}
    });
  }

  animateStats(r: any) {
    const targets = {
      rdv: r?.total_rdv || 0,
      patients: r?.total_patients || 0,
      medecins: r?.total_medecins || 0,
      consultations: r?.total_consultations || 0
    };
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      this.animatedStats.rdv = Math.round(targets.rdv * ease);
      this.animatedStats.patients = Math.round(targets.patients * ease);
      this.animatedStats.medecins = Math.round(targets.medecins * ease);
      this.animatedStats.consultations = Math.round(targets.consultations * ease);
      if (step >= steps) clearInterval(timer);
    }, interval);
  }

  creerCompte() {
    if (!this.createNom || !this.createPrenom || !this.createEmail || !this.createPassword) {
      this.createError = "Prénom, nom, email et mot de passe sont obligatoires.";
      return;
    }
    this.createLoading = true;
    this.createError = "";
    this.createSuccess = "";
    this.api.creerCompte({
      nom: this.createNom, prenom: this.createPrenom,
      email: this.createEmail, telephone: this.createTelephone,
      genre: this.createGenre, mot_de_passe: this.createPassword,
      role: this.createRole,
      specialite: this.createSpecialite,
      numero_ordre: this.createNumeroOrdre,
      numero_employe: this.createNumeroEmploye,
    }).subscribe({
      next: () => {
        this.createLoading = false;
        this.createSuccess = "Compte créé avec succès.";
        this.toast.success("Compte créé.");
        this.resetCreateForm();
        this.chargerUtilisateurs();
      },
      error: e => {
        this.createLoading = false;
        this.createError = e.error?.message || "Erreur lors de la création.";
      }
    });
  }

  resetCreateForm() {
    this.createNom = ""; this.createPrenom = ""; this.createEmail = "";
    this.createTelephone = ""; this.createPassword = ""; this.createSpecialite = "";
    this.createNumeroOrdre = ""; this.createNumeroEmploye = "";
  }

  activerCompte(id: number) {
    this.api.activerCompte(id).subscribe({
      next: () => { this.toast.success("Compte activé."); this.chargerUtilisateurs(); },
      error: () => this.toast.error("Erreur activation.")
    });
  }

  desactiverCompte(id: number) {
    this.api.desactiverCompte(id).subscribe({
      next: () => { this.toast.success("Compte désactivé."); this.chargerUtilisateurs(); },
      error: () => this.toast.error("Erreur désactivation.")
    });
  }

  supprimerCompte(id: number) {
    if (!confirm("Supprimer définitivement ce compte ? Cette action est irréversible.")) return;
    this.api.supprimerCompte(id).subscribe({
      next: () => { this.toast.success("Compte supprimé."); this.chargerUtilisateurs(); },
      error: () => this.toast.error("Erreur suppression.")
    });
  }

  utilisateursFiltres(): any[] {
    return this.utilisateurs.filter(u => {
      const matchRole   = !this.filterRole   || u.role === this.filterRole;
      const matchSearch = !this.filterSearch || `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(this.filterSearch.toLowerCase());
      return matchRole && matchSearch;
    });
  }

  formatRole(r: string): string {
    const m: any = { medecin: "Médecin", infirmiere: "Infirmière", patient: "Patient", admin: "Administrateur" };
    return m[r] || r;
  }

  roleColor(r: string): { bg: string; text: string } {
    const m: any = {
      medecin:    { bg: "var(--primary-light)", text: "var(--primary)" },
      infirmiere: { bg: "var(--success-bg)",    text: "var(--success)" },
      patient:    { bg: "var(--purple-bg)",      text: "var(--purple)" },
      admin:      { bg: "var(--danger-bg)",      text: "var(--danger)" },
    };
    return m[r] || { bg: "var(--bg)", text: "var(--muted)" };
  }

  getBarWidth(val: number, total: number): string {
    if (!total) return '0%';
    return Math.round((val / total) * 100) + '%';
  }

  getDonutDash(val: number, total: number): number {
    if (!total) return 0;
    return Math.round((val / total) * 314);
  }

  getDonutOffset(med: number, total: number): number {
    if (!total) return 0;
    return -Math.round((med / total) * 314);
  }

  getDonutOffset2(med: number, inf: number, total: number): number {
    if (!total) return 0;
    return -Math.round(((med + inf) / total) * 314);
  }

  getStatutColor(statut: string): string {
    const s = (statut || '').toLowerCase();
    if (s.includes('attente')) return '#f39c12';
    if (s.includes('confirm') || s.includes('arrive')) return '#27ae60';
    if (s.includes('termin')) return '#0A3D62';
    if (s.includes('annul')) return '#e74c3c';
    return '#6c757d';
  }
}