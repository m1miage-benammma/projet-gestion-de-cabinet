import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { trigger, transition, style, animate } from "@angular/animations";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./register.component.html",
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate('350ms cubic-bezier(.16,1,.3,1)', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ],
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');

    .reg-wrap {
      display: grid; grid-template-columns: 1fr 1fr;
      min-height: 100vh; position: relative; overflow: hidden;
      font-family: 'DM Sans', sans-serif;
    }

    /* Background */
    .reg-bg { position: fixed; inset: 0; z-index: 0; background: #F0F4F8; }
    .reg-grid {
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(10,61,98,.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(10,61,98,.025) 1px, transparent 1px);
      background-size: 52px 52px;
    }
    .reg-orb {
      position: absolute; border-radius: 50%; pointer-events: none;
      animation: orbFloat 14s ease-in-out infinite alternate;
    }
    .orb1 {
      width: 600px; height: 600px; top: -200px; left: -100px;
      background: radial-gradient(circle, rgba(10,61,98,.07) 0%, transparent 70%);
    }
    .orb2 {
      width: 400px; height: 400px; bottom: -100px; right: 200px;
      background: radial-gradient(circle, rgba(0,201,167,.06) 0%, transparent 70%);
      animation-delay: 5s;
    }
    .orb3 {
      width: 300px; height: 300px; top: 40%; right: -100px;
      background: radial-gradient(circle, rgba(109,40,217,.04) 0%, transparent 70%);
      animation-delay: 10s;
    }
    @keyframes orbFloat {
      from { transform: scale(1) translate(0,0); }
      to   { transform: scale(1.2) translate(30px, 20px); }
    }

    /* LEFT */
    .reg-left {
      position: relative; z-index: 1;
      background: linear-gradient(160deg, #0A3D62 0%, #0d5a8a 50%, #1a6b9a 100%);
      display: flex; align-items: center; padding: 60px 52px;
      overflow: hidden;
    }
    .reg-left::before {
      content: ''; position: absolute; inset: 0;
      background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .reg-left-inner { position: relative; z-index: 1; width: 100%; }

    .reg-logo {
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      font-family: 'Sora', sans-serif; font-weight: 900; font-size: 20px;
      color: white; letter-spacing: -.4px; margin-bottom: 64px;
    }
    .reg-logo-mark {
      width: 38px; height: 38px; border-radius: 10px;
      background: rgba(255,255,255,.15); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
    }

    .reg-brand-tag {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15);
      color: rgba(255,255,255,.9); padding: 6px 14px; border-radius: 100px;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .5px; margin-bottom: 24px;
    }
    .reg-tag-dot {
      width: 7px; height: 7px; background: #00C9A7;
      border-radius: 50%; animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.7)}
    }

    .reg-brand-h2 {
      font-family: 'Sora', sans-serif; font-size: clamp(32px, 3.5vw, 48px);
      font-weight: 900; line-height: 1.05; letter-spacing: -2px;
      color: white; margin-bottom: 20px;
    }
    .reg-brand-grad {
      background: linear-gradient(135deg, #00C9A7, #48CAE4);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .reg-brand-p {
      font-size: 14px; color: rgba(255,255,255,.65);
      line-height: 1.75; margin-bottom: 36px; max-width: 360px;
    }

    .reg-features { display: flex; flex-direction: column; gap: 14px; margin-bottom: 48px; }
    .reg-feat {
      display: flex; align-items: center; gap: 12px;
      color: rgba(255,255,255,.8); font-size: 13.5px; font-weight: 500;
    }
    .reg-feat-ico {
      width: 32px; height: 32px; border-radius: 8px;
      background: rgba(255,255,255,.1); display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: white;
    }

    .reg-brand-footer {
      display: flex; align-items: center; gap: 10px;
      font-size: 11px; color: rgba(255,255,255,.4); font-weight: 600;
    }
    .reg-dot-sep { color: rgba(255,255,255,.2); }

    /* RIGHT */
    .reg-right {
      position: relative; z-index: 1;
      background: white; display: flex; align-items: flex-start;
      overflow-y: auto; padding: 40px 52px;
    }
    .reg-form-wrap { width: 100%; max-width: 480px; margin: 0 auto; padding: 20px 0 40px; }

    .reg-back {
      display: flex; align-items: center; gap: 6px;
      background: none; border: none; color: #64748B;
      font-size: 13px; font-weight: 600; cursor: pointer;
      padding: 0; margin-bottom: 36px;
      font-family: 'DM Sans', sans-serif; transition: color .2s;
    }
    .reg-back:hover { color: #0A3D62; }

    /* Steps */
    .reg-steps {
      display: flex; align-items: center; gap: 0;
      margin-bottom: 36px; position: relative;
    }
    .reg-step-bar {
      position: absolute; top: 14px; left: 14px; right: 14px; height: 2px;
      background: #E2E8F0; z-index: 0; border-radius: 2px;
    }
    .reg-step-fill {
      height: 100%; background: linear-gradient(90deg, #0A3D62, #00C9A7);
      border-radius: 2px; transition: width .5s cubic-bezier(.16,1,.3,1);
    }
    .reg-step-item {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      flex: 1; position: relative; z-index: 1;
    }
    .reg-step-circle {
      width: 28px; height: 28px; border-radius: 50%;
      background: #E2E8F0; color: #94A3B8;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; transition: all .3s;
    }
    .reg-step-label {
      font-size: 11px; font-weight: 600; color: #94A3B8; transition: color .3s;
    }
    .reg-step-item.active .reg-step-circle {
      background: linear-gradient(135deg, #0A3D62, #1a6b9a);
      color: white; box-shadow: 0 4px 12px rgba(10,61,98,.3);
    }
    .reg-step-item.active .reg-step-label { color: #0A3D62; }
    .reg-step-item.done .reg-step-circle { background: #00C9A7; color: white; }
    .reg-step-item.done .reg-step-label { color: #0d9276; }

    /* Form header */
    .reg-form-header { margin-bottom: 28px; }
    .reg-form-title {
      font-family: 'Sora', sans-serif; font-size: 24px; font-weight: 800;
      color: #0F172A; letter-spacing: -.5px; margin-bottom: 6px;
    }
    .reg-form-sub { font-size: 13px; color: #64748B; }

    /* Alerts */
    .reg-alert {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 14px; border-radius: 10px;
      font-size: 13px; font-weight: 500; margin-bottom: 16px; border: 1px solid;
    }
    .reg-alert-error  { background: #FEE2E2; color: #991B1B; border-color: #FCA5A5; }
    .reg-alert-success{ background: #DCFCE7; color: #166534; border-color: #86EFAC; }

    /* Section title */
    .reg-section-title {
      display: flex; align-items: center; gap: 7px;
      font-size: 11px; font-weight: 800; color: #0A3D62;
      text-transform: uppercase; letter-spacing: .6px;
      margin-bottom: 16px; padding-bottom: 10px;
      border-bottom: 2px solid #EBF5FB;
    }

    /* Fields */
    .reg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .reg-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
    .reg-field label { font-size: 12px; font-weight: 700; color: #0F172A; }
    .req { color: #EF4444; margin-left: 2px; }
    .reg-field input, .reg-field select {
      width: 100%; background: #F8FAFC; border: 1.5px solid #E2E8F0;
      border-radius: 10px; padding: 11px 14px; font-size: 14px; color: #0F172A;
      transition: all .2s; font-family: 'DM Sans', sans-serif; outline: none;
    }
    .reg-field input:focus, .reg-field select:focus {
      border-color: #0A3D62; background: white;
      box-shadow: 0 0 0 3px rgba(10,61,98,.1);
    }
    .reg-hint { font-size: 11px; color: #94A3B8; margin-top: 2px; }

    /* Radio gender */
    .reg-radio-group { display: flex; gap: 10px; }
    .reg-radio {
      display: flex; align-items: center; gap: 8px; flex: 1;
      padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px;
      cursor: pointer; font-size: 13px; font-weight: 600; color: #64748B;
      transition: all .2s; background: #F8FAFC;
    }
    .reg-radio input { display: none; }
    .reg-radio.active { border-color: #0A3D62; background: #EBF5FB; color: #0A3D62; }

    /* Buttons */
    .reg-step-body { animation: none; }
    .reg-btn-next, .reg-btn-submit {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 14px; border-radius: 12px; border: none;
      font-size: 15px; font-weight: 700; cursor: pointer;
      font-family: 'DM Sans', sans-serif; margin-top: 20px;
      background: linear-gradient(135deg, #0A3D62, #1a6b9a);
      color: white; box-shadow: 0 8px 24px rgba(10,61,98,.25);
      transition: all .25s;
    }
    .reg-btn-next:hover, .reg-btn-submit:hover {
      transform: translateY(-2px); box-shadow: 0 14px 32px rgba(10,61,98,.35);
    }
    .reg-btn-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; }

    .reg-nav-btns { display: flex; gap: 12px; margin-top: 20px; }
    .reg-btn-prev {
      display: flex; align-items: center; gap: 6px;
      padding: 14px 20px; border-radius: 12px; border: 1.5px solid #E2E8F0;
      font-size: 14px; font-weight: 600; cursor: pointer; color: #64748B;
      background: white; transition: all .2s; font-family: 'DM Sans', sans-serif;
      flex-shrink: 0;
    }
    .reg-btn-prev:hover { border-color: #0A3D62; color: #0A3D62; }
    .reg-btn-next { margin-top: 0; flex: 1; }
    .reg-btn-submit { margin-top: 0; flex: 1; }

    .reg-spinner {
      width: 18px; height: 18px; border-radius: 50%;
      border: 2px solid rgba(255,255,255,.3); border-top-color: white;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .reg-switch {
      text-align: center; font-size: 13px; color: #64748B; margin-top: 20px;
    }
    .reg-switch a { color: #0A3D62; font-weight: 700; cursor: pointer; }
    .reg-switch a:hover { text-decoration: underline; }

    /* Summary */
    .reg-summary {
      display: flex; align-items: center; gap: 16px;
      background: #F8FAFC; border: 1.5px solid #E2E8F0;
      border-radius: 14px; padding: 18px; margin-bottom: 20px;
    }
    .reg-summary-ava {
      width: 52px; height: 52px; border-radius: 50%;
      background: linear-gradient(135deg, #0A3D62, #1a6b9a);
      color: white; display: flex; align-items: center; justify-content: center;
      font-family: 'Sora', sans-serif; font-size: 18px; font-weight: 900;
      flex-shrink: 0;
    }
    .reg-summary-name { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 3px; }
    .reg-summary-meta { font-size: 12px; color: #64748B; margin-bottom: 2px; }
    .reg-summary-badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
    .reg-badge {
      padding: 2px 10px; border-radius: 100px; font-size: 11px; font-weight: 700;
      background: #EBF5FB; color: #0A3D62;
    }
    .reg-badge-warn { background: #FEF3C7; color: #92400E; }
    .reg-badge-ok   { background: #DCFCE7; color: #166534; }

    /* Consent */
    .reg-consent {
      background: #F8FAFC; border: 1.5px solid #E2E8F0;
      border-radius: 14px; padding: 18px; margin-bottom: 8px;
    }
    .reg-consent-header {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 800; color: #0A3D62; margin-bottom: 12px;
    }
    .reg-consent-text { font-size: 12px; color: #475569; line-height: 1.7; margin-bottom: 16px; }

    .reg-check-row {
      display: flex; align-items: flex-start; gap: 12px; cursor: pointer;
    }
    .reg-checkbox {
      width: 18px; height: 18px; border-radius: 5px;
      border: 2px solid #CBD5E1; background: white; flex-shrink: 0; margin-top: 2px;
      display: flex; align-items: center; justify-content: center; transition: all .2s;
    }
    .reg-checkbox.checked { background: #0A3D62; border-color: #0A3D62; }
    .reg-check-row span { font-size: 12px; color: #475569; line-height: 1.6; }

    /* Responsive */
    @media (max-width: 900px) {
      .reg-wrap { grid-template-columns: 1fr; }
      .reg-left { display: none; }
      .reg-right { padding: 32px 24px; }
    }
  `]
})
export class RegisterComponent {
  step    = 1;
  loading = false;
  error   = "";
  success = "";

  prenom = ""; nom = ""; email = ""; telephone = "";
  genre  = "M"; password = ""; dateNaissance = "";
  adresse = ""; wilaya = ""; numeroCni = "";

  groupeSanguin    = "ND";
  assuranceMaladie = "";
  numeroAssurance  = "";
  allergies        = "";
  antecedents      = "";
  traitements      = "";
  urgenceNom       = "";
  urgenceTel       = "";

  consentement = false;

  today = new Date().toISOString().split("T")[0];

  steps = ["Identité", "Médical", "Validation"];

  features = [
    { label: "Dossier médical sécurisé et accessible", icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
    { label: "Prise de rendez-vous en ligne", icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>' },
    { label: "Ordonnances numériques avec QR code", icon: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>' },
    { label: "Analyse intelligente de vos symptômes", icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>' },
  ];

  groupesSanguins = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

  wilayas = [
    "01 - Adrar","02 - Chlef","03 - Laghouat","04 - Oum El Bouaghi","05 - Batna",
    "06 - Béjaïa","07 - Biskra","08 - Béchar","09 - Blida","10 - Bouira",
    "11 - Tamanrasset","12 - Tébessa","13 - Tlemcen","14 - Tiaret","15 - Tizi Ouzou",
    "16 - Alger","17 - Djelfa","18 - Jijel","19 - Sétif","20 - Saïda",
    "21 - Skikda","22 - Sidi Bel Abbès","23 - Annaba","24 - Guelma","25 - Constantine",
    "26 - Médéa","27 - Mostaganem","28 - M'Sila","29 - Mascara","30 - Ouargla",
    "31 - Oran","32 - El Bayadh","33 - Illizi","34 - Bordj Bou Arréridj",
    "35 - Boumerdès","36 - El Tarf","37 - Tindouf","38 - Tissemsilt","39 - El Oued",
    "40 - Khenchela","41 - Souk Ahras","42 - Tipaza","43 - Mila","44 - Ain Defla",
    "45 - Naâma","46 - Ain Témouchent","47 - Ghardaïa","48 - Relizane",
    "49 - Timimoun","50 - Bordj Badji Mokhtar","51 - Ouled Djellal","52 - Béni Abbès",
    "53 - In Salah","54 - In Guezzam","55 - Touggourt","56 - Djanet",
    "57 - El M'Ghair","58 - El Meniaa"
  ];

  constructor(public auth: AuthService) {}

  nextStep() {
    this.error = "";
    if (this.step === 1) {
      if (!this.prenom || !this.nom)   { this.error = "Prénom et nom obligatoires."; return; }
      if (!this.email.includes("@"))   { this.error = "Email invalide."; return; }
      if (!this.telephone)             { this.error = "Téléphone obligatoire."; return; }
      if (this.password.length < 8)    { this.error = "Minimum 8 caractères pour le mot de passe."; return; }
    }
    this.step++;
  }

  prevStep() { this.error = ""; this.step--; }

  register() {
    if (!this.consentement) { this.error = "Veuillez accepter la politique de confidentialité."; return; }
    this.loading = true;
    this.error   = "";

    this.auth.register({
      nom:               this.nom,
      prenom:            this.prenom,
      email:             this.email,
      telephone:         this.telephone,
      genre:             this.genre,
      mot_de_passe:      this.password,
      role:              "patient",
      date_naissance:    this.dateNaissance    || null,
      adresse:           this.adresse          || null,
      wilaya:            this.wilaya           || null,
      numero_cni:        this.numeroCni        || null,
      groupe_sanguin:    this.groupeSanguin,
      assurance_maladie: this.assuranceMaladie || null,
      numero_assurance:  this.numeroAssurance  || null,
      allergies:         this.allergies        || null,
      antecedents:       this.antecedents      || null,
      traitements:       this.traitements      || null,
      urgence_nom:       this.urgenceNom       || null,
      urgence_tel:       this.urgenceTel       || null,
    }).subscribe({
      next: () => { this.loading = false; },
      error: e  => {
        this.loading = false;
        this.error   = e.error?.message || "Erreur lors de la création du compte.";
      }
    });
  }

  goHome()  { this.auth.navigate('home');  }
  goLogin() { this.auth.navigate('login'); }
}