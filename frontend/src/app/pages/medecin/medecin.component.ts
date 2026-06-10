import { Component, OnInit, OnDestroy, AfterViewChecked } from "@angular/core";
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
export class MedecinComponent implements OnInit, OnDestroy, AfterViewChecked {

  TABS = [
    { id: "accueil",        label: "Accueil",           icon: "home" },
    { id: "planning",       label: "Mon planning",       icon: "calendar" },
    { id: "consultation",   label: "Consultation",       icon: "activity" },
    { id: "dossiers",       label: "Dossiers patients",  icon: "folder" },
    { id: "chat",           label: "Messages",           icon: "message-circle" },
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
  agendaView = 'liste'; // 'liste' | 'semaine' | 'mois'
  semaineCourante = new Date();
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

  Number = Number;

  // Vaccins / Analyses / Consentements
  vaccinForm = { nom_vaccin: '', date_administration: '', date_rappel: '' };
  analyseForm = { type_analyse: '', date_analyse: '', statut: 'normal', note: '' };
  consentementForm = { type_acte: '', signe: false };

  ajouterVaccin() {
    if (!this.vaccinForm.nom_vaccin || !this.vaccinForm.date_administration || !this.rdvSelectionne) return;
    this.api.ajouterVaccin({ ...this.vaccinForm, id_patient: this.rdvSelectionne.id_patient || this.rdvSelectionne.id_utilisateur }).subscribe({
      next: () => { this.toast.success(' Vaccin enregistré !'); this.vaccinForm = { nom_vaccin: '', date_administration: '', date_rappel: '' }; },
      error: () => this.toast.error('Erreur ajout vaccin.')
    });
  }

  ajouterAnalyse() {
    if (!this.analyseForm.type_analyse || !this.rdvSelectionne) return;
    this.api.ajouterAnalyse({ ...this.analyseForm, id_patient: this.rdvSelectionne.id_patient || this.rdvSelectionne.id_utilisateur, id_patient_user: this.rdvSelectionne.id_utilisateur, date_analyse: this.analyseForm.date_analyse || new Date().toISOString().split('T')[0] }).subscribe({
      next: () => { this.toast.success(' Analyse enregistrée !'); this.analyseForm = { type_analyse: '', date_analyse: '', statut: 'normal', note: '' }; },
      error: () => this.toast.error('Erreur ajout analyse.')
    });
  }

  ajouterConsentement() {
    if (!this.consentementForm.type_acte || !this.rdvSelectionne) return;
    this.api.ajouterConsentement({ ...this.consentementForm, id_patient: this.rdvSelectionne.id_utilisateur }).subscribe({
      next: () => { this.toast.success(' Consentement enregistré !'); this.consentementForm = { type_acte: '', signe: false }; },
      error: () => this.toast.error('Erreur consentement.')
    });
  }

  // Facturation
  factures: any[] = [];
  factureForm = { id_patient: 0, nom_patient: '', montant: 2000, description: 'Consultation médicale', statut: 'impayé' };
  factureSuccess = false;

  chargerFactures() {
    this.api.getFactures().subscribe({
      next: (f: any[]) => this.factures = f || [],
      error: () => {}
    });
  }

  creerFacture() {
    if (!this.factureForm.id_patient || !this.factureForm.montant) return;
    this.api.creerFacture(this.factureForm).subscribe({
      next: () => {
        this.factureSuccess = true;
        this.chargerFactures();
        setTimeout(() => this.factureSuccess = false, 3000);
        this.toast.success('Facture créée !');
      },
      error: () => this.toast.error('Erreur création facture.')
    });
  }

  marquerPayee(f: any) {
    this.api.marquerFacturePayee(f.id).subscribe({
      next: () => { f.statut = 'payé'; this.toast.success('Facture marquée payée !'); },
      error: () => {}
    });
  }

  imprimerFacture(f: any) {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Facture #${f.id}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;padding:40px;color:#333}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0A3D62;padding-bottom:20px;margin-bottom:30px}
    .logo{font-size:28px;font-weight:900;color:#0A3D62}.logo span{color:#00C9A7}
    .badge{background:${f.statut==='payé'?'#dcfce7':'#fee2e2'};color:${f.statut==='payé'?'#166534':'#991b1b'};padding:6px 16px;border-radius:20px;font-weight:700;font-size:14px}
    .section{margin-bottom:24px}.label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#999;margin-bottom:4px}
    .val{font-size:15px;font-weight:600}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .montant-box{background:#f0f7ff;border-radius:12px;padding:20px;text-align:center;margin:24px 0}
    .montant{font-size:42px;font-weight:900;color:#0A3D62}.devise{font-size:18px;color:#64748b;margin-top:4px}
    .footer{border-top:1px solid #e2e8f0;padding-top:16px;display:flex;justify-content:space-between;font-size:12px;color:#999}
    </style></head><body>
    <div class="header"><div><div class="logo">Medi<span>Nova</span></div><div style="font-size:12px;color:#999;margin-top:4px">Cabinet médical · Alger, Algérie</div></div>
    <div style="text-align:right"><div style="font-size:22px;font-weight:900;color:#0A3D62">FACTURE</div>
    <div style="font-size:13px;color:#999">N° F-${String(f.id).padStart(4,'0')}</div>
    <div class="badge" style="margin-top:8px">${f.statut==='payé'?' PAYÉE':' EN ATTENTE'}</div></div></div>
    <div class="grid">
    <div class="section"><div class="label">Patient</div><div class="val">${f.nom_patient||'—'}</div></div>
    <div class="section"><div class="label">Date</div><div class="val">${new Date(f.created_at||Date.now()).toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</div></div>
    <div class="section"><div class="label">Médecin</div><div class="val">Dr. ${f.medecin_nom||'—'}</div></div>
    <div class="section"><div class="label">Référence</div><div class="val">F-${String(f.id).padStart(4,'0')}</div></div>
    </div>
    <div class="section"><div class="label">Description</div><div class="val">${f.description||'Consultation médicale'}</div></div>
    <div class="montant-box"><div class="montant">${Number(f.montant).toLocaleString('fr-DZ')} DA</div><div class="devise">Dinars Algériens</div></div>
    <div class="footer"><span>Cabinet MediNova · Alger</span><span>Merci de votre confiance</span><span>N° F-${String(f.id).padStart(4,'0')}</span></div>
    <script>setTimeout(()=>window.print(),500);</script></body></html>`;
    const w = window.open('', '_blank'); w?.document.write(html); w?.document.close();
  }

  getTotalFactures(): number { return this.factures.reduce((s, f) => s + Number(f.montant), 0); }
  getTotalPayees(): number { return this.factures.filter(f => f.statut === 'payé').reduce((s, f) => s + Number(f.montant), 0); }
  getTotalImpayees(): number { return this.factures.filter(f => f.statut !== 'payé').reduce((s, f) => s + Number(f.montant), 0); }

  // Dossiers patients
  patients: any[] = [];
  // Chat
  chatMessages: any[] = [];
  chatInput = '';
  chatPatientId = 0;
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

  // Alerte urgence
  alerteUrgence: any = null;
  urgenceInterval: any = null;
  lastNotifCount = 0;
  urgencesVues: Set<number> = new Set(
    JSON.parse(localStorage.getItem('urgences_vues') || '[]')
  );

  ngOnInit() {
    // Forcer le thème bleu pour le médecin
    document.documentElement.style.setProperty('--primary', '#0A3D62');
    document.documentElement.style.setProperty('--primary-mid', '#1a5c8a');
    document.documentElement.style.setProperty('--primary-light', '#EBF5FB');
    document.documentElement.style.setProperty('--primary-border', '#AED6F1');
    this.chargerPlanning();
    this.chargerDispos();
    this.chargerNotifications();
    // Polling urgence toutes les 10 secondes
    this.urgenceInterval = setInterval(() => this.verifierUrgences(), 10000);
  }

  ngOnDestroy() {
    if (this.urgenceInterval) clearInterval(this.urgenceInterval);
  }

  verifierUrgences() {
    if (!this.auth.userId()) return;
    this.api.getNotifications(this.auth.userId()).subscribe({
      next: (notifs: any[]) => {
        const urgences = notifs.filter((n: any) =>
          n.type === 'urgence' && !n.lu && !this.urgencesVues.has(n.id_notification)
        );
        if (urgences.length > 0 && !this.alerteUrgence) {
          this.alerteUrgence = urgences[0];
          this.urgencesVues.add(urgences[0].id_notification);
          localStorage.setItem('urgences_vues', JSON.stringify([...this.urgencesVues]));
          // Son d'alerte
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.start(); gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            setTimeout(() => osc.stop(), 800);
          } catch(e) {}
        }
        this.notifications = notifs;
      },
      error: () => {}
    });
  }

  fermerAlerteUrgence() {
    if (this.alerteUrgence) {
      this.api.marquerLue(this.alerteUrgence.id_notification).subscribe({ next: () => {}, error: () => {} });
      this.urgencesVues.add(this.alerteUrgence.id_notification);
    }
    this.alerteUrgence = null;
  }

  getUrgenceHeure(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setHours(d.getHours() + 1); // Correction timezone Algérie UTC+1
    return `Reçu à ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  ngAfterViewChecked() {
    // Rendu QR code après génération ordonnance
    if (this.ordonnanceGeneree && !this.qrRendered.has(this.ordonnanceGeneree.id_ordonnance)) {
      const el = document.getElementById('qr-' + this.ordonnanceGeneree.id_ordonnance);
      if (el) {
        this.qrRendered.add(this.ordonnanceGeneree.id_ordonnance);
        const url = `${window.location.protocol}//${window.location.hostname}:${window.location.port}?ordonnance=${this.ordonnanceGeneree.id_ordonnance}`;
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
    if (tab === "chat") {
      this.chargerPatients();
      if (this.chatPatientId) this.chargerChatMessages();
    }
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
    this.api.getDispos(this.auth.userId()).subscribe({
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

  isRecording = false;
  recordingField = '';
  recognition: any = null;

  startDictation(field: string) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.toast.error('Dictée vocale non supportée sur ce navigateur.');
      return;
    }
    if (this.isRecording && this.recordingField === field) {
      this.recognition?.stop();
      this.isRecording = false; this.recordingField = '';
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SR();
    this.recognition.lang = 'fr-FR';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.isRecording = true;
    this.recordingField = field;
    this.recognition.onresult = (event: any) => {
      const t = event.results[0][0].transcript;
      if (field === 'diagnostic') this.consultForm.diagnostic += (this.consultForm.diagnostic ? ' ' : '') + t;
      if (field === 'traitement') this.consultForm.traitement += (this.consultForm.traitement ? ' ' : '') + t;
      if (field === 'note') this.consultForm.note += (this.consultForm.note ? ' ' : '') + t;
      this.isRecording = false; this.recordingField = '';
      this.toast.success(' Dictée enregistrée !');
    };
    this.recognition.onerror = () => { this.isRecording = false; this.recordingField = ''; };
    this.recognition.onend = () => { this.isRecording = false; this.recordingField = ''; };
    this.recognition.start();
    this.toast.success(' Parlez maintenant...');
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

  chargerChatMessages() {
    if (!this.chatPatientId) return;
    this.api.getChatMessages(this.auth.userId(), this.chatPatientId).subscribe({
      next: (m: any[]) => { this.chatMessages = m || []; this.scrollChat(); },
      error: () => {}
    });
    // Refresh seulement si on est sur l'onglet chat
    if (this.activeTab === 'chat') {
      setTimeout(() => this.chargerChatMessages(), 5000);
    }
  }

  envoyerMessageChat() {
    if (!this.chatInput.trim() || !this.chatPatientId) return;
    const texte = this.chatInput;
    this.chatMessages.push({ contenu: texte, id_expediteur: this.auth.userId(), cree_a: new Date().toISOString() });
    this.chatInput = '';
    this.scrollChat();
    this.api.envoyerChatMessage(this.auth.userId(), this.chatPatientId, texte).subscribe({
      next: () => this.chargerChatMessages(),
      error: () => this.toast.error('Erreur envoi.')
    });
  }

  scrollChat() {
    setTimeout(() => {
      const el = document.getElementById('chat-med-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }

  isMedecinMessage(msg: any): boolean {
    return msg.id_expediteur === this.auth.userId();
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

  getJoursSemaine(): Date[] {
    const jours = [];
    const base = new Date(this.semaineCourante);
    const jour = base.getDay();
    const diff = jour === 0 ? -6 : 1 - jour;
    const lundi = new Date(base);
    lundi.setDate(base.getDate() + diff);
    for (let i = 0; i < 7; i++) {
      const d = new Date(lundi);
      d.setDate(lundi.getDate() + i);
      jours.push(d);
    }
    return jours;
  }

  getRdvDuJour(date: Date): any[] {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    return this.planning.filter(r => r.date_rdv === dateStr).sort((a: any, b: any) => a.heure_rdv?.localeCompare(b.heure_rdv));
  }

  semaineSuivante() { this.semaineCourante = new Date(this.semaineCourante.setDate(this.semaineCourante.getDate() + 7)); }
  semainePrecedente() { this.semaineCourante = new Date(this.semaineCourante.setDate(this.semaineCourante.getDate() - 7)); }

  getSemaineLabel(): string {
    const jours = this.getJoursSemaine();
    const debut = jours[0].toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    const fin = jours[6].toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${debut} — ${fin}`;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

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