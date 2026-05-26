import { Component, ViewEncapsulation, OnInit, AfterViewChecked, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

const API = 'http://localhost:8000/api';

type Page = 'home' | 'login' | 'register' |
            'dashboard-patient' | 'dashboard-medecin' |
            'dashboard-infirmiere' | 'dashboard-admin';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, AfterViewChecked {

  @ViewChild('planningListTpl') planningListTpl!: TemplateRef<any>;
  @ViewChild('rdvJourTpl') rdvJourTpl!: TemplateRef<any>;
  @ViewChild('usersTableTpl') usersTableTpl!: TemplateRef<any>;
  @ViewChild('sidebarTpl') sidebarTpl!: TemplateRef<any>;
  @ViewChild('headerTpl') headerTpl!: TemplateRef<any>;
  @ViewChild('alertsTpl') alertsTpl!: TemplateRef<any>;
  @ViewChild('profilTpl') profilTpl!: TemplateRef<any>;

  page: Page = 'home';
  activeTab = 'accueil';
  sidebarOpen = false;
  user: any = null;
  token = '';

  // Login
  loginEmail = ''; loginPassword = '';
  loginLoading = false; loginError = ''; showPassword = false;

  // Register
  regNom=''; regPrenom=''; regEmail=''; regTelephone='';
  regGenre='M'; regPassword='';
  regLoading=false; regError=''; regSuccess='';
  regStep=1; regDateNaissance=''; regCni=''; regWilaya=''; regAdresse='';
  regGroupeSanguin='ND'; regAssurance=''; regAssuranceNum='';
  regAllergies=''; regAntecedents=''; regTraitements='';
  regUrgenceNom=''; regUrgenceTel='';
  regConsent=false; regSigValide=false; regSigData='';
  get today():string { return new Date().toLocaleDateString('fr-DZ',{day:'2-digit',month:'2-digit',year:'numeric'}); }
  readonly wilayas=['01 - Adrar','02 - Chlef','03 - Laghouat','04 - Oum El Bouaghi','05 - Batna','06 - Béjaïa','07 - Biskra','08 - Béchar','09 - Blida','10 - Bouira','11 - Tamanrasset','12 - Tébessa','13 - Tlemcen','14 - Tiaret','15 - Tizi Ouzou','16 - Alger','17 - Djelfa','18 - Jijel','19 - Sétif','20 - Saïda','21 - Skikda','22 - Sidi Bel Abbès','23 - Annaba','24 - Guelma','25 - Constantine','26 - Médéa','27 - Mostaganem','28 - MSila','29 - Mascara','30 - Ouargla','31 - Oran','32 - El Bayadh','33 - Illizi','34 - Bordj Bou Arréridj','35 - Boumerdès','36 - El Tarf','37 - Tindouf','38 - Tissemsilt','39 - El Oued','40 - Khenchela','41 - Souk Ahras','42 - Tipaza','43 - Mila','44 - Ain Defla','45 - Naâma','46 - Ain Témouchent','47 - Ghardaïa','48 - Relizane','49 - Timimoun','50 - Bordj Badji Mokhtar','51 - Ouled Djellal','52 - Béni Abbès','53 - In Salah','54 - In Guezzam','55 - Touggourt','56 - Djanet','57 - El MGhair','58 - El Meniaa'];

  // Admin create
  showCreateForm=false; createRole='medecin';
  createNom=''; createPrenom=''; createEmail=''; createTelephone='';
  createGenre='M'; createPassword='';
  createSpecialite=''; createNumeroOrdre=''; createNumeroEmploye='';
  createLoading=false; createError=''; createSuccess='';
  filterRole=''; filterSearch='';
  darkMode=false;

  private regCtx: CanvasRenderingContext2D|null=null;
  private regDrawing=false; private regLastX=0; private regLastY=0;





  toasts:any[]=[];
  stats:any={};
  consultEnregistree=false;
  lastConsultationId=0;
  ordonnanceGeneree:any=null;
  rdvSelectionne:any=null;
  consultForm={diagnostic:'',traitement:'',note:''};
  ordoForm={instructions:'',medicaments:[{nom:'',dosage:'',duree:''}]};

  chartLoaded=false;

  // IA Triage
  showTriageIA=false;
  calendarView=false;
  triageSymptomes='';
  triageMaladies='';
  triageLoading=false;
  triageResult: any = null;
  triageError='';

  // Profil edit
  profilPrenom=''; profilNom=''; profilEmail=''; profilTelephone='';
  profilLoading=false; profilSuccess=''; profilError='';

  // RDV form (patient)
  showRdvForm=false;
  rdvMedecinId=''; rdvDispoId=''; rdvMotif='';
  rdvDisponibilites: any[]=[];
  rdvLoading=false; rdvError=''; rdvSuccess='';

  // Consultation form (médecin)
  showConsultForm=false; consultRdvId='';
  consultDiagnostic=''; consultTraitement=''; consultNote='';
  consultLoading=false; consultError=''; consultSuccess='';

  // Ordonnance form (médecin)
  showOrdoForm=false; ordoConsultationId=''; ordoInstructions='';
  ordoMedicaments: {nom:string,dosage:string,duree:string}[]=[{nom:'',dosage:'',duree:''}];
  ordoLoading=false; ordoError=''; ordoSuccess='';

  // Disponibilité form (médecin)
  showDispoForm=false;
  dispoJour='Lundi'; dispoHeureDebut='08:00'; dispoHeureFin='17:00';
  dispoLoading=false; dispoError=''; dispoSuccess='';
  joursDisponibles=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  joursCodes:any={'Lundi':1,'Mardi':2,'Mercredi':3,'Jeudi':4,'Vendredi':5,'Samedi':6};

  // Planning médecin (schedule)
  showScheduleForm=false;
  scheduleJours:string[]=['Lundi','Mardi','Mercredi','Jeudi','Vendredi'];
  scheduleHeureDebut='08:00'; scheduleHeureFin='17:00'; scheduleDuree=30;
  scheduleLoading=false; scheduleError=''; scheduleSuccess='';

  // Slots patient
  rdvSlots: any[]=[];
  rdvSlotSelected: any=null;
  rdvSemaine=0; // 0=cette semaine, 1=semaine prochaine...

  // Soin form (infirmière)
  showSoinForm=false;
  soinPatientId=''; soinType='INJECTION'; soinFiche=''; soinObservation='';
  soinLoading=false; soinError=''; soinSuccess='';
  typesSoin=['INJECTION','PANSEMENT','PERFUSION','PRISE_DE_SANG','SOINS_PLAIE','AUTRE'];

  // Data
  medecins: any[]=[];
  rendezVous: any[]=[];
  consultations: any[]=[];
  ordonnances: any[]=[];
  notifications: any[]=[];
  adminUtilisateurs: any[]=[];
  adminRapport: any=null;
  planning: any[]=[];
  disponibilites: any[]=[];
  patients: any[]=[];
  soins: any[]=[];
  rdvDuJour: any[]=[];
  dossier: any = null;
  dossierComplet: any = null;

  loading: any={};
  successMsg=''; errorMsg='';

  constructor(private http: HttpClient) {}

  ngOnInit() { this.chargerMedecins(); this.loadDarkMode(); }

  ngAfterViewChecked() {
    if (this.ordonnances.length > 0 && this.activeTab === 'ordonnances') {
      this.ordonnances.forEach((o:any) => {
        const canvasId = 'qr-' + o.id_ordonnance;
        const el = document.getElementById(canvasId);
        if (el && !el.getAttribute('data-drawn')) {
          el.setAttribute('data-drawn', '1');
          const qrText = `MediNova|ORD-${o.id_ordonnance}|${o.date_emission}|Cabinet MediNova Alger`;
          if (el instanceof HTMLCanvasElement) {
            this.drawQR(el, qrText);
          }
        }
      });
    }
  }

  drawQR(canvas: HTMLCanvasElement, text: string) {
    // Use QRCode.js via script tag injected once
    const scriptId = 'qrcode-script';
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      s.onload = () => this.renderQRCanvas(canvas, text);
      document.head.appendChild(s);
    } else if ((window as any).QRCode) {
      this.renderQRCanvas(canvas, text);
    } else {
      setTimeout(() => this.drawQR(canvas, text), 500);
    }
  }

  renderQRCanvas(canvas: HTMLCanvasElement, text: string) {
    const QRCode = (window as any).QRCode;
    if (!QRCode) { setTimeout(() => this.renderQRCanvas(canvas, text), 300); return; }
    // Clear canvas first
    canvas.setAttribute('data-drawn', '1');
    const parent = canvas.parentElement;
    if (!parent) return;
    // Replace canvas with div for QRCode.js
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.justifyContent = 'center';
    parent.replaceChild(div, canvas);
    new QRCode(div, {
      text: text,
      width: 96,
      height: 96,
      colorDark: '#0A3D62',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  headers() { return new HttpHeaders({ Authorization:`Bearer ${this.token}`, Accept:'application/json' }); }

  goHome()     { this.page='home'; window.scrollTo(0,0); }
  goLogin()    { this.page='login'; this.loginError=''; window.scrollTo(0,0); }
  goRegister() { this.page='register'; this.regError=''; this.regSuccess=''; window.scrollTo(0,0); }
  scrollTo(id:string) { document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); }

  setTab(tab:string) {
    this.activeTab=tab; this.errorMsg=''; this.successMsg='';
    if (tab==='planning')       { this.chargerPlanning(); }
    if (tab==='dossier')        { this.chargerDossierComplet(); }
    if (tab==='ordonnances')    { this.chargerDossierComplet(); }
    if (tab==='notifications')  { this.chargerNotifications(); }
    if (tab==='patients')       { this.chargerPatients(); }
    if (tab==='soins')          { this.chargerSoins(); }
    if (tab==='rapport')        { this.chargerStats(); setTimeout(()=>this.drawAdminCharts(),300); }
    if (tab==='utilisateurs')   { this.chargerPatients(); }
    if (tab==='consultation' && !this.rdvSelectionne) { this.setTab('planning'); return; }
  }

  loadTabData(tab:string) {
    const r=this.user?.role;
    if (r==='patient') {
      if (['rdv','accueil'].includes(tab)) { this.chargerRdv(); this.chargerMedecins(); }
      if (tab==='dossier') this.chargerDossierComplet();
      if (tab==='ordonnances') this.chargerOrdonnances();
      if (tab==='notifications') this.chargerNotifications();
    }
    if (r==='medecin') {
      if (['planning','accueil'].includes(tab)) { this.chargerPlanning(); this.chargerPatients(); }
      if (tab==='disponibilites') this.chargerDisponibilites();
    }
    if (r==='infirmiere') {
      if (['rdv-jour','accueil'].includes(tab)) { this.chargerRdvJour(); this.chargerPatients(); }
      if (tab==='patients') this.chargerPatients();
      if (tab==='soins') { this.chargerSoins(); this.chargerRdvJour(); }
    }
    if (r==='admin') {
      if (['utilisateurs','accueil'].includes(tab)) { this.chargerUtilisateurs(); this.chargerRapport(); }
      if (tab==='rapport') this.chargerRapport();
    }
  }

  // LOGIN
  login() {
    this.loginLoading=true; this.loginError='';
    this.http.post<any>(`${API}/login`,{email:this.loginEmail,mot_de_passe:this.loginPassword}).subscribe({
      next:(res)=>{
        this.loginLoading=false; this.token=res.token; this.user=res;
        this.activeTab='accueil'; this.loadTabData('accueil');
        const map:any={patient:'dashboard-patient',medecin:'dashboard-medecin',infirmiere:'dashboard-infirmiere',admin:'dashboard-admin'};
        this.page=map[res.role]||'dashboard-patient';
        window.scrollTo(0,0);
      },
      error:(err)=>{ this.loginLoading=false; this.loginError=err.error?.message||'Email ou mot de passe incorrect.'; }
    });
  }

  // REGISTER
  register() {
    if (!this.regConsent) { this.regError='Acceptez la politique de confidentialité.'; return; }
    if (!this.regSigValide) { this.regError='Veuillez signer dans le cadre.'; return; }
    this.regLoading=true; this.regError=''; this.regSuccess='';
    this.http.post<any>(`${API}/register`,{
      nom: this.regNom, prenom: this.regPrenom,
      email: this.regEmail, telephone: this.regTelephone,
      genre: this.regGenre, password: this.regPassword,
      date_naissance: this.regDateNaissance,
      adresse: this.regAdresse, role: 'patient',
      num_cni: this.regCni, wilaya: this.regWilaya,
      groupe_sanguin: this.regGroupeSanguin || 'ND',
      allergies: this.regAllergies, antecedents: this.regAntecedents,
      traitements_cours: this.regTraitements,
      assurance_type: this.regAssurance, assurance_num: this.regAssuranceNum,
      contact_urgence_nom: this.regUrgenceNom, contact_urgence_tel: this.regUrgenceTel,
      signature_numerique: this.regSigData,
      consentement_donne: true, consentement_date: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.regLoading=false;
        this.regSuccess='✅ Dossier créé avec succès! Vous pouvez vous connecter.';
        setTimeout(() => this.page='login', 2500);
      },
      error: (e) => { this.regLoading=false; this.regError=e.error?.message||'Erreur inscription.'; }
    });
  }

  // LOGOUT
  logout() {
    this.http.post(`${API}/logout`,{},{headers:this.headers()}).subscribe();
    this.user=null; this.token='';
    this.rendezVous=[]; this.consultations=[]; this.ordonnances=[]; this.notifications=[];
    this.adminUtilisateurs=[]; this.planning=[]; this.patients=[]; this.soins=[]; this.rdvDuJour=[];
    this.page='home';
  }

  // ═══════ PATIENT ═══════
  chargerMedecins() {
    this.loading['medecins']=true;
    const opts=this.token?{headers:this.headers()}:{};
    this.http.get<any[]>(`${API}/medecins`,opts).subscribe({
      next:(d)=>{ this.medecins=d; this.loading['medecins']=false; },
      error:()=>{ this.loading['medecins']=false; }
    });
  }

  chargerRdv() {
    this.loading['rdv']=true;
    this.http.get<any[]>(`${API}/rdv-patient/${this.userId()}`,{headers:this.headers()}).subscribe({
      next:(d)=>{ this.rendezVous=d; this.loading['rdv']=false; },
      error:()=>{ this.loading['rdv']=false; }
    });
  }

  chargerDossierComplet() {
    this.loading['dossier']=true;
    this.http.get<any>(`${API}/dossier-complet/${this.userId()}`,{headers:this.headers()}).subscribe({
      next:(d)=>{
        this.dossierComplet=d;
        this.dossier=d.dossier;
        this.consultations=d.consultations||[];
        this.ordonnances=d.ordonnances||[];
        this.ordonnances.forEach((o:any)=>{
          this.http.get<any[]>(`${API}/medicaments/ordonnance/${o.id_ordonnance}`,{headers:this.headers()}).subscribe({
            next:(meds)=>{ o.medicaments=meds; },
            error:()=>{ o.medicaments=[]; }
          });
        });
        this.loading['dossier']=false;
      },
      error:()=>{ this.loading['dossier']=false; }
    });
  }

  chargerDossier() {
    this.loading['dossier']=true;
    this.http.get<any>(`${API}/dossier-utilisateur/${this.userId()}`,{headers:this.headers()}).subscribe({
      next:(d)=>{
        if (d?.id_dossier) {
          this.http.get<any[]>(`${API}/consultations/dossier/${d.id_dossier}`,{headers:this.headers()}).subscribe({
            next:(c)=>{ this.consultations=c; this.loading['dossier']=false; },
            error:()=>{ this.loading['dossier']=false; }
          });
        } else { this.loading['dossier']=false; }
      },
      error:()=>{ this.loading['dossier']=false; }
    });
  }

  chargerOrdonnances() {
    this.loading['ordonnances']=true;
    this.http.get<any[]>(`${API}/ordonnances/patient/${this.userId()}`,{headers:this.headers()}).subscribe({
      next:(d)=>{ this.ordonnances=d; this.loading['ordonnances']=false; },
      error:()=>{ this.loading['ordonnances']=false; }
    });
  }

  chargerNotifications() {
    this.loading['notifs']=true;
    this.http.get<any[]>(`${API}/notifications/${this.userId()}`,{headers:this.headers()}).subscribe({
      next:(d)=>{ this.notifications=d; this.loading['notifs']=false; },
      error:()=>{ this.loading['notifs']=false; }
    });
  }

  ouvrirRdvForm() {
    this.showRdvForm=true;
    this.rdvMedecinId=''; this.rdvDispoId=''; this.rdvMotif='';
    this.rdvDisponibilites=[]; this.rdvSlots=[]; this.rdvSlotSelected=null;
    this.rdvError=''; this.rdvSuccess='';
    this.chargerMedecins();
  }

  chargerDisposMedecin() {
    if (!this.rdvMedecinId) return;
    this.rdvDispoId=''; this.rdvSlots=[]; this.rdvSlotSelected=null;
    const opts=this.token?{headers:this.headers()}:{};
    // Charger les disponibilités du médecin
    this.http.get<any[]>(`${API}/disponibilites/medecin/${this.rdvMedecinId}`,opts).subscribe({
      next:(dispos)=>{
        this.rdvDisponibilites=dispos;
        if (dispos.length > 0) {
          // Charger aussi les RDV existants pour marquer les créneaux pris
          this.http.get<any[]>(`${API}/rendez-vous/medecin/${this.rdvMedecinId}`,{headers:this.headers()}).subscribe({
            next:(rdvs)=>{ this.genererSlots(dispos, rdvs); },
            error:()=>{ this.genererSlots(dispos, []); }
          });
        }
      },
      error:()=>{ this.rdvDisponibilites=[]; }
    });
  }

  // Génère les créneaux automatiquement comme les vols
  genererSlots(dispos: any[], rdvsExistants: any[]) {
    this.rdvSlots = [];
    const duree = 30; // minutes par consultation
    const today = new Date();

    // Générer pour les 14 prochains jours
    for (let d = 0; d < 14; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const jourNom = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'][date.getDay()];

      // Chercher disponibilité pour ce jour
      const dispo = dispos.find((dp:any) => dp.jour === jourNom);
      if (!dispo) continue;

      // Générer slots entre heure_debut et heure_fin
      const [hd, md] = dispo.heure_debut.split(':').map(Number);
      const [hf, mf] = dispo.heure_fin.split(':').map(Number);
      let current = hd * 60 + md;
      const fin = hf * 60 + mf;

      while (current + duree <= fin) {
        const h = Math.floor(current / 60);
        const m = current % 60;
        const heureStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
        const dateStr = date.toISOString().split('T')[0];

        // Vérifier si ce créneau est déjà pris
        const pris = rdvsExistants.some((r:any) =>
          r.date_rdv === dateStr &&
          r.heure_rdv === heureStr &&
          r.statut !== 'ANNULE'
        );

        this.rdvSlots.push({
          date: dateStr,
          heure: heureStr,
          jourNom,
          dateAffichage: date.toLocaleDateString('fr-FR', {weekday:'short', day:'numeric', month:'short'}),
          pris,
          id_disponibilite: dispo.id_disponibilite
        });
        current += duree;
      }
    }
  }

  selectionnerSlot(slot: any) {
    if (slot.pris) return;
    this.rdvSlotSelected = slot;
    this.rdvDispoId = slot.id_disponibilite;
  }

  prendreRdv() {
    if (!this.rdvSlotSelected) { this.rdvError='Veuillez sélectionner un créneau.'; return; }
    if (!this.rdvMotif.trim()) { this.rdvError='Veuillez indiquer le motif.'; return; }
    this.rdvLoading=true; this.rdvError=''; this.rdvSuccess='';
    const body = {
      id_patient: this.userId(),
      id_medecin: Number(this.rdvMedecinId),
      id_disponibilite: this.rdvSlotSelected.id_disponibilite,
      motif: this.rdvMotif,
      date_rdv: this.rdvSlotSelected.date,
      heure_rdv: this.rdvSlotSelected.heure,
      statut: 'EN_ATTENTE'
    };
    this.http.post<any>(`${API}/prise-rdv`, body, {headers:this.headers()}).subscribe({
      next:()=>{
        this.rdvLoading=false;
        this.rdvSuccess='Rendez-vous pris avec succès ! En attente de confirmation.';
        this.showRdvForm=false;
        this.successMsg="✅ Rendez-vous pris ! En attente de confirmation par l'infirmière.";
        this.chargerRdv();
      },
      error:(err)=>{
        this.rdvLoading=false;
        this.rdvError=err.error?.message||'Erreur lors de la prise de RDV. Vérifiez votre connexion.';
      }
    });
  }

  annulerRdv(id:number) {
    if (!confirm('Confirmer l\'annulation ?')) return;
    this.http.patch(`${API}/rdv/${id}/annuler`,{},{headers:this.headers()}).subscribe({
      next:()=>{ this.successMsg='RDV annulé.'; this.chargerRdv(); },
      error:()=>{
        this.http.patch(`${API}/rdv/${id}/annuler`,{},{headers:this.headers()}).subscribe({
          next:()=>{ this.successMsg='RDV annulé.'; this.chargerRdv(); },
          error:(e)=>{ this.errorMsg=e.error?.message||'Erreur.'; }
        });
      }
    });
  }

  // ═══════ MÉDECIN ═══════
  selectRdvForConsultation(rdv:any) {
    this.rdvSelectionne = rdv;
    this.consultEnregistree = false;
    this.ordonnanceGeneree = null;
    this.consultForm = {diagnostic:'', traitement:'', note:''};
    this.ordoForm = {instructions:'', medicaments:[{nom:'',dosage:'',duree:''}]};
    this.setTab('consultation');
  }

  chargerPlanning() {
    this.loading['planning']=true;
    this.http.get<any[]>(`${API}/rdv-medecin/${this.userId()}`,{headers:this.headers()}).subscribe({
      next:(d)=>{ this.planning=d; this.loading['planning']=false; },
      error:()=>{ this.loading['planning']=false; }
    });
  }

  chargerDisponibilites() {
    this.loading['dispos']=true;
    this.http.get<any[]>(`${API}/disponibilites/medecin/${this.userId()}`,{headers:this.headers()}).subscribe({
      next:(d)=>{ this.disponibilites=d; this.loading['dispos']=false; },
      error:()=>{ this.loading['dispos']=false; }
    });
  }

  confirmerRdv(id:number) {
    this.http.patch(`${API}/rdv/${id}/confirmer`,{},{headers:this.headers()}).subscribe({
      next:()=>{ this.successMsg='RDV confirmé ✅'; this.chargerPlanning(); },
      error:()=>{
        this.http.patch(`${API}/rendez-vous/${id}/confirmer`,{},{headers:this.headers()}).subscribe({
          next:()=>{ this.successMsg='RDV confirmé ✅'; this.chargerPlanning(); },
          error:(e)=>{ this.errorMsg=e.error?.message||'Erreur.'; }
        });
      }
    });
  }

  terminerRdv(id:number) {
    this.http.patch(`${API}/rdv/${id}/terminer`,{},{headers:this.headers()}).subscribe({
      next:()=>{ this.successMsg='Consultation terminée ✅'; this.chargerPlanning(); },
      error:()=>{
        this.http.patch(`${API}/rendez-vous/${id}/terminer`,{},{headers:this.headers()}).subscribe({
          next:()=>{ this.successMsg='Consultation terminée ✅'; this.chargerPlanning(); },
          error:(e)=>{ this.errorMsg=e.error?.message||'Erreur.'; }
        });
      }
    });
  }

  annulerRdvMedecin(id:number) {
    if (!confirm('Confirmer ?')) return;
    this.http.patch(`${API}/rdv/${id}/annuler`,{},{headers:this.headers()}).subscribe({
      next:()=>{ this.successMsg='RDV annulé.'; this.notifierAnnulation(id); this.chargerPlanning(); },
      error:()=>{
        this.http.patch(`${API}/rdv/${id}/annuler`,{},{headers:this.headers()}).subscribe({
          next:()=>{ this.successMsg='RDV annulé.'; this.notifierAnnulation(id); this.chargerPlanning(); },
          error:(e)=>{ this.errorMsg=e.error?.message||'Erreur.'; }
        });
      }
    });
  }

  ouvrirConsultForm(rdv:any) {
    this.showConsultForm=true;
    this.consultRdvId=rdv.id_rdv;
    this.consultDiagnostic=''; this.consultTraitement=''; this.consultNote='';
    this.consultError=''; this.consultSuccess='';
  }

  effectuerConsultation() {
    if (!this.consultForm.diagnostic || !this.consultForm.traitement) {
      this.errorMsg='Diagnostic et traitement sont obligatoires.'; return;
    }
    this.loading['consult']=true; this.errorMsg=''; this.successMsg='';
    // Get or create dossier
    this.http.get<any>(`${API}/dossier-utilisateur/${this.rdvSelectionne?.id_patient}`,{headers:this.headers()}).subscribe({
      next:(dos)=>{
        const body = {
          id_dossier: dos.id_dossier,
          id_medecin: this.userId(),
          date: new Date().toISOString().split('T')[0],
          diagnostic: this.consultForm.diagnostic,
          traitement: this.consultForm.traitement,
          note: this.consultForm.note
        };
        this.http.post<any>(`${API}/consultation-directe`, body, {headers:this.headers()}).subscribe({
          next:(c)=>{
            this.lastConsultationId = c.id_consultation;
            this.consultEnregistree = true;
            this.successMsg = '✅ Consultation enregistrée!';
            this.loading['consult']=false;
          },
          error:(e)=>{ this.errorMsg=e.error?.message||'Erreur consultation.'; this.loading['consult']=false; }
        });
      },
      error:()=>{ this.errorMsg='Erreur dossier.'; this.loading['consult']=false; }
    });
  }

  creerConsultation(idDossier:number, rdv:any) {
    this.http.post<any>(`${API}/consultation-directe`,{
      id_dossier: idDossier,
      id_medecin: this.userId(),
      date: new Date().toISOString().split('T')[0],
      diagnostic: this.consultDiagnostic,
      traitement: this.consultTraitement,
      note: this.consultNote
    },{headers:this.headers()}).subscribe({
      next:(consult)=>{
        this.consultLoading=false;
        this.showConsultForm=false;
        this.ordoConsultationId = String(consult.id_consultation || consult.id);
        this.successMsg='Consultation enregistrée ✅ Cliquez 💊 Ordonnance pour prescrire.';
        this.terminerRdv(Number(this.consultRdvId));
      },
      error:(err)=>{ this.consultLoading=false; this.consultError=err.error?.message||'Erreur consultation.'; }
    });
  }

  ouvrirOrdoForm(rdvId:number) {
    this.showOrdoForm=true;
    this.ordoInstructions='';
    this.ordoMedicaments=[{nom:'',dosage:'',duree:''}];
    this.ordoError=''; this.ordoSuccess='';

    // Chercher la consultation liée à ce RDV via le dossier du patient
    const rdv = this.planning.find((r:any) => r.id_rdv == rdvId);
    if (!rdv) { this.ordoConsultationId = String(rdvId); return; }

    // Chercher le dossier du patient
    this.http.get<any>(`${API}/dossier-utilisateur/${rdv.id_patient}`,{headers:this.headers()}).subscribe({
      next:(dossier)=>{
        if (!dossier?.id_dossier) { this.ordoError='Dossier introuvable.'; return; }
        // Chercher les consultations du dossier
        this.http.get<any[]>(`${API}/consultations/dossier/${dossier.id_dossier}`,{headers:this.headers()}).subscribe({
          next:(consults)=>{
            if (consults && consults.length > 0) {
              // Prendre la dernière consultation
              const lastConsult = consults[consults.length - 1];
              this.ordoConsultationId = String(lastConsult.id_consultation);
            } else {
              this.ordoError='Aucune consultation trouvée. Effectuez une consultation avant.';
              this.showOrdoForm = false;
            }
          },
          error:()=>{ this.ordoError='Erreur récupération consultation.'; }
        });
      },
      error:()=>{ this.ordoConsultationId = String(rdvId); }
    });
  }

  envoyerRappels() {
    this.loading['rappels']=true;
    this.http.get<any>(`${API}/rappels-rdv`,{headers:this.headers()}).subscribe({
      next:(r)=>{
        this.loading['rappels']=false;
        this.showToast(r.message, r.emails_envoyes>0?'success':'warning');
        this.successMsg=r.message;
      },
      error:()=>{ this.loading['rappels']=false; this.errorMsg='Erreur envoi rappels'; }
    });
  }

  notifierAnnulation(idRdv:number) {
    this.http.post<any>(`${API}/notifier-annulation`,{id_rdv:idRdv},{headers:this.headers()}).subscribe({
      next:(r)=>{ this.showToast(r.message, r.success?'success':'warning'); },
      error:()=>{}
    });
  }

  showToast(msg:string, type:'success'|'error'|'warning'='success') {
    const t = {msg, type, id: Date.now()};
    this.toasts.push(t);
    setTimeout(()=>{ this.toasts = this.toasts.filter(x=>x.id!==t.id); }, 3500);
  }

  ajouterMedicament() { this.ordoForm.medicaments.push({nom:'',dosage:'',duree:''}); }
  supprimerMedicament(i:number) { this.ordoForm.medicaments.splice(i,1); }

  redigerOrdonnance() {
    this.loading['ordo']=true; this.errorMsg=''; this.successMsg='';
    const body = { id_consultation: this.lastConsultationId, instructions: this.ordoForm.instructions };
    this.http.post<any>(`${API}/ordonnance-directe`, body, {headers:this.headers()}).subscribe({
      next:(o)=>{
        const ordoId = o.id_ordonnance;
        const meds = this.ordoForm.medicaments.filter((m:any)=>m.nom);
        const reqs = meds.map((m:any)=>
          this.http.post(`${API}/medicament-direct`,{id_ordonnance:ordoId,...m},{headers:this.headers()})
        );
        if(reqs.length===0){ this.ordonnanceGeneree=o; this.successMsg='✅ Ordonnance créée!'; this.showToast('✅ Ordonnance créée!','success'); this.loading['ordo']=false; return; }
        let done=0;
        reqs.forEach((r:any)=>r.subscribe({
          next:()=>{ done++; if(done===reqs.length){ this.ordonnanceGeneree={...o,medicaments:meds,medecin_nom:'',medecin_prenom:''}; this.successMsg='✅ Ordonnance + médicaments enregistrés!'; this.showToast('✅ Ordonnance + médicaments enregistrés!','success'); this.loading['ordo']=false; }},
          error:()=>{ done++; if(done===reqs.length){ this.loading['ordo']=false; }}
        }));
      },
      error:(e)=>{ this.errorMsg=e.error?.message||'Erreur ordonnance.'; this.loading['ordo']=false; }
    });
  }

  // Sauvegarder le planning médecin
  sauvegarderPlanning() {
    this.scheduleLoading=true; this.scheduleError=''; this.scheduleSuccess='';
    // Supprimer les anciens créneaux et créer les nouveaux
    const requests = this.scheduleJours.map((jour:string) =>
      this.http.post<any>(`${API}/disponibilites`,{
        id_medecin:this.userId(), jour,
        heure_debut:this.scheduleHeureDebut,
        heure_fin:this.scheduleHeureFin
      },{headers:this.headers()}).toPromise()
    );
    Promise.all(requests).then(()=>{
      this.scheduleLoading=false;
      this.scheduleSuccess='Planning sauvegardé ✅ Les patients peuvent maintenant réserver !';
      this.showScheduleForm=false;
      this.chargerDisponibilites();
      setTimeout(()=>this.scheduleSuccess='',4000);
    }).catch(()=>{
      this.scheduleLoading=false;
      this.scheduleError='Erreur lors de la sauvegarde.';
    });
  }

  toggleJour(jour:string) {
    const idx=this.scheduleJours.indexOf(jour);
    if (idx>=0) this.scheduleJours.splice(idx,1);
    else this.scheduleJours.push(jour);
  }

  isJourSelected(jour:string) { return this.scheduleJours.includes(jour); }

  ajouterDisponibilite() {
    this.dispoLoading=true; this.dispoError=''; this.dispoSuccess='';
    this.http.post<any>(`${API}/disponibilites`,{
      id_medecin:this.userId(), jour:this.dispoJour,
      heure_debut:this.dispoHeureDebut, heure_fin:this.dispoHeureFin
    },{headers:this.headers()}).subscribe({
      next:()=>{
        this.dispoLoading=false; this.dispoSuccess='Créneau ajouté ✅';
        this.showDispoForm=false; this.chargerDisponibilites();
        setTimeout(()=>this.dispoSuccess='',3000);
      },
      error:(err)=>{ this.dispoLoading=false; this.dispoError=err.error?.message||'Erreur.'; }
    });
  }

  supprimerDisponibilite(id:number) {
    if (!confirm('Supprimer ce créneau ?')) return;
    this.http.delete(`${API}/disponibilites/${id}`,{headers:this.headers()}).subscribe({
      next:()=>{ this.successMsg='Créneau supprimé.'; this.chargerDisponibilites(); },
      error:(e)=>{ this.errorMsg=e.error?.message||'Erreur.'; }
    });
  }

  countPlanning(s:string) { return this.planning.filter(r=>(r.statut||'').toLowerCase()===s.toLowerCase()).length; }

  // ═══════ INFIRMIÈRE ═══════
  chargerRdvJour() {
    this.loading['rdvJour']=true;
    this.http.get<any[]>(`${API}/tous-rdv`,{headers:this.headers()}).subscribe({
      next:(d)=>{
        // Filtre case-insensitive
        this.rdvDuJour = d.filter((r:any) => {
          const s = (r.statut||'').toLowerCase();
          return s === 'en_attente' || s === 'confirme' || s === 'patient_arrive';
        });
        this.loading['rdvJour']=false;
      },
      error:(e)=>{
        this.errorMsg='Erreur chargement RDV: '+JSON.stringify(e.error);
        this.loading['rdvJour']=false;
      }
    });
  }

  chargerPatients() {
    this.loading['patients']=true;
    this.http.get<any[]>(`${API}/patients`,{headers:this.headers()}).subscribe({
      next:(d)=>{ this.patients=d; this.loading['patients']=false; },
      error:()=>{ this.loading['patients']=false; }
    });
  }

  chargerSoins() {
    this.loading['soins']=true;
    this.http.get<any[]>(`${API}/soins-infirmiere/${this.userId()}`,{headers:this.headers()}).subscribe({
      next:(d)=>{ this.soins=d; this.loading['soins']=false; },
      error:()=>{
        this.http.get<any[]>(`${API}/soins/infirmiere/${this.userId()}`,{headers:this.headers()}).subscribe({
          next:(d2)=>{ this.soins=d2; this.loading['soins']=false; },
          error:()=>{ this.soins=[]; this.loading['soins']=false; }
        });
      }
    });
  }

  patientArrive(id:number) {
    this.http.patch(`${API}/rdv/${id}/patient-arrive`,{},{headers:this.headers()}).subscribe({
      next:()=>{ this.successMsg='Patient arrivé ✅'; this.chargerRdvJour(); },
      error:(e)=>{ this.errorMsg='Erreur: '+(e.error?.message||'Rebuilder le backend'); }
    });
  }

  confirmerRdvInf(id:number) {
    this.http.patch(`${API}/rdv/${id}/confirmer`,{},{headers:this.headers()}).subscribe({
      next:()=>{ this.successMsg='RDV confirmé ✅'; this.chargerRdvJour(); },
      error:(e)=>{ this.errorMsg='Erreur: '+(e.error?.message||'Rebuilder le backend'); }
    });
  }

  ouvrirSoinForm() {
    this.showSoinForm=true;
    this.soinPatientId=''; this.soinType='INJECTION';
    this.soinFiche=''; this.soinObservation='';
    this.soinError=''; this.soinSuccess='';
    // Charger les RDV du jour pour avoir les patients
    this.chargerRdvJour();
  }

  enregistrerSoin() {
    this.soinLoading=true; this.soinError='';
    this.http.post<any>(`${API}/soin-direct`,{
      id_infirmiere: this.userId(),
      id_patient: Number(this.soinPatientId),
      type_soin: this.soinType,
      fiche_soin: this.soinFiche,
      date: new Date().toISOString().split('T')[0],
      observation: this.soinObservation
    },{headers:this.headers()}).subscribe({
      next:()=>{
        this.soinLoading=false; this.showSoinForm=false;
        this.successMsg='Soin enregistré ✅'; this.chargerSoins();
      },
      error:(err)=>{ this.soinLoading=false; this.soinError=err.error?.message||'Erreur soin.'; }
    });
  }

  // ═══════ ADMIN ═══════
  chargerUtilisateurs() {
    this.loading['users']=true;
    this.http.get<any[]>(`${API}/admin/utilisateurs`,{headers:this.headers()}).subscribe({
      next:(d)=>{ this.adminUtilisateurs=d; this.loading['users']=false; },
      error:()=>{ this.loading['users']=false; }
    });
  }

  chargerRapport() {
    this.loading['rapport']=true;
    this.http.get<any>(`${API}/admin/rapport`,{headers:this.headers()}).subscribe({
      next:(d)=>{ this.adminRapport=d; this.loading['rapport']=false; this.chartLoaded=false; setTimeout(()=>this.drawAdminCharts(),400); },
      error:()=>{ this.loading['rapport']=false; }
    });
  }

  creerCompte() {
    this.createLoading=true; this.createError=''; this.createSuccess='';
    const body:any={nom:this.createNom,prenom:this.createPrenom,email:this.createEmail,telephone:this.createTelephone,genre:this.createGenre,mot_de_passe:this.createPassword};
    let endpoint='';
    if (this.createRole==='medecin') { endpoint=`${API}/medecins`; body.specialite=this.createSpecialite; body.numero_ordre=this.createNumeroOrdre; }
    else { endpoint=`${API}/infirmieres`; body.numero_employe=this.createNumeroEmploye; body.date_embauche=new Date().toISOString().split('T')[0]; }
    this.http.post<any>(endpoint,body,{headers:this.headers()}).subscribe({
      next:()=>{
        this.createLoading=false; this.createSuccess='Compte créé ✅';
        this.createNom=this.createPrenom=this.createEmail=this.createTelephone=this.createPassword='';
        this.createSpecialite=this.createNumeroOrdre=this.createNumeroEmploye='';
        this.chargerUtilisateurs();
        setTimeout(()=>{ this.showCreateForm=false; this.createSuccess=''; },3000);
      },
      error:(err)=>{ this.createLoading=false; this.createError=err.error?.message||'Erreur.'; }
    });
  }

  utilisateursFiltres() {
    return this.adminUtilisateurs.filter(u=>{
      const r=!this.filterRole||u.role===this.filterRole;
      const s=!this.filterSearch||(u.nom+' '+u.prenom+' '+u.email).toLowerCase().includes(this.filterSearch.toLowerCase());
      return r&&s;
    });
  }

  activerCompte(id:number) {
    this.http.patch(`${API}/admin/utilisateurs/${id}/activer`,{},{headers:this.headers()}).subscribe({
      next:()=>{ this.successMsg='Compte activé ✅'; this.chargerUtilisateurs(); },
      error:(e)=>{ this.errorMsg=e.error?.message||'Erreur.'; }
    });
  }

  desactiverCompte(id:number) {
    if (!confirm('Désactiver ?')) return;
    this.http.patch(`${API}/admin/utilisateurs/${id}/desactiver`,{},{headers:this.headers()}).subscribe({
      next:()=>{ this.successMsg='Compte désactivé.'; this.chargerUtilisateurs(); },
      error:(e)=>{ this.errorMsg=e.error?.message||'Erreur.'; }
    });
  }

  supprimerCompte(id:number) {
    if (!confirm('Supprimer définitivement ?')) return;
    this.http.delete(`${API}/admin/utilisateurs/${id}`,{headers:this.headers()}).subscribe({
      next:()=>{ this.successMsg='Compte supprimé.'; this.chargerUtilisateurs(); },
      error:(e)=>{ this.errorMsg=e.error?.message||'Erreur.'; }
    });
  }

  // HELPERS
  // Initialiser le formulaire profil
  initProfilForm() {
    this.profilPrenom = this.user?.prenom || '';
    this.profilNom    = this.user?.nom || '';
    this.profilEmail  = this.user?.email || '';
    this.profilTelephone = this.user?.telephone || '';
  }

  sauvegarderProfil() {
    this.profilLoading=true; this.profilError=''; this.profilSuccess='';
    this.http.put<any>(`${API}/utilisateurs/${this.userId()}`,{
      nom: this.profilNom, prenom: this.profilPrenom,
      email: this.profilEmail, telephone: this.profilTelephone
    },{headers:this.headers()}).subscribe({
      next:(res)=>{
        this.profilLoading=false;
        this.profilSuccess='Profil mis à jour ✅';
        this.user.prenom=this.profilPrenom;
        this.user.nom=this.profilNom;
        this.user.email=this.profilEmail;
        this.user.telephone=this.profilTelephone;
        setTimeout(()=>this.profilSuccess='',3000);
      },
      error:(err)=>{ this.profilLoading=false; this.profilError=err.error?.message||'Erreur.'; }
    });
  }

  marquerNotifLue(id:number) {
    this.http.patch(`${API}/notifications/${id}/lu`,{},{headers:this.headers()}).subscribe({
      next:()=>{ this.chargerNotifications(); },
      error:()=>{}
    });
  }

  marquerToutesLues() {
    const nonLues = this.notifications.filter(n=>!n.lu);
    Promise.all(nonLues.map(n=>
      this.http.patch(`${API}/notifications/${n.id_notification}/lu`,{},{headers:this.headers()}).toPromise()
    )).then(()=>this.chargerNotifications());
  }

  // Trouver le nom du patient par id
  getNomPatient(rdv:any): string {
    if (rdv?.prenom && rdv?.nom) return `${rdv.prenom} ${rdv.nom}`;
    if (rdv?.nom) return rdv.nom;
    const p = this.patients.find((p:any)=>p.id_utilisateur===rdv?.id_patient||p.id_patient===rdv?.id_patient);
    return p ? `${p.prenom} ${p.nom}` : `Patient #${rdv?.id_patient}`;
  }

  getKeys(obj:any) { return obj?Object.keys(obj):[]; }

  // ═══ IA TRIAGE ═══
  analyserSymptomes() {
    if (!this.triageSymptomes.trim()) return;
    this.triageLoading=true; this.triageResult=null; this.triageError='';
    // Analyse IA locale - instantanee, sans API key, sans backend
    setTimeout(() => {
      const result = this.analyseIA(this.triageSymptomes, this.triageMaladies);
      this.triageResult = result;
      if (result.specialite && this.medecins.length > 0) {
        const spec = result.specialite.toLowerCase();
        const match = this.medecins.find((m:any) =>
          (m.specialite||'').toLowerCase().includes(spec) ||
          spec.includes((m.specialite||'').toLowerCase())
        );
        if (match) { this.rdvMedecinId = String(match.id_utilisateur); this.chargerDisposMedecin(); }
      }
      this.triageLoading=false;
    }, 1500);
  }

  analyseIA(symptomes: string, maladies: string): any {
    const s = (symptomes + " " + maladies).toLowerCase();
    const rules: any[] = [
      { keywords:["coeur","cardiaque","thoracique","thorax","poitrine","infarctus","palpitation"], spec:"Cardiologie", urgence:"critique", label:"Critique",
        conseils:["Appelez le 15 immediatement","Restez allonge","Ne prenez aucun medicament sans avis"],
        eviter:["Tout effort physique","Conduire seul"] },
      { keywords:["dent","dentaire","molaire","gencive","machoire","douleur dent"], spec:"Dentiste", urgence:"moyen", label:"Attention",
        conseils:["Prenez un antidouleur (Paracetamol)","Evitez les aliments chauds et froids","Rincez a l eau salee"],
        eviter:["Aspirine (favorise le saignement)","Aliments durs"] },
      { keywords:["diabete","glycemie","insuline","sucre eleve","hypoglycemie"], spec:"Endocrinologie", urgence:"moyen", label:"Attention",
        conseils:["Controlez votre glycemie","Restez hydrate","Suivez votre regime alimentaire"],
        eviter:["Sucres rapides en exces","Sauter des repas"] },
      { keywords:["tension","hypertension","pression","vertiges","maux de tete"], spec:"Cardiologie", urgence:"urgent", label:"Urgent",
        conseils:["Mesurez votre tension","Reposez-vous","Prenez vos medicaments habituels"],
        eviter:["Cafe et sel","Effort intense","Stress"] },
      { keywords:["os","fracture","chute","genou","hanche","articulation","dos"], spec:"Orthopedie", urgence:"urgent", label:"Urgent",
        conseils:["Immobilisez la zone","Appliquez de la glace","Consultez rapidement"],
        eviter:["Mobiliser la zone","Porter du poids"] },
      { keywords:["enfant","pediatrie","nourrisson","bebe","fievre enfant"], spec:"Pediatrie", urgence:"urgent", label:"Urgent",
        conseils:["Prenez la temperature","Donnez du Paracetamol adapte","Hydratez l enfant"],
        eviter:["Aspirine chez l enfant","Baignades froides"] },
      { keywords:["oeil","vision","vue","ophtalmologie","conjonctivite"], spec:"Ophtalmologie", urgence:"moyen", label:"Attention",
        conseils:["Ne frottez pas les yeux","Portez des lunettes de soleil","Evitez les ecrans"],
        eviter:["Lentilles de contact","Maquillage"] },
      { keywords:["peau","eczema","psoriasis","allergie cutanee","eruption","urticaire"], spec:"Dermatologie", urgence:"faible", label:"Normal",
        conseils:["Hydratez la peau","Evitez les irritants","Appliquez une creme apaisante"],
        eviter:["Gratter les lesions","Savons agressifs"] },
      { keywords:["estomac","gastrique","nausee","vomissement","diarrhee","intestin"], spec:"Gastroenterologie", urgence:"moyen", label:"Attention",
        conseils:["Hydratez-vous abondamment","Mangez leger","Prenez du Smecta"],
        eviter:["Lait et graisses","Alcool et cafe"] },
      { keywords:["poumon","respiration","toux","asthme","bronchite","essoufflement"], spec:"Pneumologie", urgence:"urgent", label:"Urgent",
        conseils:["Restez en position assise","Aerez la piece","Prenez votre bronchodilatateur"],
        eviter:["Fumee et poussiere","Effort physique"] },
      { keywords:["rein","urine","urines","prostate","urinaire"], spec:"Urologie", urgence:"moyen", label:"Attention",
        conseils:["Buvez beaucoup d eau","Evitez la retention","Consulter si fievre"],
        eviter:["Retenir l urine","Deshydratation"] },
      { keywords:["stress","anxiete","depression","insomnie","mental"], spec:"Psychiatrie", urgence:"faible", label:"Normal",
        conseils:["Pratiquez la respiration profonde","Marchez 30 min par jour","Parlez a un proche"],
        eviter:["Alcool et cafe","Isolement"] },
      { keywords:["gynecologie","regles","menstruations","grossesse","ovaires"], spec:"Gynecologie", urgence:"moyen", label:"Attention",
        conseils:["Notez vos symptomes","Prenez du repos","Consultez en cas de saignements"],
        eviter:["Automédication","Efforts intenses"] },
    ];
    let best: any = null;
    let maxScore = 0;
    for (const rule of rules) {
      const score = rule.keywords.filter((k:string) => s.includes(k)).length;
      if (score > maxScore) { maxScore = score; best = rule; }
    }
    if (!best || maxScore === 0) {
      best = { spec:"Medecine generale", urgence:"faible", label:"Normal",
        conseils:["Consultez un medecin generaliste","Notez vos symptomes avec leur duree","Prenez du repos"],
        eviter:["Automédication prolongee"] };
    }
    const urgenceMap: any = {
      critique: { consulter: true,  resume: "Situation grave - consultation immediate requise" },
      urgent:   { consulter: true,  resume: "Consultez un medecin dans les 24-48h" },
      moyen:    { consulter: false, resume: "Consultation recommandee cette semaine" },
      faible:   { consulter: false, resume: "Pas urgent - suivi medical conseille" }
    };
    const meds: any = {
      critique: [], urgent: ["Paracetamol 1g si douleur"],
      moyen: ["Paracetamol 500mg","Ibuprofene si douleur"], faible: ["Paracetamol 500mg"]
    };
    return {
      urgence: best.urgence,
      urgence_label: best.label,
      specialite: best.spec,
      specialites_secondaires: ["Medecine generale"],
      resume: urgenceMap[best.urgence].resume,
      conseils: best.conseils,
      a_eviter: best.eviter || [],
      medicaments_otc: meds[best.urgence] || [],
      consulter_rapidement: urgenceMap[best.urgence].consulter
    };
  }

  // ═══ EMAIL ORDONNANCE ═══
  envoyerOrdonnanceEmail(o: any) {
    const email = this.user?.email;
    if (!email) { this.errorMsg = 'Email patient introuvable'; return; }
    const meds = o.medicaments || [];
    this.http.post<any>(`${API}/envoyer-ordonnance`, {
      email:        email,
      patient:      `${this.user?.prenom} ${this.user?.nom}`,
      medecin:      'Dr. MediNova',
      date:         o.date_emission,
      ref:          `ORD-2026-${o.id_ordonnance}`,
      instructions: o.instructions,
      medicaments:  meds
    }, {headers: this.headers()}).subscribe({
      next: (r) => { this.successMsg = r.message || 'Ordonnance envoyée par email ✅'; },
      error: (e) => { this.errorMsg = e.error?.message || 'Erreur envoi email.'; }
    });
  }

  getUrgenceClass(urgence: string) {
    const m:any={faible:'urgence-faible',moyen:'urgence-moyen',urgent:'urgence-urgent',critique:'urgence-critique'};
    return m[urgence]||'urgence-faible';
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode', this.darkMode);
    localStorage.setItem('darkMode', this.darkMode ? '1' : '0');
  }

  loadDarkMode() {
    this.darkMode = localStorage.getItem('darkMode') === '1';
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  chargerStats() {
    this.loading['stats']=true;
    this.http.get<any>(`${API}/admin/stats`,{headers:this.headers()}).subscribe({
      next:(d)=>{ this.stats=d; this.loading['stats']=false; setTimeout(()=>this.drawAdminCharts(),100); },
      error:()=>{ this.loading['stats']=false; }
    });
  }

  drawAdminCharts() {
    if (!this.adminRapport || this.chartLoaded) return;
    this.chartLoaded = true;
    setTimeout(() => {
      this.drawBarChart('chart-rdv', [
        {label:'RDV total', val: this.adminRapport.total_rdv||0, color:'#0A3D62'},
        {label:'Médecins', val: this.adminRapport.total_medecins||0, color:'#27AE60'},
        {label:'Patients', val: this.adminRapport.total_patients||0, color:'#7D3C98'},
        {label:'Infirmières', val: this.adminRapport.total_infirmieres||0, color:'#C0392B'},
      ]);
    }, 300);
  }

  drawBarChart(id: string, data: {label:string,val:number,color:string}[]) {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const max = Math.max(...data.map(d=>d.val), 1);
    const barW = (W - 40) / data.length - 10;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    data.forEach((d, i) => {
      const x = 20 + i * (barW + 10);
      const barH = ((d.val / max) * (H - 50));
      const y = H - 30 - barH;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 6);
      ctx.fill();
      ctx.fillStyle = d.color;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(d.val), x + barW/2, y - 6);
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.fillText(d.label, x + barW/2, H - 8);
    });
  }

  // Générer aperçu des créneaux (pour le formulaire médecin)
  getPreviewSlots(): string[] {
    const slots: string[] = [];
    const [hd, md] = this.scheduleHeureDebut.split(':').map(Number);
    const [hf, mf] = this.scheduleHeureFin.split(':').map(Number);
    let current = hd * 60 + md;
    const fin = hf * 60 + mf;
    while (current + 30 <= fin) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
      current += 30;
    }
    return slots.slice(0, 8); // Max 8 en aperçu
  }

  // Générer les créneaux d'une disponibilité
  getDispoSlots(dispo: any): string[] {
    const slots: string[] = [];
    const [hd, md] = (dispo.heure_debut||'08:00').split(':').map(Number);
    const [hf, mf] = (dispo.heure_fin||'17:00').split(':').map(Number);
    let current = hd * 60 + md;
    const fin = hf * 60 + mf;
    while (current + 30 <= fin) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
      current += 30;
    }
    return slots;
  }

  // Regrouper les slots par jour (remplace le pipe)
  getSlotsParJour(jour: string): any[] {
    return this.rdvSlots.filter(s => s.jourNom === jour);
  }

  // Obtenir les jours uniques qui ont des slots
  getJoursAvecSlots(): string[] {
    const dates = [...new Set(this.rdvSlots.map(s => s.date))];
    return dates.slice(0, 10);
  }

  getSlotsParDate(date: string): any[] {
    return this.rdvSlots.filter(s => s.date === date);
  }
  initiales() { if (!this.user) return'?'; return (this.user.prenom?.[0]||'')+(this.user.nom?.[0]||''); }
  prochainRdv() { return this.rendezVous.find(r=>r.statut==='CONFIRME'||r.statut==='EN_ATTENTE')||null; }
  notifsNonLues() { return this.notifications.filter((n:any)=>!n.lu).length; }

  getUrgenceRdv(rdv:any): string {
    const h = parseInt((rdv.heure_rdv||'09:00').split(':')[0]);
    const stat = (rdv.statut||'').toLowerCase();
    if (stat === 'patient_arrive') return 'urgent';
    if (stat === 'confirme') return 'confirme';
    if (stat === 'en_attente') return 'attente';
    return '';
  }

  getCalendrierMois(): {date:number,dateStr:string,rdvs:any[],isToday:boolean}[] {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const days: any[] = [];
    for (let i=0; i<(firstDay||7)-1; i++) days.push(null);
    for (let d=1; d<=daysInMonth; d++) {
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const rdvs = this.planning.filter((r:any) => r.date_rdv === dateStr);
      days.push({ date: d, dateStr, rdvs, isToday: d === today.getDate() });
    }
    return days;
  }

  getMoisLabel(): string {
    const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    return mois[new Date().getMonth()] + ' ' + new Date().getFullYear();
  }

  exportDossierPDF() {
    window.print();
  }
  isActif(u:any) { return u.actif===1||u.actif===true||u.actif==='1'; }

  // Retourne l'ID correct selon le backend
  userId(): number {
    return this.user?.id_utilisateur || this.user?.id || 0;
  }

  getRoleLabel(r:string) { const m:any={patient:'Patient',medecin:'Médecin',infirmiere:'Infirmière',admin:'Admin'}; return m[r]||r; }
  getRoleClass(r:string) { const m:any={patient:'role-patient',medecin:'role-medecin',infirmiere:'role-infirmiere',admin:'role-admin'}; return m[r]||''; }
  getDashClass() { const m:any={patient:'theme-patient',medecin:'theme-medecin',infirmiere:'theme-infirmiere',admin:'theme-admin'}; return m[this.user?.role]||''; }

  getStatutClass(s:string) {
    const u=(s||'').toUpperCase();
    const m:any={CONFIRME:'statut-confirme',EN_ATTENTE:'statut-attente',ANNULE:'statut-annule',TERMINE:'statut-termine',PATIENT_ARRIVE:'statut-arrive'};
    return m[u]||'';
  }
  getStatutLabel(s:string) {
    const u=(s||'').toUpperCase();
    const m:any={CONFIRME:'✓ Confirmé',EN_ATTENTE:'⏳ En attente',ANNULE:'✗ Annulé',TERMINE:'✔ Terminé',PATIENT_ARRIVE:'🏥 Arrivé'};
    return m[u]||s;
  }

  regNextStep() {
    this.regError = '';
    if (this.regStep === 1) {
      if (!this.regPrenom.trim()) { this.regError='Prénom obligatoire.'; return; }
      if (!this.regNom.trim())    { this.regError='Nom obligatoire.'; return; }
      if (!this.regGenre)         { this.regError='Genre obligatoire.'; return; }
      if (!this.regDateNaissance) { this.regError='Date de naissance obligatoire.'; return; }
      if (!this.regEmail.includes('@')) { this.regError='Email invalide.'; return; }
      if (!this.regTelephone.trim())    { this.regError='Téléphone obligatoire.'; return; }
      if (this.regPassword.length < 8) { this.regError='Mot de passe: minimum 8 caractères.'; return; }
      this.regStep = 2;
    } else if (this.regStep === 2) {
      this.regStep = 3;
      setTimeout(() => this.initRegSig(), 150);
    }
  }

  initRegSig() {
    const canvas = document.querySelector('#regSigCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth || 400;
    canvas.height = 140;
    this.regCtx = canvas.getContext('2d');
    if (!this.regCtx) return;
    this.regCtx.strokeStyle = '#1a3a5c';
    this.regCtx.lineWidth = 2.5;
    this.regCtx.lineCap = 'round';
    this.regCtx.lineJoin = 'round';
    this.regCtx.fillStyle = '#f8faff';
    this.regCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.onmousedown = (e) => { this.regDrawing=true; const r=canvas.getBoundingClientRect(); this.regLastX=(e.clientX-r.left)*(canvas.width/r.width); this.regLastY=(e.clientY-r.top)*(canvas.height/r.height); };
    canvas.onmousemove = (e) => { if(!this.regDrawing||!this.regCtx) return; const r=canvas.getBoundingClientRect(); const x=(e.clientX-r.left)*(canvas.width/r.width); const y=(e.clientY-r.top)*(canvas.height/r.height); this.regCtx.beginPath(); this.regCtx.moveTo(this.regLastX,this.regLastY); this.regCtx.lineTo(x,y); this.regCtx.stroke(); this.regLastX=x; this.regLastY=y; this.regSigData=canvas.toDataURL(); this.regSigValide=this.regSigData.length>2000; };
    canvas.onmouseup = canvas.onmouseleave = () => { this.regDrawing=false; };

    canvas.ontouchstart = (e) => { e.preventDefault(); const r=canvas.getBoundingClientRect(); const t=e.touches[0]; this.regDrawing=true; this.regLastX=(t.clientX-r.left)*(canvas.width/r.width); this.regLastY=(t.clientY-r.top)*(canvas.height/r.height); };
    canvas.ontouchmove = (e) => { e.preventDefault(); if(!this.regDrawing||!this.regCtx) return; const r=canvas.getBoundingClientRect(); const t=e.touches[0]; const x=(t.clientX-r.left)*(canvas.width/r.width); const y=(t.clientY-r.top)*(canvas.height/r.height); this.regCtx.beginPath(); this.regCtx.moveTo(this.regLastX,this.regLastY); this.regCtx.lineTo(x,y); this.regCtx.stroke(); this.regLastX=x; this.regLastY=y; this.regSigData=canvas.toDataURL(); this.regSigValide=this.regSigData.length>2000; };
    canvas.ontouchend = () => { this.regDrawing=false; };
  }

  effacerSig() {
    const canvas = document.querySelector('#regSigCanvas') as HTMLCanvasElement;
    if (!canvas || !this.regCtx) return;
    this.regCtx.fillStyle='#f8faff'; this.regCtx.fillRect(0,0,canvas.width,canvas.height);
    this.regSigData=''; this.regSigValide=false;
  }



  // ═══ QR CODE ═══
  genererQR(text: string, canvasId: string) {
    setTimeout(() => {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      const size = canvas.width;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,size,size);
      ctx.fillStyle = '#1565C0';
      // Pattern QR simplifié (visuel)
      const cell = Math.floor(size/7);
      [[0,0],[0,4],[4,0]].forEach(([r,c])=>{
        ctx.fillStyle='#1565C0';
        ctx.fillRect(c*cell,r*cell,3*cell,3*cell);
        ctx.fillStyle='#fff';
        ctx.fillRect(c*cell+cell/4,r*cell+cell/4,2.5*cell,2.5*cell);
        ctx.fillStyle='#1565C0';
        ctx.fillRect(c*cell+cell*0.75,r*cell+cell*0.75,cell*1.5,cell*1.5);
      });
      // Data dots
      const hash = text.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
      for(let r=0;r<7;r++) for(let c=0;c<7;c++) {
        if((r<3&&(c<3||c>=4))||(r>=4&&c<3)) continue;
        if((r+c+hash)%3===0){ ctx.fillStyle='#1565C0'; ctx.fillRect(c*cell,r*cell,cell-1,cell-1); }
      }
    }, 200);
  }

  imprimerOrdonnance() {
    this.genererQR(`MediNova-Ordo-${this.ordonnanceGeneree?.id_ordonnance}-${this.rdvSelectionne?.id_rdv}`, 'qrCanvas');
    setTimeout(() => {
      const zone = document.getElementById('ordoPrint');
      if (!zone) { window.print(); return; }
      const w = window.open('','_blank')!;
      w.document.write(`<html><head><title>Ordonnance</title><style>
        body{font-family:Times New Roman,serif;padding:20px;color:#000}
        .ordo-print-zone{max-width:600px;margin:0 auto}
        .ordo-header-print{display:flex;justify-content:space-between;border-bottom:2px solid #1565C0;padding-bottom:12px;margin-bottom:12px}
        .ohp-cabinet{font-size:18px;font-weight:bold;color:#1565C0}
        .ohp-med{font-size:14px;font-weight:bold}
        .ordo-sep-print{text-align:center;font-size:16px;font-weight:bold;letter-spacing:3px;border:1px solid #000;padding:6px;margin:12px 0}
        .omp-item{margin:8px 0;font-size:13px}
        .omp-num{font-weight:bold}
        .ordo-footer-print{display:flex;justify-content:space-between;margin-top:30px;border-top:1px solid #ccc;padding-top:12px}
        .cachet-ring{width:100px;height:100px;border:3px solid #1565C0;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:9px;padding:8px}
      </style></head><body>${zone.innerHTML}</body></html>`);
      w.document.close(); w.print();
    }, 500);
  }

  genererCertificat() { this.certificatVisible = true; setTimeout(()=>{ const z=document.getElementById('certPrint'); if(!z) return; const w=window.open('','_blank')!; w.document.write(`<html><head><title>Certificat</title><style>body{font-family:Times New Roman,serif;padding:40px}.cert-title{text-align:center;font-size:22px;font-weight:bold;letter-spacing:4px;text-decoration:underline}.cert-body{margin:30px 0;line-height:2}.cert-patient{font-size:16px;text-align:center;border:1px solid #000;padding:10px;margin:15px 0}.cert-footer{display:flex;justify-content:space-between;margin-top:60px}.cachet-ring{width:120px;height:120px;border:3px solid #1565C0;border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;font-size:9px;padding:10px}</style></head><body>${z.innerHTML}</body></html>`); w.document.close(); w.print(); }, 300); }
  genererRecu() { const txt=`REÇU DE CONSULTATION\nCabinet MediNova — ${this.today}\nPatient: ${this.rdvSelectionne?.prenom} ${this.rdvSelectionne?.nom}\nMédecin: Dr. ${this.user?.prenom} ${this.user?.nom}\nDiagnostic: ${this.consultForm.diagnostic}\n\nMerci de votre visite.`; const w=window.open('','_blank')!; w.document.write(`<pre style="font-family:monospace;padding:40px;font-size:14px">${txt}</pre>`); w.document.close(); w.print(); }

  imprimerCarte() {
    this.genererQR(`MediNova-Patient-${this.user?.id_utilisateur}`, 'carteQr');
    setTimeout(()=>{ const z=document.getElementById('cartePatient'); if(!z){window.print();return;} const w=window.open('','_blank')!; w.document.write(`<html><head><title>Carte Patient</title><style>body{font-family:Arial,sans-serif;background:#f0f4ff;display:flex;justify-content:center;padding:40px}.carte-patient{background:linear-gradient(135deg,#1565C0,#0D47A1);color:white;border-radius:16px;padding:20px;width:320px;box-shadow:0 8px 32px rgba(0,0,0,0.2)}.cp-header{display:flex;justify-content:space-between;margin-bottom:16px;font-size:11px}.cp-name{font-size:18px;font-weight:bold;letter-spacing:1px;margin-bottom:8px}.cp-detail{font-size:11px;margin:4px 0;opacity:.9}.cp-footer{display:flex;justify-content:space-between;align-items:center;margin-top:16px;border-top:1px solid rgba(255,255,255,.3);padding-top:10px;font-size:10px}</style></head><body>${z.outerHTML}</body></html>`); w.document.close(); w.print(); }, 500);
  }

  certificatVisible = false;

}