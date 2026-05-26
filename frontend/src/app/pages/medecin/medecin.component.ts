import { Component, OnInit, AfterViewChecked } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../../shared/header/header.component";
import { AuthService } from "../../core/services/auth.service";
import { ApiService } from "../../core/services/api.service";
import { ToastService } from "../../core/services/toast.service";

@Component({
  selector: "app-medecin",
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: "./medecin.component.html"
})
export class MedecinComponent implements OnInit, AfterViewChecked {

  TABS = [
    { id: "accueil",        label: "Accueil",           icon: "home" },
    { id: "planning",       label: "Mon planning",       icon: "calendar" },
    { id: "consultation",   label: "Consultation",       icon: "activity" },
    { id: "dossiers",       label: "Dossiers patients",  icon: "folder" },
    { id: "disponibilites", label: "Disponibilités",     icon: "clock" },
    { id: "notifications",  label: "Notifications",      icon: "bell" },
    { id: "profil",         label: "Mon profil",         icon: "user" },
  ];

  activeTab = "accueil";
  sidebarOpen = false;
  loading: any = {};
  successMsg = "";
  errorMsg = "";
  today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD pour le backend
  todayDisplay = new Date().toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" });

  planning: any[] = [];
  disponibilites: any[] = [];
  calendarView = false;
  calendarMois = new Date().getMonth();
  calendarAnnee = new Date().getFullYear();

  // Propriétés cachées pour éviter les re-renders
  rdvAujourdhuiCache: any[] = [];
  calCells: any[] = [];

  rdvSelectionne: any = null;
  consultEnregistree = false;
  lastConsultId = 0;
  ordonnanceGeneree: any = null;
  consultForm = { diagnostic: "", traitement: "", note: "" };
  ordoForm = { instructions: "", medicaments: [{ nom: "", dosage: "", duree: "" }] };

  joursDisponibles = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  dispoJour = "Lundi";
  dispoHeureDebut = "08:00";
  dispoHeureFin = "17:00";
  dispoLoading = false;
  dispoError = "";
  dispoSuccess = "";

  profilNom = ""; profilPrenom = ""; profilTel = ""; profilEmail = "";
  profilSuccess = ""; profilError = ""; profilLoading = false;
  pwAncien = ""; pwNouveau = ""; pwConfirm = "";
  pwSuccess = ""; pwError = ""; pwLoading = false;

  notifications: any[] = [];
  loadingNotifs = false;

  // Dossiers patients
  patients: any[] = [];
  patientSelectionne: any = null;
  dossierPatient: any = null;
  consultationsPatient: any[] = [];
  ordonnancesPatient: any[] = [];
  soinsPatient: any[] = [];
  loadingDossier = false;
  dossierConsultTab = -1;

  private qrRendered = new Set<number>();

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public toast: ToastService
  ) {}

  ngOnInit() {
    this.chargerPlanning();
    this.chargerDispos();
  }

  ngAfterViewChecked() {
    // Rendu QR code après génération ordonnance
    if (this.ordonnanceGeneree && !this.qrRendered.has(this.ordonnanceGeneree.id_ordonnance)) {
      const el = document.getElementById('qr-' + this.ordonnanceGeneree.id_ordonnance);
      if (el) {
        this.qrRendered.add(this.ordonnanceGeneree.id_ordonnance);
        const url = `http://192.168.100.147:4200?ordonnance=${this.ordonnanceGeneree.id_ordonnance}`;
        this.renderQR(el, url);
      }
    }
  }

  renderQR(el: HTMLElement, text: string) {
    const scriptId = 'qrcode-js';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      s.onload = () => this.doRenderQR(el, text);
      document.head.appendChild(s);
    } else if ((window as any).QRCode) {
      this.doRenderQR(el, text);
    } else {
      setTimeout(() => this.renderQR(el, text), 400);
    }
  }

  doRenderQR(el: HTMLElement, text: string) {
    el.innerHTML = '';
    new (window as any).QRCode(el, {
      text, width: 64, height: 64,
      colorDark: '#0A3D62', colorLight: '#ffffff',
      correctLevel: (window as any).QRCode.CorrectLevel.M,
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.successMsg = "";
    this.errorMsg = "";
    if (tab === "planning") this.chargerPlanning();
    if (tab === "disponibilites") this.chargerDispos();
    if (tab === "notifications") this.chargerNotifications();
    if (tab === "dossiers") this.chargerPatients();
    if (tab === "consultation" && !this.rdvSelectionne) { this.setTab("planning"); return; }
    if (tab === "profil") {
      const u = this.auth.user;
      this.profilNom = u?.nom || "";
      this.profilPrenom = u?.prenom || "";
      this.profilTel = u?.telephone || "";
      this.profilEmail = u?.email || "";
    }
  }

  chargerPlanning() {
    this.loading["planning"] = true;
    this.api.getPlanning(this.auth.userId()).subscribe({
      next: r => {
        this.planning = r;
        this.loading["planning"] = false;
        this._refreshCache();
      },
      error: () => { this.loading["planning"] = false; this.toast.error("Erreur chargement planning."); }
    });
  }

  chargerDispos() {
    this.loading["dispos"] = true;
    this.api.getDispoMedecin(this.auth.userId()).subscribe({
      next: d => { this.disponibilites = d; this.loading["dispos"] = false; },
      error: () => this.loading["dispos"] = false
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

  marquerLue(id: number) {
    this.api.marquerLue(id).subscribe({ next: () => this.chargerNotifications(), error: () => {} });
  }

  marquerToutesLues() {
    this.notifications.filter(n => !n.lu).forEach(n => this.api.marquerLue(n.id_notification).subscribe());
    setTimeout(() => this.chargerNotifications(), 500);
  }

  chargerPatients() {
    this.api.getMesPatients().subscribe({
      next: (p: any[]) => { this.patients = p; },
      error: () => {}
    });
  }

  chargerDossierPatient(patient: any) {
    this.patientSelectionne = patient;
    this.dossierPatient = null;
    this.consultationsPatient = [];
    this.ordonnancesPatient = [];
    this.soinsPatient = [];
    this.dossierConsultTab = -1;
    this.loadingDossier = true;

    // Récupérer dossier
    this.api.dossierUtilisateur(patient.id_utilisateur).subscribe({
      next: (dos: any) => {
        this.dossierPatient = dos;
        if (!dos?.id_dossier) { this.loadingDossier = false; return; }
        // Consultations
        this.api.consultationsByDossier(dos.id_dossier).subscribe({
          next: (c: any[]) => { this.consultationsPatient = c || []; this.loadingDossier = false; },
          error: () => { this.loadingDossier = false; }
        });
        // Ordonnances
        this.api.getOrdonnances(patient.id_utilisateur).subscribe({
          next: (o: any[]) => { this.ordonnancesPatient = o || []; },
          error: () => {}
        });
      },
      error: () => { this.loadingDossier = false; }
    });
  }

  selectRdv(rdv: any) {
    this.rdvSelectionne = rdv;
    this.consultEnregistree = false;
    this.ordonnanceGeneree = null;
    this.consultForm = { diagnostic: "", traitement: "", note: "" };
    this.ordoForm = { instructions: "", medicaments: [{ nom: "", dosage: "", duree: "" }] };
    this.setTab("consultation");
  }

  ouvrirOrdoForm(rdv: any) {
    this.rdvSelectionne = rdv;
    this.ordonnanceGeneree = null;
    this.ordoForm = { instructions: "", medicaments: [{ nom: "", dosage: "", duree: "" }] };
    this.lastConsultId = 0;
    // Etape 1 : recuperer le dossier du patient pour avoir id_dossier
    this.api.dossierUtilisateur(rdv.id_patient).subscribe({
      next: (dos: any) => {
        const idDossier = dos?.id_dossier;
        if (!idDossier) {
          this.toast.error("Dossier patient introuvable.");
          return;
        }
        // Etape 2 : recuperer les consultations de ce dossier
        this.api.consultationsByDossier(idDossier).subscribe({
          next: (consultations: any[]) => {
            if (consultations?.length) {
              const sorted = [...consultations].sort((a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              this.lastConsultId = sorted[0].id_consultation;
            }
            this.consultEnregistree = true;
            this.setTab("consultation");
          },
          error: () => {
            this.consultEnregistree = true;
            this.setTab("consultation");
          }
        });
      },
      error: () => {
        this.consultEnregistree = true;
        this.setTab("consultation");
      }
    });
  }

  confirmerRdv(id: number) {
    this.api.confirmerRdv(id).subscribe({
      next: () => { this.toast.success("Rendez-vous confirmé."); this.chargerPlanning(); },
      error: e => this.toast.error(e.error?.message || "Erreur confirmation.")
    });
  }

  annulerRdv(id: number) {
    if (!confirm("Confirmer l'annulation de ce rendez-vous ?")) return;
    this.api.annulerRdv(id).subscribe({
      next: () => { this.toast.success("Rendez-vous annulé."); this.chargerPlanning(); },
      error: e => this.toast.error(e.error?.message || "Erreur annulation.")
    });
  }

  effectuerConsultation() {
    if (!this.consultForm.diagnostic || !this.consultForm.traitement) {
      this.errorMsg = "Le diagnostic et le traitement sont obligatoires.";
      return;
    }
    this.loading["consult"] = true;
    this.errorMsg = "";

    this.api.dossierUtilisateur(this.rdvSelectionne.id_patient).subscribe({
      next: dos => {
        const body = {
          id_dossier: dos.id_dossier,
          id_medecin: this.auth.userId(),
          date: new Date().toISOString().split("T")[0],
          ...this.consultForm
        };
        this.api.consultation(body).subscribe({
          next: c => {
            this.lastConsultId = c.id_consultation;
            this.consultEnregistree = true;
            this.loading["consult"] = false;
            this.successMsg = "Consultation enregistrée avec succès.";
            this.toast.success("Consultation enregistrée.");
            // Marquer le RDV comme terminé
            this.api.terminerRdv(this.rdvSelectionne.id_rdv).subscribe();
          },
          error: e => { this.loading["consult"] = false; this.errorMsg = e.error?.message || "Erreur lors de l'enregistrement."; }
        });
      },
      error: () => { this.loading["consult"] = false; this.errorMsg = "Impossible de récupérer le dossier patient."; }
    });
  }

  redigerOrdonnance() {
    this.loading["ordo"] = true;
    this.errorMsg = "";
    this.api.ordonnance({
      id_consultation: this.lastConsultId,
      date_emission: this.today,
      instructions: this.ordoForm.instructions
    }).subscribe({
      next: o => {
        const meds = this.ordoForm.medicaments.filter(m => m.nom.trim());
        if (!meds.length) {
          this.ordonnanceGeneree = { ...o, medicaments: [] };
          this.toast.success("Ordonnance créée.");
          this.loading["ordo"] = false;
          return;
        }
        let done = 0;
        meds.forEach(m => this.api.medicament({ id_ordonnance: o.id_ordonnance, ...m }).subscribe({
          next: () => {
            done++;
            if (done === meds.length) {
              this.ordonnanceGeneree = { ...o, medicaments: meds };
              this.toast.success("Ordonnance et médicaments enregistrés.");
              this.loading["ordo"] = false;
            }
          },
          error: () => { done++; if (done === meds.length) this.loading["ordo"] = false; }
        }));
      },
      error: e => { this.loading["ordo"] = false; this.errorMsg = e.error?.message || "Erreur création ordonnance."; }
    });
  }

  envoyerEmail(o: any) {
    this.api.emailOrdonnance({
      id_ordonnance: o.id_ordonnance,
      email: this.rdvSelectionne?.email
    }).subscribe({
      next: () => this.toast.success("Email envoyé."),
      error: () => this.toast.error("Erreur envoi email.")
    });
  }

  ajouterDispo() {
    if (!this.dispoJour || !this.dispoHeureDebut || !this.dispoHeureFin) {
      this.dispoError = "Tous les champs sont requis.";
      return;
    }
    this.dispoLoading = true;
    this.dispoError = "";
    this.dispoSuccess = "";
    this.api.ajouterDispo({
      id_medecin: this.auth.userId(),
      jour: this.dispoJour,
      heure_debut: this.dispoHeureDebut,
      heure_fin: this.dispoHeureFin
    }).subscribe({
      next: () => {
        this.dispoLoading = false;
        this.dispoSuccess = "Créneau ajouté avec succès.";
        this.chargerDispos();
      },
      error: e => { this.dispoLoading = false; this.dispoError = e.error?.message || "Erreur ajout créneau."; }
    });
  }

  supprimerDispo(id: number) {
    if (!confirm("Supprimer ce créneau de disponibilité ?")) return;
    this.api.supprimerDispo(id).subscribe({
      next: () => { this.toast.success("Créneau supprimé."); this.chargerDispos(); },
      error: () => this.toast.error("Erreur suppression.")
    });
  }

  sauvegarderProfil() {
    this.profilLoading = true;
    this.profilError = "";
    this.api.updateProfil(this.auth.userId(), {
      nom: this.profilNom,
      prenom: this.profilPrenom,
      telephone: this.profilTel,
      email: this.profilEmail
    }).subscribe({
      next: () => {
        this.profilLoading = false;
        this.profilSuccess = "Profil mis à jour avec succès.";
        this.toast.success("Profil sauvegardé.");
      },
      error: e => { this.profilLoading = false; this.profilError = e.error?.message || "Erreur sauvegarde."; }
    });
  }

  changerMotDePasse() {
    this.pwError = ""; this.pwSuccess = "";
    if (!this.pwAncien || !this.pwNouveau || !this.pwConfirm) { this.pwError = "Tous les champs sont obligatoires."; return; }
    if (this.pwNouveau !== this.pwConfirm) { this.pwError = "Les mots de passe ne correspondent pas."; return; }
    if (this.pwNouveau.length < 6) { this.pwError = "Le mot de passe doit contenir au moins 6 caractères."; return; }
    this.pwLoading = true;
    this.api.changerMotDePasse(this.auth.userId(), { ancien_mot_de_passe: this.pwAncien, nouveau_mot_de_passe: this.pwNouveau }).subscribe({
      next: () => { this.pwLoading = false; this.pwSuccess = "Mot de passe changé avec succès !"; this.pwAncien = ""; this.pwNouveau = ""; this.pwConfirm = ""; },
      error: e => { this.pwLoading = false; this.pwError = e.error?.message || "Ancien mot de passe incorrect."; }
    });
  }

  ajouterMedicament() { this.ordoForm.medicaments.push({ nom: "", dosage: "", duree: "" }); }
  supprimerMedicament(i: number) { this.ordoForm.medicaments.splice(i, 1); }

  countStatut(s: string): number { return this.planning.filter(r => r.statut?.toLowerCase() === s).length; }

  // Cache refresh — appelé quand planning change ou mois change
  _refreshCache() {
    const today = new Date().toISOString().split("T")[0];
    this.rdvAujourdhuiCache = this.planning
      .filter(r => r.date_rdv === today)
      .sort((a, b) => a.heure_rdv.localeCompare(b.heure_rdv));
    this._buildCalCells();
  }

  _buildCalCells() {
    const firstDay = new Date(this.calendarAnnee, this.calendarMois, 1).getDay();
    const daysInMonth = new Date(this.calendarAnnee, this.calendarMois + 1, 0).getDate();
    const today = new Date();
    const cells: any[] = [];
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${this.calendarAnnee}-${String(this.calendarMois + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        date: d, dateStr,
        isToday: d === today.getDate() && this.calendarMois === today.getMonth() && this.calendarAnnee === today.getFullYear(),
        rdvs: this.planning.filter(r => r.date_rdv === dateStr)
      });
    }
    this.calCells = cells;
  }

  rdvAujourdhui(): any[] { return this.rdvAujourdhuiCache; }

  formatStatut(s: string): string {
    const m: any = { en_attente: "En attente", confirme: "Confirmé", patient_arrive: "Patient arrivé", annule: "Annulé", termine: "Terminé" };
    return m[s?.toLowerCase()] || s;
  }

  getDateAujourdhui(): string {
    return new Date().toLocaleDateString("fr-DZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  getMoisLabel(): string {
    const m = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
    return `${m[this.calendarMois]} ${this.calendarAnnee}`;
  }

  getCalendrierMois(): any[] { return this.calCells; }

  prevMois() {
    this.calendarMois--;
    if (this.calendarMois < 0) { this.calendarMois = 11; this.calendarAnnee--; }
    this._buildCalCells();
  }
  nextMois() {
    this.calendarMois++;
    if (this.calendarMois > 11) { this.calendarMois = 0; this.calendarAnnee++; }
    this._buildCalCells();
  }
}