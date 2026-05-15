import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../../shared/header/header.component";
import { AuthService } from "../../core/services/auth.service";
import { ApiService } from "../../core/services/api.service";
import { ToastService } from "../../core/services/toast.service";

@Component({
  selector: "app-infirmiere",
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: "./infirmiere.component.html"
})
export class InfirmiereComponent implements OnInit {

  TABS = [
    { id: "accueil",   label: "Accueil",          icon: "home" },
    { id: "patients",  label: "Patients du jour",  icon: "users" },
    { id: "soins",     label: "Soins infirmiers",  icon: "activity" },
    { id: "profil",    label: "Mon profil",         icon: "user" },
  ];

  activeTab = "accueil";
  sidebarOpen = false;
  loading: any = {};
  successMsg = "";
  errorMsg = "";

  rdvJour: any[] = [];
  patients: any[] = [];
  soins: any[] = [];

  typesSoin = ["INJECTION","PANSEMENT","PERFUSION","PRISE_DE_SANG","SOINS_PLAIE","AUTRE"];

  soinPatientId = 0;
  soinType = "INJECTION";
  soinObs = "";
  soinDate = new Date().toISOString().split("T")[0];
  soinLoading = false;
  soinError = "";
  soinSuccess = "";

  profilNom = ""; profilPrenom = ""; profilTel = ""; profilEmail = "";
  profilLoading = false; profilError = ""; profilSuccess = "";

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public toast: ToastService
  ) {}

  ngOnInit() {
    this.chargerRdvJour();
    this.chargerPatients();
    this.chargerSoins();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.successMsg = "";
    this.errorMsg = "";
    if (tab === "accueil" || tab === "patients") this.chargerRdvJour();
    if (tab === "soins")    this.chargerSoins();
    if (tab === "profil") {
      const u = this.auth.user;
      this.profilNom = u?.nom || "";
      this.profilPrenom = u?.prenom || "";
      this.profilTel = u?.telephone || "";
      this.profilEmail = u?.email || "";
    }
  }

  chargerRdvJour() {
    this.loading["rdv"] = true;
    this.api.getRdvJour().subscribe({
      next: r => { this.rdvJour = r; this.loading["rdv"] = false; },
      error: () => this.loading["rdv"] = false
    });
  }

  chargerPatients() {
    this.api.getPatients().subscribe({
      next: p => this.patients = p,
      error: () => {}
    });
  }

  chargerSoins() {
    this.loading["soins"] = true;
    this.api.getSoins().subscribe({
      next: s => { this.soins = s; this.loading["soins"] = false; },
      error: () => this.loading["soins"] = false
    });
  }

  confirmerRdv(id: number) {
    this.api.confirmerRdv(id).subscribe({
      next: () => { this.toast.success("Rendez-vous confirmé."); this.chargerRdvJour(); },
      error: e => this.toast.error(e.error?.message || "Erreur confirmation.")
    });
  }

  patientArrive(id: number) {
    this.api.patientArrive(id).subscribe({
      next: () => { this.toast.success("Arrivée du patient enregistrée."); this.chargerRdvJour(); },
      error: e => this.toast.error(e.error?.message || "Erreur.")
    });
  }

  annulerRdv(id: number) {
    if (!confirm("Confirmer l'annulation de ce rendez-vous ?")) return;
    this.api.annulerRdv(id).subscribe({
      next: () => { this.toast.success("Rendez-vous annulé."); this.chargerRdvJour(); },
      error: e => this.toast.error(e.error?.message || "Erreur annulation.")
    });
  }

  enregistrerSoin() {
    if (!this.soinPatientId || !this.soinDate) {
      this.soinError = "Veuillez sélectionner un patient et une date.";
      return;
    }
    this.soinLoading = true;
    this.soinError = "";
    this.api.soin({
      id_patient:    this.soinPatientId,
      id_infirmiere: this.auth.userId(),
      type_soin:     this.soinType,
      observation:   this.soinObs,
      date:          this.soinDate
    }).subscribe({
      next: () => {
        this.soinLoading = false;
        this.soinSuccess = "Soin enregistré avec succès.";
        this.soinObs = "";
        this.toast.success("Soin enregistré.");
        this.chargerSoins();
      },
      error: e => { this.soinLoading = false; this.soinError = e.error?.message || "Erreur enregistrement."; }
    });
  }

  sauvegarderProfil() {
    this.profilLoading = true;
    this.api.updateProfil(this.auth.userId(), {
      nom: this.profilNom, prenom: this.profilPrenom,
      telephone: this.profilTel, email: this.profilEmail
    }).subscribe({
      next: () => { this.profilLoading = false; this.profilSuccess = "Profil mis à jour."; this.toast.success("Profil sauvegardé."); },
      error: () => { this.profilLoading = false; this.profilError = "Erreur sauvegarde."; }
    });
  }

  prochainRdv(): any | null {
    const enCours = this.rdvJour.filter(r => r.statut !== "annule" && r.statut !== "termine");
    return enCours.sort((a, b) => a.heure_rdv.localeCompare(b.heure_rdv))[0] || null;
  }

  countJourStatut(s: string): number { return this.rdvJour.filter(r => r.statut?.toLowerCase() === s).length; }
  countStatut(s: string): number { return this.rdvJour.filter(r => r.statut?.toLowerCase() === s).length; }

  getDate(): string {
    return new Date().toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  getBorderColor(statut: string): string {
    const colors: any = {
      en_attente: '#F59E0B', confirme: '#3B82F6',
      patient_arrive: '#16A34A', annule: '#EF4444', termine: '#94A3B8'
    };
    return colors[statut?.toLowerCase()] || '#E2E8F0';
  }

  formatSoin(t: string): string {
    const m: any = { INJECTION: "Injection", PANSEMENT: "Pansement", PERFUSION: "Perfusion", PRISE_DE_SANG: "Prise de sang", SOINS_PLAIE: "Soins de plaie", AUTRE: "Autre" };
    return m[t] || t;
  }

  formatStatut(s: string): string {
    const m: any = { en_attente: "En attente", confirme: "Confirmé", patient_arrive: "Arrivé", annule: "Annulé", termine: "Terminé" };
    return m[s?.toLowerCase()] || s;
  }

  formatTypeSoin(t: string): string {
    const m: any = { INJECTION: "Injection", PANSEMENT: "Pansement", PERFUSION: "Perfusion", PRISE_DE_SANG: "Prise de sang", SOINS_PLAIE: "Soins de plaie", AUTRE: "Autre" };
    return m[t] || t;
  }

  getDateAujourdhui(): string {
    return new Date().toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
}