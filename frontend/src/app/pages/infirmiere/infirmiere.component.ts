import { Component, OnInit, OnDestroy } from "@angular/core";
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
export class InfirmiereComponent implements OnInit, OnDestroy {

  TABS = [
    { id: "accueil",        label: "Accueil",           icon: "home" },
    { id: "patients",       label: "Rendez-vous",        icon: "calendar" },
    { id: "file-attente",   label: "File d'attente",     icon: "users" },
    { id: "soins",          label: "Soins infirmiers",   icon: "activity" },
    { id: "notifications",  label: "Notifications",      icon: "bell" },
    { id: "facturation",    label: "Facturation",         icon: "file-text" },
    { id: "profil",         label: "Mon profil",          icon: "user" },
  ];

  activeTab = "accueil";
  sidebarOpen = false;
  loading: any = {};
  successMsg = "";
  errorMsg = "";

  rdvJour: any[] = [];
  fileAttente: any[] = [];
  fileAttenteInterval: any = null;
  patients: any[] = [];
  soins: any[] = [];
  notifications: any[] = [];
  loadingNotifs = false;

  typesSoin = ["INJECTION","PANSEMENT","PERFUSION","PRISE_DE_SANG","SOINS_PLAIE","AUTRE"];

  soinPatientId = 0;
  soinType = "INJECTION";
  soinObs = "";
  soinDate = new Date().toISOString().split("T")[0];
  soinLoading = false;
  soinError = "";
  soinSuccess = "";

  showFactureForm = false;
  factures: any[] = [];
  facturePatientId = 0;
  factureMontant = 0;
  factureDesc = "";
  factureError = "";
  factureSuccess = "";
  factureLoading = false;

  profilNom = ""; profilPrenom = ""; profilTel = ""; profilEmail = "";
  profilLoading = false; profilError = ""; profilSuccess = "";
  pwAncien = ""; pwNouveau = ""; pwConfirm = "";
  pwSuccess = ""; pwError = ""; pwLoading = false;

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public toast: ToastService
  ) {}

  alerteUrgence: any = null;
  urgenceInterval: any = null;
  urgencesVues: Set<number> = new Set(
    JSON.parse(localStorage.getItem('urgences_vues') || '[]')
  );

  ngOnInit() {
    // Forcer le thème violet pour l'infirmière
    document.documentElement.style.setProperty('--primary', '#6D28D9');
    document.documentElement.style.setProperty('--primary-mid', '#7C3AED');
    document.documentElement.style.setProperty('--primary-light', '#F5F3FF');
    document.documentElement.style.setProperty('--primary-border', '#C4B5FD');
    this.chargerRdvJour();
    this.chargerFactures();
    this.chargerSoins();
    this.chargerPatients();
    this.chargerNotifications();
    this.verifierUrgences();
    this.urgenceInterval = setInterval(() => this.verifierUrgences(), 10000);
  }

  ngOnDestroy() {
    if (this.urgenceInterval) clearInterval(this.urgenceInterval);
  }

  verifierUrgences() {
    if (!this.auth.userId()) return;
    this.api.getNotifications(this.auth.userId()).subscribe({
      next: (notifs: any[]) => {
        const urgences = notifs.filter((n: any) => n.type === 'urgence' && !n.lu && !this.urgencesVues.has(n.id_notification));
        if (urgences.length > 0 && !this.alerteUrgence) {
          this.alerteUrgence = urgences[0];
          this.urgencesVues.add(urgences[0].id_notification);
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 880; osc.start();
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            setTimeout(() => osc.stop(), 800);
          } catch(e) {}
        }
      }, error: () => {}
    });
  }

  fermerAlerteUrgence() {
    if (this.alerteUrgence) {
      this.api.marquerLue(this.alerteUrgence.id_notification).subscribe({ next: () => {}, error: () => {} });
      this.urgencesVues.add(this.alerteUrgence.id_notification);
    }
    this.alerteUrgence = null;
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.successMsg = "";
    this.errorMsg = "";
    if (tab === "accueil" || tab === "patients") this.chargerRdvJour();
    if (tab === "file-attente") { this.chargerFileAttente(); this.startFileAttenteRefresh(); }
    if (tab !== "file-attente") this.stopFileAttenteRefresh();
    if (tab === "soins") this.chargerSoins();
    if (tab === "facturation") this.chargerFactures();
    if (tab === "notifications") this.chargerNotifications();
    if (tab === "profil") {
      const u = this.auth.user;
      this.profilNom = u?.nom || "";
      this.profilPrenom = u?.prenom || "";
      this.profilTel = u?.telephone || "";
      this.profilEmail = u?.email || "";
    }
  }

  countStatut(statut: string): number {
    return this.fileAttente.filter(r => r.statut === statut).length;
  }

  chargerFileAttente() {
    this.api.getRdvJour().subscribe({
      next: (r: any[]) => {
        this.fileAttente = r
          .filter((rdv: any) => rdv.statut === 'confirme' || rdv.statut === 'patient_arrive' || rdv.statut === 'en_attente')
          .sort((a: any, b: any) => a.heure_rdv?.localeCompare(b.heure_rdv));
      },
      error: () => {}
    });
  }

  startFileAttenteRefresh() {
    this.stopFileAttenteRefresh();
    this.fileAttenteInterval = setInterval(() => this.chargerFileAttente(), 15000);
  }

  stopFileAttenteRefresh() {
    if (this.fileAttenteInterval) { clearInterval(this.fileAttenteInterval); this.fileAttenteInterval = null; }
  }

  getStatutLabel(statut: string): string {
    const map: any = { 'en_attente': 'En attente', 'confirme': 'Confirmé', 'patient_arrive': '✅ Arrivé', 'en_cours': '🔵 En consultation', 'termine': 'Terminé', 'annule': 'Annulé' };
    return map[statut] || statut;
  }

  getStatutColor(statut: string): string {
    const map: any = { 'en_attente': '#f39c12', 'confirme': '#3498db', 'patient_arrive': '#27ae60', 'en_cours': '#8e44ad', 'termine': '#95a5a6', 'annule': '#e74c3c' };
    return map[statut] || '#666';
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

  chargerNotifications() {
    this.loadingNotifs = true;
    this.api.getNotifications(this.auth.userId()).subscribe({
      next: (n: any[]) => { this.notifications = n; this.loadingNotifs = false; },
      error: () => this.loadingNotifs = false
    });
  }

  notifCount(): number { return this.notifications.filter(n => !n.lu).length; }

  marquerLueNotif(id: number) {
    this.api.marquerLue(id).subscribe({ next: () => this.chargerNotifications(), error: () => {} });
  }

  marquerToutesLues() {
    this.notifications.filter(n => !n.lu).forEach(n => this.api.marquerLue(n.id_notification).subscribe());
    setTimeout(() => this.chargerNotifications(), 500);
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

  marquerArrivee(id: number) {
    this.api.patientArrive(id).subscribe({
      next: () => { this.toast.success("Arrivée enregistrée."); this.chargerFileAttente(); this.chargerRdvJour(); },
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
      fiche_soin:    this.soinType,
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

  changerMotDePasse() {
    this.pwError = ""; this.pwSuccess = "";
    if (!this.pwAncien || !this.pwNouveau || !this.pwConfirm) { this.pwError = "Tous les champs sont obligatoires."; return; }
    if (this.pwNouveau !== this.pwConfirm) { this.pwError = "Les mots de passe ne correspondent pas."; return; }
    if (this.pwNouveau.length < 6) { this.pwError = "Minimum 6 caractères."; return; }
    this.pwLoading = true;
    this.api.changerMotDePasse(this.auth.userId(), { ancien_mot_de_passe: this.pwAncien, nouveau_mot_de_passe: this.pwNouveau }).subscribe({
      next: () => { this.pwLoading = false; this.pwSuccess = "Mot de passe changé !"; this.pwAncien = ""; this.pwNouveau = ""; this.pwConfirm = ""; },
      error: e => { this.pwLoading = false; this.pwError = e.error?.message || "Ancien mot de passe incorrect."; }
    });
  }

  prochainRdv(): any | null {
    const enCours = this.rdvJour.filter(r => r.statut !== "annule" && r.statut !== "termine");
    return enCours.sort((a, b) => a.heure_rdv.localeCompare(b.heure_rdv))[0] || null;
  }

  countJourStatut(s: string): number { return this.rdvJour.filter(r => r.statut?.toLowerCase() === s).length; }

  getDate(): string {
    return new Date().toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  getBorderColor(statut: string): string {
    const colors: any = { en_attente: '#F59E0B', confirme: '#3B82F6', patient_arrive: '#16A34A', annule: '#EF4444', termine: '#94A3B8' };
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

  get patientsUniques(): any[] {
    const seen = new Set();
    return this.rdvJour.filter(r => {
      if (seen.has(r.id_patient)) return false;
      seen.add(r.id_patient);
      return true;
    });
  }

  chargerFactures() {
    this.api.getFactures().subscribe({
      next: (data: any) => {
        this.factures = [...(data || [])];
        console.log('Factures chargées:', this.factures.length);
      },
      error: (e: any) => { console.error('Erreur factures:', e); }
    });
  }

  creerFacture() {
    if (!this.facturePatientId || !this.factureMontant) {
      this.factureError = 'Patient et montant obligatoires.';
      return;
    }
    this.factureLoading = true;
    this.factureError = '';
    const patientObj = this.patients.find((p: any) => p.id_utilisateur === +this.facturePatientId);
    const nomPatient = patientObj ? (patientObj.prenom + ' ' + patientObj.nom) : '';
    this.api.creerFacture({
      id_patient: this.facturePatientId,
      nom_patient: nomPatient,
      montant: this.factureMontant,
      description: this.factureDesc,
      statut: 'impayé'
    }).subscribe({
      next: () => {
        this.factureLoading = false;
        this.factureSuccess = 'Facture créée avec succès.';
        this.showFactureForm = false;
        this.facturePatientId = 0;
        this.factureMontant = 0;
        this.factureDesc = '';
        this.chargerFactures();
        setTimeout(() => this.factureSuccess = '', 3000);
      },
      error: () => {
        this.factureLoading = false;
        this.factureError = 'Erreur lors de la création.';
      }
    });
  }

  marquerPayee(id: number) {
    this.api.marquerFacturePayee(id).subscribe({
      next: () => this.chargerFactures(),
      error: () => {}
    });
  }

  marquerImpayee(id: number) {
    this.api.marquerFactureImpayee(id).subscribe({
      next: () => this.chargerFactures(),
      error: () => {}
    });
  }
}