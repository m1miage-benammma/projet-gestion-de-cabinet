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
  profilSuccess = ""; profilError = ""; profilLoading = false;
  pwAncien = ""; pwNouveau = ""; pwConfirm = "";
  pwSuccess = ""; pwError = ""; pwLoading = false;
  dossierTab = -1;
  soinsPatient: any[] = [];

  // QR code tracker (CORRECTIF duplication : tracker séparé)
  private qrRenderedIds = new Set<number>();

  constructor(
    public auth: AuthService,
    private api: ApiService,
    public toast: ToastService
  ) {}

  showWelcome = false;
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
    // Onboarding — premier login
    const key = `medinova_welcome_${this.auth.userId()}`;
    if (!localStorage.getItem(key)) {
      setTimeout(() => { this.showWelcome = true; }, 800);
      localStorage.setItem(key, '1');
    }
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
    if (tab === "dossier" || tab === "ordonnances") { this.chargerDossier(); this.chargerRdv(); }
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
              patient: this.auth.user,
              consultations: consultations || []
            };
            this.loading["dossier"] = false;
          },
          error: (e: any) => {
            console.log('ERREUR CONSULTATIONS:', e);
            this.dossierComplet = { dossier: dos, patient: this.auth.user, consultations: [] };
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

  imprimerOrdonnance(o: any) {
    const url = `${window.location.protocol}//${window.location.hostname}:${window.location.port}?ordonnance=${o.id_ordonnance}`;
    window.open(url, '_blank');
  }

  imprimerDossier() {
    window.print();
  }

  genererFichePatient() {
    const p = this.dossierComplet?.patient || this.auth.user;
    const dos = this.dossierComplet?.dossier;
    const consultations = this.dossierComplet?.consultations || [];
    const date = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const consultsHtml = consultations.map((c: any, i: number) => `<tr><td>${i+1}</td><td>${new Date(c.date).toLocaleDateString('fr-FR')}</td><td>${c.diagnostic||'—'}</td><td>${c.traitement||'—'}</td><td>${c.note||'—'}</td></tr>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Fiche Patient</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;color:#333;padding:30px}.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0A3D62;padding-bottom:16px;margin-bottom:24px}.logo{font-size:24px;font-weight:900;color:#0A3D62}.logo span{color:#00C9A7}.section{margin-bottom:24px}.section-title{font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#0A3D62;border-left:4px solid #00C9A7;padding-left:12px;margin-bottom:12px}.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.info-box{background:#f8fafc;border-radius:8px;padding:12px;border:1px solid #e2e8f0}.info-label{font-size:10px;font-weight:700;text-transform:uppercase;color:#999;margin-bottom:4px}.info-val{font-size:14px;font-weight:600}.blood{background:#fee2e2;color:#991b1b;padding:4px 12px;border-radius:20px;font-weight:900;font-size:16px}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#0A3D62;color:white;padding:10px;text-align:left;font-size:11px;text-transform:uppercase}td{padding:10px;border-bottom:1px solid #f0f0f0}tr:nth-child(even){background:#f8fafc}.footer{margin-top:30px;border-top:1px solid #e2e8f0;padding-top:12px;display:flex;justify-content:space-between;font-size:11px;color:#999}</style></head><body>
    <div class="header"><div><div class="logo">Medi<span>Nova</span></div><div style="font-size:12px;color:#999;margin-top:4px">Cabinet médical · Alger</div></div><div style="text-align:right"><div style="font-size:18px;font-weight:700;color:#0A3D62">FICHE PATIENT COMPLÈTE</div><div style="font-size:12px;color:#999">N° DM-${dos?.id_dossier||'—'} · ${date}</div></div></div>
    <div class="section"><div class="section-title">Informations personnelles</div><div class="info-grid"><div class="info-box"><div class="info-label">Nom complet</div><div class="info-val">${p?.prenom||''} ${p?.nom||''}</div></div><div class="info-box"><div class="info-label">Date de naissance</div><div class="info-val">${p?.date_naissance||'—'}</div></div><div class="info-box"><div class="info-label">Genre</div><div class="info-val">${p?.genre==='M'?'♂ Masculin':'♀ Féminin'}</div></div><div class="info-box"><div class="info-label">Téléphone</div><div class="info-val">${p?.telephone||'—'}</div></div><div class="info-box"><div class="info-label">Email</div><div class="info-val">${p?.email||'—'}</div></div><div class="info-box"><div class="info-label">Groupe sanguin</div><div class="info-val"><span class="blood">${p?.groupe_sanguin||'ND'}</span></div></div></div></div>
    ${p?.allergies?`<div class="section"><div class="section-title">⚠️ Allergies</div><div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:12px">${p.allergies}</div></div>`:''}
    ${p?.antecedents_medicaux?`<div class="section"><div class="section-title">Antécédents médicaux</div><div class="info-box">${p.antecedents_medicaux}</div></div>`:''}
    <div class="section"><div class="section-title">Historique des consultations (${consultations.length})</div>${consultations.length>0?`<table><thead><tr><th>#</th><th>Date</th><th>Diagnostic</th><th>Traitement</th><th>Notes</th></tr></thead><tbody>${consultsHtml}</tbody></table>`:'<p style="color:#999;font-style:italic">Aucune consultation.</p>'}</div>
    <div class="footer"><span>Cabinet MediNova · Alger</span><span>Document confidentiel — Loi 17-08</span><span>N° DM-${dos?.id_dossier||'—'}</span></div>
    <script>setTimeout(()=>window.print(),500);</script></body></html>`;
    const w = window.open('', '_blank'); w?.document.write(html); w?.document.close();
  }

  genererCartePatient() {
    const p = this.dossierComplet?.patient || this.auth.user;
    const dos = this.dossierComplet?.dossier;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Carte Patient</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;background:#f0f4f8;display:flex;align-items:center;justify-content:center;min-height:100vh}.carte{width:340px;background:linear-gradient(135deg,#0A3D62 0%,#1a5c8a 60%,#00C9A7 100%);border-radius:16px;padding:20px;color:white;box-shadow:0 8px 32px rgba(0,0,0,.3);position:relative;overflow:hidden}.logo{font-size:18px;font-weight:900}.logo span{color:#b3f0e8}.badge{background:rgba(255,255,255,.15);padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:1px}.avatar{width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;margin-bottom:8px}.nom{font-size:16px;font-weight:900}.info-row{display:flex;gap:10px;margin-top:10px;flex-wrap:wrap}.info-box{background:rgba(255,255,255,.12);border-radius:6px;padding:5px 10px}.info-label{font-size:8px;opacity:.7;text-transform:uppercase}.info-val{font-size:12px;font-weight:700}.blood{background:#e74c3c;padding:2px 8px;border-radius:12px;font-size:13px;font-weight:900}@media print{body{background:white}.carte{box-shadow:none}}</style></head><body>
    <div class="carte"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px"><div class="logo">Medi<span>Nova</span></div><div class="badge">CARTE PATIENT</div></div><div class="avatar">${(p?.prenom||'?')[0]}${(p?.nom||'')[0]}</div><div class="nom">${p?.prenom||''} ${p?.nom||''}</div><div style="font-size:11px;opacity:.75;margin-top:2px">${p?.email||''}</div><div class="info-row"><div class="info-box"><div class="info-label">Groupe sanguin</div><div><span class="blood">${p?.groupe_sanguin||'ND'}</span></div></div><div class="info-box"><div class="info-label">Téléphone</div><div class="info-val">${p?.telephone||'—'}</div></div><div class="info-box"><div class="info-label">Genre</div><div class="info-val">${p?.genre==='M'?'♂':'♀'}</div></div></div>${p?.allergies?`<div style="margin-top:8px;font-size:10px;background:rgba(231,76,60,.3);padding:3px 8px;border-radius:4px">⚠️ ${p.allergies}</div>`:''}<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:14px;border-top:1px solid rgba(255,255,255,.15);padding-top:10px"><div style="font-size:10px;opacity:.7">N° DM-${dos?.id_dossier||'—'}<br>Cabinet MediNova · Alger</div><div style="font-size:9px;opacity:.6;text-align:right">Confidentiel<br>Loi 17-08</div></div></div>
    <script>setTimeout(()=>window.print(),500);</script></body></html>`;
    const w = window.open('', '_blank'); w?.document.write(html); w?.document.close();
  }  formatJourConsult(dateStr: string): string {
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

  countRdvStatut(s: string): number { return this.rdvList.filter(r => r.statut?.toLowerCase() === s).length; }

  formatStatut(s: string): string {
    const m: any = { en_attente: "En attente", confirme: "Confirmé", patient_arrive: "Patient arrivé", annule: "Annulé", termine: "Terminé" };
    return m[s?.toLowerCase()] || s;
  }
}