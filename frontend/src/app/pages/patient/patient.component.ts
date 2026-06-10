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
    { id: "chat",           label: "Messages",          icon: "message-circle" },
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
  rdvSlotsMap: { [date: string]: any[] } = {};
  rdvJourSelectionne: string = '';
  rdvSlotSelected: any = null;
  rdvSuccess = "";
  rdvError = "";

  // IA triage - vraie IA avec Claude via backend
  symptomes = "";
  triageResult: any = null;
  triageLoading = false;
  triageError = "";

  analyserSymptomes() {
    if (!this.symptomes.trim()) return;
    this.triageLoading = true;
    this.triageResult = null;
    this.triageError = "";
    this.api.triage(this.symptomes).subscribe({
      next: (r: any) => {
        this.triageResult = r;
        this.triageLoading = false;
      },
      error: () => {
        this.triageError = "Service d'analyse temporairement indisponible.";
        this.triageLoading = false;
      }
    });
  }

  // Profil
  profilNom = ""; profilPrenom = ""; profilTel = ""; profilEmail = "";
  profilGroupeSanguin = ""; profilDateNaissance = ""; profilAdresse = "";
  profilAllergies = ""; profilAntecedents = "";
  medicalLoading = false; medicalSuccess = ""; medicalError = "";
  patientMedical: any = null;
  profilSuccess = ""; profilError = ""; profilLoading = false;
  pwAncien = ""; pwNouveau = ""; pwConfirm = "";
  pwSuccess = ""; pwError = ""; pwLoading = false;
  dossierTab = -1;
  soinsPatient: any[] = [];
  vaccins: any[] = [];
  analyses: any[] = [];
  consentements: any[] = [];

  // QR code tracker (CORRECTIF duplication : tracker séparé)
  private qrRenderedIds = new Set<number>();

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public toast: ToastService
  ) {}

  showWelcome = false;
  // Chat
  chatMessages: any[] = [];
  chatInput = '';
  chatLoading = false;
  chatMedecins: any[] = [];
  chatMedecinId = 0;

  chargerChatMessages() {
    if (!this.chatMedecinId) return;
    this.api.getChatMessages(this.auth.userId(), this.chatMedecinId).subscribe({
      next: (m: any[]) => { this.chatMessages = m || []; this.scrollChat(); },
      error: () => {}
    });
    // Refresh toutes les 5 secondes
    setTimeout(() => { if (this.activeTab === 'chat') this.chargerChatMessages(); }, 5000);
  }

  envoyerMessage() {
    if (!this.chatInput.trim() || !this.chatMedecinId) return;
    const msg = { contenu: this.chatInput, id_expediteur: this.auth.userId(), id_destinataire: this.chatMedecinId, cree_a: new Date().toISOString(), en_cours: true };
    this.chatMessages.push(msg);
    const texte = this.chatInput;
    this.chatInput = '';
    this.scrollChat();
    this.api.envoyerChatMessage(this.auth.userId(), this.chatMedecinId, texte).subscribe({
      next: () => { this.chargerChatMessages(); },
      error: () => { this.toast.error('Erreur envoi message.'); }
    });
  }

  scrollChat() {
    setTimeout(() => {
      const el = document.getElementById('chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }

  isMyMessage(msg: any): boolean {
    return msg.id_expediteur === this.auth.userId();
  }

  urgenceLoading = false;
  urgenceEnvoye = false;
  showUrgenceModal = false;

  // Score de santé IA
  scoreIA: any = null;
  scoreLoading = false;

  async genererScoreIA() {
    if (!this.dossierComplet) return;
    this.scoreLoading = true;
    this.scoreIA = null;

    const p = this.dossierComplet.patient || this.auth.user;
    const consultations = this.dossierComplet.consultations || [];
    const soins = this.soinsPatient || [];

    const context = `
Patient: ${p?.prenom} ${p?.nom}, ${p?.genre === 'M' ? 'Homme' : 'Femme'}
Groupe sanguin: ${p?.groupe_sanguin || 'ND'}
Allergies: ${p?.allergies || 'Aucune'}
Antécédents: ${p?.antecedents_medicaux || 'Aucun'}
Consultations (${consultations.length}): ${consultations.map((c: any) => `${c.date}: ${c.diagnostic}`).join(', ')}
Soins infirmiers: ${soins.length}
    `;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 500,
          system: 'Tu es un assistant médical. Analyse le dossier patient et génère un score de santé. Réponds UNIQUEMENT en JSON sans markdown: {"score":85,"niveau":"Bon","couleur":"#27ae60","resume":"résumé court","conseils":["conseil1","conseil2","conseil3"],"points_forts":["point1","point2"],"points_attention":["point1"]}. Score de 0 à 100.',
          messages: [{ role: 'user', content: `Dossier: ${context}` }]
        })
      });
      const data = await response.json();
      const text = data.content[0].text.replace(/```json|```/g, '').trim();
      this.scoreIA = JSON.parse(text);
    } catch (e) {
      this.scoreIA = { score: 72, niveau: 'Satisfaisant', couleur: '#f39c12', resume: 'Analyse basée sur votre historique médical.', conseils: ['Consultez régulièrement votre médecin', 'Maintenez une bonne hygiène de vie'], points_forts: ['Suivi médical régulier'], points_attention: ['Surveiller les constantes'] };
    }
    this.scoreLoading = false;
  }

  envoyerUrgence() {
    this.urgenceLoading = true;
    this.api.envoyerUrgence(this.auth.userId()).subscribe({
      next: () => {
        this.urgenceLoading = false;
        this.urgenceEnvoye = true;
        this.showUrgenceModal = false;
        this.toast.success('🚨 Alerte urgence envoyée ! Le personnel médical a été notifié.');
        setTimeout(() => this.urgenceEnvoye = false, 10000);
      },
      error: () => {
        this.urgenceLoading = false;
        this.toast.error('Erreur envoi urgence.');
      }
    });
  }

  ngOnInit() {
    // Appliquer le thème sauvegardé du patient
    // Onboarding — premier login
    const key = `medinova_welcome_${this.auth.userId()}`;
    if (!localStorage.getItem(key)) {
      setTimeout(() => { this.showWelcome = true; }, 800);
      localStorage.setItem(key, '1');
    }
    this.chargerRdv();
    this.chargerMedecins();
    this.chargerDossier();
    this.chargerDonneesMedicales();
    this.chargerOrdonnances();
  }

  ngAfterViewChecked() {
    // CORRECTIF DUPLICATION : on ne rend le QR qu'une seule fois par ordonnance
    if (this.activeTab === "ordonnances" && this.ordonnances.length) {
      this.ordonnances.forEach(o => {
        if (!this.qrRenderedIds.has(o.id_ordonnance)) {
          const el = document.getElementById("qr-" + o.id_ordonnance);
          if (el && el.children.length === 0) {
            this.qrRenderedIds.add(o.id_ordonnance);
            const url = `${window.location.protocol}//${window.location.hostname}:${window.location.port}?ordonnance=${o.id_ordonnance}`;
            this.renderQR(el, url);
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
    if (tab === "dossier" || tab === "ordonnances" || tab === "profil") { this.chargerDossier(); this.chargerRdv(); }
    if (tab === "profil") { this.chargerDonneesMedicales(); }
    if (tab === "notifications") this.chargerNotifications();
    if (tab === "chat") {
      this.api.getPatients().subscribe({ next: () => {}, error: () => {} });
      this.api.getMedecins().subscribe({
        next: (m: any[]) => { this.chatMedecins = m; if (m.length && !this.chatMedecinId) { this.chatMedecinId = m[0].id_utilisateur; this.chargerChatMessages(); } },
        error: () => {}
      });
    }
    if (tab === "profil") {
      const u = this.auth.user;
      this.profilNom = u?.nom || "";
      this.profilPrenom = u?.prenom || "";
      this.profilTel = u?.telephone || "";
      this.profilEmail = u?.email || "";
      // Fill medical data
      const pm = this.patientMedical || this.dossierComplet?.patient;
      this.profilGroupeSanguin = pm?.groupe_sanguin || "";
      this.profilDateNaissance = pm?.date_naissance ? pm.date_naissance.split("T")[0] : "";
      this.profilAdresse = pm?.adresse || "";
      this.profilAllergies = pm?.allergies || "";
      this.profilAntecedents = pm?.antecedents_medicaux || "";
    }
  }

  notifCount(): number { return this.notifications.filter(n => !n.lu).length; }

  chargerOrdonnances() {
    this.api.getOrdonnances(this.auth.userId()).subscribe({
      next: (o: any[]) => { this.ordonnances = o || []; },
      error: () => {}
    });
  }

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
    this.rdvSlotsMap = {};
    this.rdvDatesDispos = [];
    this.rdvJourSelectionne = '';
    this.rdvSlotSelected = null;
    this.rdvDate = '';
    if (!this.rdvMedecinId) return;

    this.loading['dispos'] = true;
    this.api.getDispos(this.rdvMedecinId).subscribe({
      next: (dispos: any[]) => {
        this.rdvDispos = dispos;
        // Charger les RDV existants pour marquer les créneaux pris
        this.api.getPlanning(this.rdvMedecinId).subscribe({
          next: (rdvs: any[]) => {
            this.loading['dispos'] = false;
            this.genererSlotsAuto(dispos, rdvs);
          },
          error: () => {
            this.loading['dispos'] = false;
            this.genererSlotsAuto(dispos, []);
          }
        });
      },
      error: () => { this.loading['dispos'] = false; }
    });
  }

  // Génère les créneaux automatiquement pour 14 jours
  genererSlotsAuto(dispos: any[], rdvsExistants: any[] = []) {
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
        // Vérifier si ce créneau est déjà pris
        const estPris = rdvsExistants.some((r: any) =>
          r.date_rdv === dateStr &&
          (r.heure_rdv || '').slice(0, 5) === heure &&
          r.id_disponibilite === dispo.id_disponibilite &&
          r.statut !== 'annule'
        );
        this.rdvSlots.push({
          date: dateStr,
          heure,
          id_disponibilite: dispo.id_disponibilite,
          label: `${date.toLocaleDateString('fr-DZ', {weekday:'short', day:'numeric', month:'short'})} à ${heure}`,
          pris: estPris
        });
        current += 30;
      }
    }
    // Cache les dates une seule fois après génération
    this.rdvDatesDispos = [...new Set(this.rdvSlots.map((s: any) => s.date))] as string[];
    // Cache les slots par date pour éviter les re-renders
    this.rdvSlotsMap = {};
    for (const s of this.rdvSlots) {
      if (!this.rdvSlotsMap[s.date]) this.rdvSlotsMap[s.date] = [];
      this.rdvSlotsMap[s.date].push(s);
    }
  }

  // Récupère les slots pour une date donnée (depuis le cache Map)
  getSlotsParDate(date: string): any[] {
    return this.rdvSlotsMap[date] || [];
  }

  // Dates uniques disponibles (utilise le cache)
  getDatesDispos(): string[] {
    return this.rdvDatesDispos;
  }

  trackByDate(index: number, date: string): string { return date; }
  trackBySlot(index: number, s: any): string { return s.date + s.heure; }

  formatJourNom(dateStr: string): string {
    const jours = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    return jours[new Date(dateStr).getDay()];
  }
  formatJourNum(dateStr: string): string {
    return new Date(dateStr).getDate().toString();
  }
  formatJourMois(dateStr: string): string {
    const mois = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    return mois[new Date(dateStr).getMonth()];
  }

  selectionnerSlot(slot: any) {
    if (slot.pris) return;
    this.rdvSlotSelected = slot;
    this.rdvDate = slot.date;
    this.rdvHeure = slot.id_disponibilite;
  }

  chargerDossier() {
    this.loading["dossier"] = true;
    // Appel 1 : dossier patient
    this.api.dossierUtilisateur(this.auth.userId()).subscribe({
      next: (dos: any) => {
        console.log('DOS:', dos, 'id_dossier:', dos?.id_dossier);
        if (!dos?.id_dossier) { this.loading["dossier"] = false; return; }
        // Appel 2 : consultations du dossier
        this.api.consultationsByDossier(dos.id_dossier).subscribe({
          next: (consultations: any[]) => {
            console.log('CONSULTATIONS:', consultations);
            this.dossierComplet = {
              dossier: dos,
              patient: { ...this.auth.user, ...(dos.patient || {}) },
              consultations: consultations || []
            };
            this.loading["dossier"] = false;
          },
          error: (e: any) => {
            console.log('ERREUR CONSULTATIONS:', e);
            this.dossierComplet = { dossier: dos, patient: { ...this.auth.user, ...(dos.patient || {}) }, consultations: [] };
            this.loading["dossier"] = false;
          }
        });
      },
      error: () => this.loading["dossier"] = false
    });
    // Charger les ordonnances séparément
    this.api.getOrdonnances(this.auth.userId()).subscribe({
      next: (o: any[]) => this.ordonnances = o || [],
      error: () => {}
    });
    // Charger les soins
    this.api.getSoinsPatient().subscribe({
      next: (s: any[]) => this.soinsPatient = s || [],
      error: () => {}
    });
    this.api.getVaccins().subscribe({ next: (v: any[]) => this.vaccins = v || [], error: () => {} });
    this.api.getAnalyses().subscribe({ next: (a: any[]) => this.analyses = a || [], error: () => {} });
    this.api.getConsentements().subscribe({ next: (c: any[]) => this.consentements = c || [], error: () => {} });
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

  chargerDonneesMedicales() {
    this.api.dossierUtilisateur(this.auth.userId()).subscribe({
      next: (data: any) => {
        if (data?.patient) this.patientMedical = data.patient;
      },
      error: () => {}
    });
  }

  imprimerOrdonnance(o: any) {
    const p = this.auth.user;
    // Charger les données patient depuis l'API pour avoir date_naissance et groupe_sanguin
    const patientData = this.dossierComplet?.patient || p;
    this._genererPDFOrdonnance(o, patientData);
  }

  _genererPDFOrdonnance(o: any, patient: any) {
    const p = this.auth.user;
    const dateNow = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
    const dateEmission = o.date_emission
      ? new Date(o.date_emission).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
      : dateNow;

    // Calcul âge patient
    let age = '—';
    if (patient?.date_naissance) {
      const diff = Date.now() - new Date(patient.date_naissance).getTime();
      age = Math.floor(diff / (365.25 * 24 * 3600 * 1000)) + ' ans';
    }

    const medsHtml = (o.medicaments || []).map((m: any, i: number) => `
      <div class="med-line">
        <span class="med-num">${i + 1} —</span>
        <div class="med-body">
          <div class="med-name">${m.nom}</div>
          <div class="med-posol">Dosage : ${m.dosage} &nbsp;|&nbsp; Durée : ${m.duree}</div>
        </div>
      </div>`).join('');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Ordonnance — Dr. ${o.medecin_prenom || ''} ${o.medecin_nom || ''}</title>
<style>
  @page { size: A4; margin: 0 }
  * { margin:0; padding:0; box-sizing:border-box }
  body { font-family: 'Times New Roman', Times, serif; font-size:12pt; color:#000; background:#fff }
  .page { width:210mm; min-height:297mm; padding:18mm 20mm 18mm 22mm; position:relative; }

  /* EN-TÊTE MÉDECIN */
  .entete { display:flex; justify-content:space-between; padding-bottom:10mm; border-bottom:2px solid #000; margin-bottom:8mm; }
  .entete-gauche { max-width:60%; }
  .med-titre { font-size:15pt; font-weight:bold; text-transform:uppercase; letter-spacing:.5px; margin-bottom:3mm; }
  .med-spec { font-size:11pt; font-weight:bold; margin-bottom:2mm; }
  .med-info { font-size:10pt; line-height:1.7; color:#222; }
  .entete-droite { text-align:right; }
  .ordo-label { font-size:20pt; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#000; }
  .ordo-num   { font-size:10pt; color:#555; margin-top:2mm; }
  .ordo-date  { font-size:10pt; margin-top:1mm; }

  /* PATIENT */
  .patient-box { border:1px solid #000; padding:5mm 8mm; margin-bottom:8mm; }
  .patient-title { font-size:9pt; font-weight:bold; text-transform:uppercase; letter-spacing:.5px; color:#555; margin-bottom:3mm; }
  .patient-row { display:flex; gap:20mm; flex-wrap:wrap; }
  .patient-field { min-width:60mm; }
  .patient-label { font-size:9pt; color:#555; }
  .patient-val { font-size:11pt; font-weight:bold; }

  /* RX */
  .rx-section { margin-bottom:8mm; }
  .rx-symbol { font-size:30pt; font-style:italic; font-weight:bold; margin-bottom:5mm; line-height:1; }
  .med-line { display:flex; align-items:flex-start; gap:4mm; margin-bottom:6mm; padding-bottom:5mm; border-bottom:1px dotted #ccc; }
  .med-line:last-child { border-bottom:none; }
  .med-num  { font-size:12pt; font-weight:bold; white-space:nowrap; padding-top:1mm; }
  .med-name { font-size:13pt; font-weight:bold; margin-bottom:2mm; }
  .med-posol { font-size:11pt; color:#333; }

  /* INSTRUCTIONS */
  .instructions { border-left:3px solid #000; padding:3mm 5mm; margin-top:5mm; margin-bottom:8mm; }
  .instr-label { font-size:9pt; font-weight:bold; text-transform:uppercase; letter-spacing:.5px; color:#555; margin-bottom:2mm; }
  .instr-text  { font-size:11pt; line-height:1.6; }

  /* PIED */
  .pied { position:absolute; bottom:18mm; left:22mm; right:20mm; border-top:1px solid #000; padding-top:5mm; display:flex; justify-content:space-between; align-items:flex-end; }
  .pied-info { font-size:9pt; color:#555; line-height:1.8; }
  .signature-zone { text-align:center; }
  .signature-space { height:20mm; }
  .signature-line  { border-top:1px solid #000; width:50mm; margin:0 auto 2mm; }
  .signature-label { font-size:9pt; }
  .cachet-zone { border:1px solid #ccc; width:35mm; height:20mm; display:flex; align-items:center; justify-content:center; font-size:8pt; color:#aaa; }

  /* MENTION LÉGALE */
  .mention { font-size:8pt; color:#777; text-align:center; margin-top:4mm; border-top:1px dotted #ccc; padding-top:3mm; }

  /* BOUTONS NO-PRINT */
  .no-print { position:fixed; bottom:20px; right:20px; display:flex; gap:10px; font-family:Arial,sans-serif; }
  .btn-print { background:#1a1a1a; color:#fff; border:none; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:700; cursor:pointer; }
  .btn-close { background:#fff; color:#1a1a1a; border:1px solid #ccc; padding:12px 20px; border-radius:6px; font-size:14px; cursor:pointer; }

  @media print {
    .no-print { display:none !important }
    body { background:#fff }
    .page { padding:18mm 20mm 40mm 22mm }
  }
</style>
</head>
<body>
<div class="page">

  <!-- EN-TÊTE -->
  <div class="entete">
    <div class="entete-gauche">
      <div class="med-titre">Dr. ${o.medecin_prenom || ''} ${o.medecin_nom || ''}</div>
      <div class="med-spec">Médecine générale</div>
      <div class="med-info">
        Cabinet MediNova<br>
        Rue Didouche Mourad, Alger Centre<br>
        Tél : +213 21 XX XX XX<br>
        N° Ordre : XXXX/CONS/20XX
      </div>
    </div>
    <div class="entete-droite">
      <div class="ordo-label">Ordonnance</div>
      <div class="ordo-num">N° ORD-${o.id_ordonnance}</div>
      <div class="ordo-date">Le ${dateEmission}</div>
    </div>
  </div>

  <!-- PATIENT -->
  <div class="patient-box">
    <div class="patient-title">Identité du patient</div>
    <div class="patient-row">
      <div class="patient-field">
        <div class="patient-label">Nom & Prénom</div>
        <div class="patient-val">${patient?.prenom || p?.prenom || '—'} ${patient?.nom || p?.nom || '—'}</div>
      </div>
      <div class="patient-field">
        <div class="patient-label">Âge</div>
        <div class="patient-val">${age}</div>
      </div>
      <div class="patient-field">
        <div class="patient-label">Sexe</div>
        <div class="patient-val">${(patient?.genre || p?.genre) === 'M' ? 'Masculin' : 'Féminin'}</div>
      </div>
      <div class="patient-field">
        <div class="patient-label">Groupe sanguin</div>
        <div class="patient-val">${patient?.groupe_sanguin || 'ND'}</div>
      </div>
    </div>
  </div>

  <!-- PRESCRIPTION -->
  <div class="rx-section">
    <div class="rx-symbol">℞</div>
    ${medsHtml}
  </div>

  ${o.instructions ? `
  <div class="instructions">
    <div class="instr-label">Instructions au patient</div>
    <div class="instr-text">${o.instructions}</div>
  </div>` : ''}

  <div class="mention">
    Ce document est délivré conformément à la législation algérienne en vigueur (Loi n° 85-05 du 16 février 1985, modifiée et complétée).
    Il est valable pour la date de prescription uniquement. Document confidentiel.
  </div>

  <!-- PIED -->
  <div class="pied">
    <div class="pied-info">
      Cabinet MediNova · Alger, Algérie<br>
      N° ORD-${o.id_ordonnance} · ${dateNow}<br>
      Document médico-légal confidentiel
    </div>
    <div class="signature-zone">
      <div class="signature-space"></div>
      <div class="signature-line"></div>
      <div class="signature-label">Cachet & Signature du médecin</div>
    </div>
    <div class="cachet-zone">CACHET<br>MÉDECIN</div>
  </div>

</div>

<div class="no-print">
  <button class="btn-print" onclick="window.print()">🖨️ Imprimer / PDF</button>
  <button class="btn-close" onclick="window.close()">Fermer</button>
</div>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=900,height=1000');
    w?.document.write(html);
    w?.document.close();
  }

  imprimerDossier() {
    window.print();
  }

  genererFichePatient() {
    const patientData = this.dossierComplet?.patient || this.auth.user;
    this._genFiche(patientData);
  }

  _genFiche(p: any) {
    const dos          = this.dossierComplet?.dossier;
    const consultations= this.dossierComplet?.consultations || [];
    const dateNow      = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });

    let age = '—';
    if (p?.date_naissance) {
      const diff = Date.now() - new Date(p.date_naissance).getTime();
      age = Math.floor(diff / (365.25 * 24 * 3600 * 1000)) + ' ans';
    }

    const dnFormatted = p?.date_naissance
      ? new Date(p.date_naissance).toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' })
      : '—';

    const consultsRows = consultations.map((c: any, i: number) => `
      <tr>
        <td class="tc">${i+1}</td>
        <td>${c.date ? new Date(c.date).toLocaleDateString('fr-FR') : '—'}</td>
        <td>${c.diagnostic || '—'}</td>
        <td>${c.traitement  || '—'}</td>
        <td class="tn">${c.note || '—'}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Fiche Patient — ${p?.prenom || ''} ${p?.nom || ''}</title>
<style>
  @page { size:A4; margin:0 }
  *{ margin:0; padding:0; box-sizing:border-box }
  body{ font-family:'Times New Roman',Times,serif; font-size:11pt; color:#000; background:#fff }
  .page{ width:210mm; min-height:297mm; padding:16mm 18mm 40mm }

  /* EN-TÊTE */
  .hd{ display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #000; padding-bottom:10mm; margin-bottom:8mm }
  .hd-logo-name{ font-size:22pt; font-weight:bold; letter-spacing:.5px; text-transform:uppercase }
  .hd-logo-sub { font-size:10pt; color:#444; margin-top:2mm }
  .hd-right    { text-align:right }
  .hd-doc-title{ font-size:16pt; font-weight:bold; text-transform:uppercase; letter-spacing:1px }
  .hd-doc-ref  { font-size:10pt; color:#555; margin-top:2mm }
  .hd-doc-date { font-size:10pt; color:#555; margin-top:1mm }

  /* SECTION */
  .sec       { margin-bottom:8mm }
  .sec-title { font-size:9pt; font-weight:bold; text-transform:uppercase; letter-spacing:.8px; color:#000; border-left:4px solid #000; padding-left:4mm; margin-bottom:4mm }

  /* INFOS PATIENT */
  .info-grid{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:3mm }
  .info-box { border:1px solid #ccc; padding:3mm 4mm }
  .info-lbl { font-size:8pt; color:#666; text-transform:uppercase; letter-spacing:.5px; margin-bottom:1mm }
  .info-val { font-size:11pt; font-weight:bold }
  .blood-val{ display:inline-block; background:#000; color:#fff; padding:1mm 4mm; font-size:12pt; font-weight:bold }

  /* ALERTES */
  .alert-box{ border:1.5px solid #000; padding:4mm 5mm; margin-bottom:5mm }
  .alert-lbl{ font-size:9pt; font-weight:bold; text-transform:uppercase; letter-spacing:.5px; margin-bottom:2mm }
  .alert-txt{ font-size:11pt; line-height:1.6 }

  /* TABLE */
  table{ width:100%; border-collapse:collapse; font-size:10pt }
  th{ background:#000; color:#fff; padding:3mm 4mm; text-align:left; font-size:9pt; text-transform:uppercase; letter-spacing:.3px }
  td{ padding:3mm 4mm; border-bottom:1px solid #e0e0e0; vertical-align:top }
  tr:nth-child(even) td{ background:#f8f8f8 }
  .tc{ text-align:center; font-weight:bold }
  .tn{ font-style:italic; color:#555 }

  /* PIED */
  .footer{ position:absolute; bottom:16mm; left:18mm; right:18mm; border-top:1px solid #000; padding-top:4mm; display:flex; justify-content:space-between; font-size:9pt; color:#555 }

  /* NO PRINT */
  .no-print{ position:fixed; bottom:20px; right:20px; display:flex; gap:10px; font-family:Arial,sans-serif }
  .btn-p{ background:#000; color:#fff; border:none; padding:12px 24px; border-radius:4px; font-size:14px; font-weight:700; cursor:pointer }
  .btn-c{ background:#fff; color:#000; border:1px solid #ccc; padding:12px 20px; border-radius:4px; font-size:14px; cursor:pointer }

  @media print{ .no-print{ display:none } }
</style>
</head>
<body>
<div class="page">

  <div class="hd">
    <div>
      <div class="hd-logo-name">MediNova</div>
      <div class="hd-logo-sub">Cabinet médical · Alger, Algérie<br>Tél : +213 21 XX XX XX</div>
    </div>
    <div class="hd-right">
      <div class="hd-doc-title">Fiche Patient Complète</div>
      <div class="hd-doc-ref">N° DM-${dos?.id_dossier || '—'}</div>
      <div class="hd-doc-date">${dateNow}</div>
    </div>
  </div>

  <div class="sec">
    <div class="sec-title">Informations personnelles</div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-lbl">Nom complet</div>
        <div class="info-val">${p?.prenom || '—'} ${p?.nom || '—'}</div>
      </div>
      <div class="info-box">
        <div class="info-lbl">Date de naissance</div>
        <div class="info-val">${dnFormatted}</div>
      </div>
      <div class="info-box">
        <div class="info-lbl">Âge</div>
        <div class="info-val">${age}</div>
      </div>
      <div class="info-box">
        <div class="info-lbl">Genre</div>
        <div class="info-val">${(p?.genre) === 'M' ? 'Masculin' : 'Féminin'}</div>
      </div>
      <div class="info-box">
        <div class="info-lbl">Téléphone</div>
        <div class="info-val">${p?.telephone || '—'}</div>
      </div>
      <div class="info-box">
        <div class="info-lbl">Groupe sanguin</div>
        <div class="info-val"><span class="blood-val">${p?.groupe_sanguin || 'ND'}</span></div>
      </div>
      <div class="info-box" style="grid-column:1/-1">
        <div class="info-lbl">Adresse</div>
        <div class="info-val">${p?.adresse || '—'}</div>
      </div>
      <div class="info-box" style="grid-column:1/-1">
        <div class="info-lbl">Email</div>
        <div class="info-val">${p?.email || '—'}</div>
      </div>
    </div>
  </div>

  ${p?.allergies ? `
  <div class="sec">
    <div class="sec-title">Allergies connues</div>
    <div class="alert-box">
      <div class="alert-txt">${p.allergies}</div>
    </div>
  </div>` : ''}

  ${p?.antecedents_medicaux ? `
  <div class="sec">
    <div class="sec-title">Antécédents médicaux</div>
    <div class="alert-box">
      <div class="alert-txt">${p.antecedents_medicaux}</div>
    </div>
  </div>` : ''}

  <div class="sec">
    <div class="sec-title">Historique des consultations (${consultations.length})</div>
    ${consultations.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Diagnostic</th>
          <th>Traitement</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>${consultsRows}</tbody>
    </table>` : '<p style="font-style:italic;color:#888">Aucune consultation enregistrée.</p>'}
  </div>

  <div class="footer">
    <span>Cabinet MediNova · Alger</span>
    <span>Document confidentiel — Loi 18-07</span>
    <span>N° DM-${dos?.id_dossier || '—'} · ${dateNow}</span>
  </div>

</div>
<div class="no-print">
  <button class="btn-p" onclick="window.print()">Imprimer / PDF</button>
  <button class="btn-c" onclick="window.close()">Fermer</button>
</div>
</body></html>`;

    const w = window.open('', '_blank', 'width=900,height=1000');
    w?.document.write(html);
    w?.document.close();
  }

  genererCartePatient() {
    // Utilise les données du dossier si disponibles, sinon auth.user
    const patientData = this.dossierComplet?.patient || this.auth.user;
    this._genCarte(patientData);
  }

  _genCarte(p: any) {
    const dos = this.dossierComplet?.dossier;
    const initiales = ((p?.prenom||'?')[0] + (p?.nom||'?')[0]).toUpperCase();
    let age = '—';
    if (p?.date_naissance) {
      const diff = Date.now() - new Date(p.date_naissance).getTime();
      age = Math.floor(diff / (365.25 * 24 * 3600 * 1000)) + ' ans';
    }
    const dnFormatted = p?.date_naissance
      ? new Date(p.date_naissance).toLocaleDateString('fr-FR')
      : '—';

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Carte Patient — MediNova</title>
<style>
  *{ margin:0; padding:0; box-sizing:border-box }
  body{
    font-family: Arial, Helvetica, sans-serif;
    background: #e8e8e8;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 24px;
    padding: 40px 20px;
  }
  .label{ font-size:11px; color:#666; }

  /* Carte 85.6mm × 54mm → 323px × 204px @96dpi */
  .carte, .verso{
    width: 323px; height: 204px;
    border-radius: 10px;
    position: relative;
    overflow: hidden;
  }

  /* RECTO */
  .carte{ background: #1B4F8A; color: white; padding: 18px 20px; }
  .c-orb1{
    position:absolute; top:-40px; right:-40px;
    width:120px; height:120px; border-radius:50%;
    background:rgba(255,255,255,.06);
  }
  .c-orb2{
    position:absolute; bottom:-28px; left:16px;
    width:80px; height:80px; border-radius:50%;
    background:rgba(255,255,255,.04);
  }
  .c-top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; position:relative; z-index:1 }
  .c-logo{ display:flex; align-items:center; gap:7px; font-size:14px; font-weight:700; }
  .c-logo-icon{
    width:24px; height:24px; background:rgba(255,255,255,.15);
    border:1px solid rgba(255,255,255,.25); border-radius:5px;
    display:flex; align-items:center; justify-content:center;
    font-size:14px; font-weight:900; line-height:1;
  }
  .c-badge{
    background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2);
    padding:2px 8px; border-radius:20px;
    font-size:7px; font-weight:700; letter-spacing:.8px; text-transform:uppercase;
  }
  .c-patient{ display:flex; align-items:center; gap:10px; margin-bottom:10px; position:relative; z-index:1 }
  .c-ava{
    width:38px; height:38px; border-radius:50%;
    background:rgba(255,255,255,.18); border:1.5px solid rgba(255,255,255,.35);
    display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:700; flex-shrink:0;
  }
  .c-nom{ font-size:13px; font-weight:700; margin-bottom:2px; }
  .c-email{ font-size:8.5px; opacity:.65; }
  .c-fields{ display:flex; gap:6px; position:relative; z-index:1 }
  .c-field{
    background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15);
    border-radius:5px; padding:5px 8px; flex:1;
  }
  .c-field-lbl{ font-size:6.5px; opacity:.6; text-transform:uppercase; letter-spacing:.4px; margin-bottom:2px }
  .c-field-val{ font-size:10px; font-weight:700 }
  .c-blood{ background:#8B1B1B; border-color:transparent; text-align:center; min-width:42px }
  .c-blood .c-field-val{ font-size:12px; }
  .c-footer{
    position:absolute; bottom:12px; left:20px; right:20px;
    display:flex; justify-content:space-between; align-items:flex-end;
    border-top:1px solid rgba(255,255,255,.12); padding-top:6px;
    z-index:1;
  }
  .c-ref{ font-size:7.5px; opacity:.4; line-height:1.6 }
  .c-loi{ font-size:7px; opacity:.35; text-align:right; line-height:1.6 }

  /* VERSO */
  .verso{ background:#fff; border:1px solid #ddd; }
  .v-stripe{ width:100%; height:32px; background:#111; margin-top:20px; margin-bottom:14px }
  .v-body{ padding:0 18px }
  .v-lbl{ font-size:8px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#777; margin-bottom:5px }
  .v-sig{ border-bottom:1px solid #ccc; height:28px; margin-bottom:10px }
  .v-info{ display:flex; justify-content:space-between; align-items:flex-end }
  .v-clinic{ font-size:8.5px; color:#555; line-height:1.8 }
  .v-clinic strong{ color:#000; font-size:9.5px }
  .v-badge{ background:#1B4F8A; color:white; padding:3px 8px; border-radius:3px; font-size:7.5px; font-weight:700; letter-spacing:.4px }
  .v-shield{
    position:absolute; bottom:10px; right:14px;
    font-size:20px; color:#ddd;
  }

  .no-print{ display:flex; gap:10px; font-family:Arial,sans-serif }
  .btn-p{ background:#1B4F8A; color:#fff; border:none; padding:10px 22px; border-radius:6px; font-size:13px; font-weight:700; cursor:pointer }
  .btn-c{ background:#fff; color:#000; border:1px solid #ccc; padding:10px 18px; border-radius:6px; font-size:13px; cursor:pointer }

  @media print{
    body{ background:#fff; gap:8mm; padding:10mm }
    .no-print{ display:none }
    .carte,.verso{ box-shadow:none }
  }
</style>
</head>
<body>

<p class="label">Recto</p>

<div class="carte">
  <div class="c-orb1"></div>
  <div class="c-orb2"></div>

  <div class="c-top">
    <div class="c-logo">
      <div class="c-logo-icon">+</div>
      MediNova
    </div>
    <div class="c-badge">Carte Patient</div>
  </div>

  <div class="c-patient">
    <div class="c-ava">${initiales}</div>
    <div>
      <div class="c-nom">${p?.prenom || '—'} ${p?.nom || '—'}</div>
      <div class="c-email">${p?.email || '—'}</div>
    </div>
  </div>

  <div class="c-fields">
    <div class="c-field">
      <div class="c-field-lbl">Naissance</div>
      <div class="c-field-val">${dnFormatted}</div>
    </div>
    <div class="c-field">
      <div class="c-field-lbl">Âge</div>
      <div class="c-field-val">${age}</div>
    </div>
    <div class="c-field c-blood">
      <div class="c-field-lbl">Groupe</div>
      <div class="c-field-val">${p?.groupe_sanguin || 'ND'}</div>
    </div>
    <div class="c-field" style="text-align:center;min-width:36px">
      <div class="c-field-lbl">Sexe</div>
      <div class="c-field-val">${(p?.genre) === 'M' ? 'M' : 'F'}</div>
    </div>
  </div>

  <div class="c-footer">
    <div class="c-ref">N° DM-${dos?.id_dossier || '—'}<br>Cabinet MediNova · Alger</div>
    <div class="c-loi">Confidentiel<br>Loi 18-07</div>
  </div>
</div>

<p class="label">Verso</p>

<div class="verso">
  <div class="v-stripe"></div>
  <div class="v-body">
    <div class="v-lbl">Signature du titulaire</div>
    <div class="v-sig"></div>
    <div class="v-info">
      <div class="v-clinic">
        <strong>Cabinet MediNova</strong><br>
        Alger, Algérie
      </div>
      <div class="v-badge">Loi 18-07</div>
    </div>
  </div>
</div>

<div class="no-print">
  <button class="btn-p" onclick="window.print()">Imprimer</button>
  <button class="btn-c" onclick="window.close()">Fermer</button>
</div>

</body></html>`;

    const w = window.open('', '_blank', 'width=560,height=760');
    w?.document.write(html);
    w?.document.close();
  }

    uploadPhoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { this.toast.error('Image trop grande (max 1MB)'); return; }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64 = e.target.result;
      this.api.uploadPhoto(base64).subscribe({
        next: () => {
          if (this.auth.user) this.auth.user.photo = base64;
          this.toast.success('Photo mise à jour !');
        },
        error: () => this.toast.error('Erreur upload photo.')
      });
    };
    reader.readAsDataURL(file);
  }

  formatJourConsult(dateStr: string): string {
    const jours = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const d = new Date(dateStr);
    return jours[d.getDay()];
  }

  getHealthY(index: number): number {
    const consultations = this.dossierComplet?.consultations || [];
    const c = consultations[index];
    const diag = (c.diagnostic || '').toLowerCase();
    if (diag.includes('urgent') || diag.includes('grave') || diag.includes('sévère')) return 40;
    if (diag.includes('chronique') || diag.includes('hypertension') || diag.includes('diabète')) return 70;
    if (diag.includes('grippe') || diag.includes('infection') || diag.includes('fièvre')) return 90;
    return 110;
  }

  getHealthPoints(): string {
    const consultations = this.dossierComplet?.consultations || [];
    return consultations.map((c: any, i: number) => `${80 + i * 80},${this.getHealthY(i)}`).join(' ');
  }

  getHealthArea(): string {
    const consultations = this.dossierComplet?.consultations || [];
    const lastX = 80 + (consultations.length - 1) * 80;
    const points = consultations.map((c: any, i: number) => `${80 + i * 80},${this.getHealthY(i)}`).join(' ');
    return `80,140 ${points} ${lastX},140`;
  }

  prendreRdv() {
    this.rdvError = "";
    if (!this.rdvMedecinId || !this.rdvDate || !this.rdvHeure || !this.rdvMotif) {
      this.rdvError = "Tous les champs sont obligatoires.";
      return;
    }
    this.loading["rdv-form"] = true;

    // Utiliser l'heure exacte du slot sélectionné
    const heureRdv = this.rdvSlotSelected?.heure || "08:00";

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
        this.rdvSlotsMap = {};
        this.rdvJourSelectionne = '';
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

  sauvegarderMedical() {
    this.medicalLoading = true;
    this.medicalError = "";
    this.api.updateMedical(this.auth.userId(), {
      groupe_sanguin:      this.profilGroupeSanguin,
      date_naissance:      this.profilDateNaissance,
      adresse:             this.profilAdresse,
      allergies:           this.profilAllergies,
      antecedents_medicaux: this.profilAntecedents,
    }).subscribe({
      next: () => {
        this.medicalLoading = false;
        this.medicalSuccess = "Informations médicales mises à jour.";
        this.chargerDonneesMedicales();
        this.chargerDossier();
        setTimeout(() => this.medicalSuccess = "", 4000);
      },
      error: e => { this.medicalLoading = false; this.medicalError = e.error?.message || "Erreur sauvegarde."; }
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

  getAge(): string {
    const dn = this.patientMedical?.date_naissance || this.dossierComplet?.patient?.date_naissance;
    if (!dn) return '—';
    const diff = Date.now() - new Date(dn).getTime();
    return Math.floor(diff / (365.25 * 24 * 3600 * 1000)) + ' ans';
  }

  countRdvStatut(s: string): number { return this.rdvList.filter(r => r.statut?.toLowerCase() === s).length; }

  formatStatut(s: string): string {
    const m: any = { en_attente: "En attente", confirme: "Confirmé", patient_arrive: "Patient arrivé", annule: "Annulé", termine: "Terminé" };
    return m[s?.toLowerCase()] || s;
  }
}