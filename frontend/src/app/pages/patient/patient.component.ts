import { Component, OnInit, AfterViewChecked } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SidebarComponent } from "../../shared/sidebar/sidebar.component";
import { HeaderComponent } from "../../shared/header/header.component";
import { AuthService } from "../../core/services/auth.service";
import { ApiService } from "../../core/services/api.service";
import { ToastService } from "../../core/services/toast.service";

@Component({
  selector: "app-patient",
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: "./patient.component.html"
})
export class PatientComponent implements OnInit, AfterViewChecked {

  TABS = [
    { id: "accueil",        label: "Accueil",          icon: "home" },
    { id: "rdv",            label: "Rendez-vous",       icon: "calendar" },
    { id: "dossier",        label: "Dossier médical",   icon: "folder" },
    { id: "ordonnances",    label: "Ordonnances",       icon: "file-text" },
    { id: "notifications",  label: "Notifications",     icon: "bell" },
    { id: "profil",         label: "Mon profil",        icon: "user" },
  ];

  activeTab = "accueil";
  sidebarOpen = false;
  loading: any = {};
  successMsg = "";
  errorMsg = "";
  today = new Date().toISOString().split("T")[0];

  rdvList: any[] = [];
  medecins: any[] = [];
  dossierComplet: any = null;
  notifications: any[] = [];
  ordonnances: any[] = [];

  // Formulaire RDV
  rdvMedecinId = 0;
  rdvDate = "";
  rdvHeure = ""; // sera l'id_disponibilite
  rdvMotif = "";
  rdvDispos: any[] = [];
  rdvSlots: any[] = [];
  rdvDatesDispos: string[] = [];
  rdvSlotSelected: any = null;
  rdvSuccess = "";
  rdvError = "";

  // IA triage
  symptomes = "";
  triageResult: any = null;
  triageLoading = false;

  // Profil
  profilNom = ""; profilPrenom = ""; profilTel = ""; profilEmail = "";
  profilSuccess = ""; profilError = ""; profilLoading = false;

  // QR code tracker (CORRECTIF duplication : tracker séparé)
  private qrRenderedIds = new Set<number>();

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public toast: ToastService
  ) {}

  ngOnInit() {
    this.chargerRdv();
    this.chargerMedecins();
  }

  ngAfterViewChecked() {
    // CORRECTIF DUPLICATION : on ne rend le QR qu'une seule fois par ordonnance
    if (this.activeTab === "ordonnances" && this.ordonnances.length) {
      this.ordonnances.forEach(o => {
        if (!this.qrRenderedIds.has(o.id_ordonnance)) {
          const el = document.getElementById("qr-" + o.id_ordonnance);
          if (el && el.children.length === 0) {
            this.qrRenderedIds.add(o.id_ordonnance);
            this.renderQR(el, `MEDINOVA|ORD-${o.id_ordonnance}|${o.date_emission}|Cabinet MediNova Alger`);
          }
        }
      });
    }
  }

  renderQR(el: HTMLElement, text: string) {
    const scriptId = "qrcode-js";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      s.onload = () => this.doRenderQR(el, text);
      document.head.appendChild(s);
    } else if ((window as any).QRCode) {
      this.doRenderQR(el, text);
    } else {
      setTimeout(() => this.renderQR(el, text), 400);
    }
  }

  doRenderQR(el: HTMLElement, text: string) {
    if (el.children.length > 0) return; // éviter la duplication
    new (window as any).QRCode(el, {
      text, width: 64, height: 64,
      colorDark: "#0A3D62", colorLight: "#ffffff",
      correctLevel: (window as any).QRCode?.CorrectLevel?.M,
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.successMsg = "";
    this.errorMsg = "";
    if (tab === "rdv") this.chargerRdv();
    if (tab === "dossier" || tab === "ordonnances") this.chargerDossier();
    if (tab === "notifications") this.chargerNotifications();
    if (tab === "profil") {
      const u = this.auth.user;
      this.profilNom = u?.nom || "";
      this.profilPrenom = u?.prenom || "";
      this.profilTel = u?.telephone || "";
      this.profilEmail = u?.email || "";
    }
  }

  notifCount(): number { return this.notifications.filter(n => !n.lu).length; }

  chargerRdv() {
    this.loading["rdv"] = true;
    this.api.getRdvPatient(this.auth.userId()).subscribe({
      next: r => { this.rdvList = r; this.loading["rdv"] = false; },
      error: () => this.loading["rdv"] = false
    });
  }

  chargerMedecins() {
    this.loading['medecins'] = true;
    this.api.getMedecins().subscribe({
      next: m => { this.medecins = m; this.loading['medecins'] = false; },
      error: () => { this.loading['medecins'] = false; }
    });
  }

  // Génère les créneaux horaires à partir des disponibilités (30min/consultation)
  chargerDispos() {
    this.rdvDispos = [];
    this.rdvSlots = [];
    this.rdvSlotSelected = null;
    this.rdvDate = '';
    if (!this.rdvMedecinId) return;

    this.loading['dispos'] = true;
    this.api.getDispos(this.rdvMedecinId).subscribe({
      next: (dispos: any[]) => {
        this.rdvDispos = dispos;
        this.loading['dispos'] = false;
        // Générer les slots pour les 14 prochains jours
        this.genererSlotsAuto(dispos);
      },
      error: () => { this.loading['dispos'] = false; }
    });
  }

  // Génère les créneaux automatiquement pour 14 jours
  genererSlotsAuto(dispos: any[]) {
    this.rdvSlots = [];
    const today = new Date();
    const joursMap: any = {
      'Dimanche': 0, 'Lundi': 1, 'Mardi': 2, 'Mercredi': 3,
      'Jeudi': 4, 'Vendredi': 5, 'Samedi': 6
    };
    for (let d = 1; d <= 14; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const jourNom = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][date.getDay()];
      const dispo = dispos.find((dp: any) => dp.jour === jourNom);
      if (!dispo) continue;
      const [hd, md] = (dispo.heure_debut || '08:00').split(':').map(Number);
      const [hf, mf] = (dispo.heure_fin  || '17:00').split(':').map(Number);
      let current = hd * 60 + md;
      const fin = hf * 60 + mf;
      while (current + 30 <= fin) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        const heure = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        const dateStr = date.toISOString().split('T')[0];
        this.rdvSlots.push({
          date: dateStr,
          heure,
          id_disponibilite: dispo.id_disponibilite,
          label: `${date.toLocaleDateString('fr-DZ', {weekday:'short', day:'numeric', month:'short'})} à ${heure}`,
          pris: false
        });
        current += 30;
      }
    }
    // Cache les dates une seule fois après génération
    this.rdvDatesDispos = [...new Set(this.rdvSlots.map((s: any) => s.date))] as string[];
  }

  // Récupère les slots pour une date donnée
  getSlotsParDate(date: string): any[] {
    return this.rdvSlots.filter((s: any) => s.date === date);
  }

  // Dates uniques disponibles (utilise le cache)
  getDatesDispos(): string[] {
    return this.rdvDatesDispos;
  }

  selectionnerSlot(slot: any) {
    if (slot.pris) return;
    this.rdvSlotSelected = slot;
    this.rdvDate = slot.date;
    this.rdvHeure = slot.id_disponibilite;
  }

  chargerDossier() {
    this.loading["dossier"] = true;
    this.api.getDossierComplet(this.auth.userId()).subscribe({
      next: d => {
        this.dossierComplet = d;
        // CORRECTIF DUPLICATION : assigner une seule fois
        this.ordonnances = d?.ordonnances || [];
        this.loading["dossier"] = false;
      },
      error: () => this.loading["dossier"] = false
    });
  }

  chargerNotifications() {
    this.loading["notifs"] = true;
    this.api.getNotifications(this.auth.userId()).subscribe({
      next: n => { this.notifications = n; this.loading["notifs"] = false; },
      error: () => this.loading["notifs"] = false
    });
  }

  marquerLue(id: number) {
    this.api.marquerLue(id).subscribe({ next: () => this.chargerNotifications(), error: () => {} });
  }

  prendreRdv() {
    this.rdvError = "";
    if (!this.rdvMedecinId || !this.rdvDate || !this.rdvHeure || !this.rdvMotif) {
      this.rdvError = "Tous les champs sont obligatoires.";
      return;
    }
    this.loading["rdv-form"] = true;

    // rdvHeure contient en réalité l'id_disponibilite sélectionné
    const dispo = this.rdvDispos.find(d => String(d.id_disponibilite) === String(this.rdvHeure));
    const heureRdv = dispo ? dispo.heure_debut : "08:00";

    this.api.prendreRdv({
      id_patient: this.auth.userId(),
      id_disponibilite: this.rdvHeure,
      date_rdv: this.rdvDate,
      heure_rdv: heureRdv,
      motif: this.rdvMotif
    }).subscribe({
      next: () => {
        this.loading["rdv-form"] = false;
        this.rdvSuccess = "Votre rendez-vous a été réservé avec succès.";
        this.rdvDate = "";
        this.rdvHeure = "";
        this.rdvMotif = "";
        this.rdvMedecinId = 0;
        this.rdvSlots = [];
        this.rdvDatesDispos = [];
        this.rdvSlotSelected = null;
        this.rdvDispos = [];
        this.toast.success("Rendez-vous confirmé !");
        this.chargerRdv();
      },
      error: e => {
        this.loading["rdv-form"] = false;
        this.rdvError = e.error?.message || "Erreur lors de la réservation.";
      }
    });
  }

  annulerRdv(id: number) {
    if (!confirm("Confirmer l'annulation de ce rendez-vous ?")) return;
    this.api.annulerRdv(id).subscribe({
      next: () => { this.toast.success("Rendez-vous annulé."); this.chargerRdv(); },
      error: e => this.toast.error(e.error?.message || "Erreur annulation.")
    });
  }

  analyserSymptomes() {
    if (!this.symptomes.trim()) return;
    this.triageLoading = true;
    this.triageResult = null;
    this.api.triage(this.symptomes).subscribe({
      next: r => { this.triageResult = r; this.triageLoading = false; },
      error: () => { this.triageLoading = false; this.toast.error("Service d'analyse temporairement indisponible."); }
    });
  }

  sauvegarderProfil() {
    this.profilLoading = true;
    this.profilError = "";
    this.api.updateProfil(this.auth.userId(), {
      nom: this.profilNom, prenom: this.profilPrenom,
      telephone: this.profilTel, email: this.profilEmail
    }).subscribe({
      next: () => {
        this.profilLoading = false;
        this.profilSuccess = "Profil mis à jour avec succès.";
        this.toast.success("Profil sauvegardé.");
      },
      error: e => { this.profilLoading = false; this.profilError = e.error?.message || "Erreur sauvegarde."; }
    });
  }

  countRdvStatut(s: string): number { return this.rdvList.filter(r => r.statut?.toLowerCase() === s).length; }

  formatStatut(s: string): string {
    const m: any = { en_attente: "En attente", confirme: "Confirmé", patient_arrive: "Patient arrivé", annule: "Annulé", termine: "Terminé" };
    return m[s?.toLowerCase()] || s;
  }
}