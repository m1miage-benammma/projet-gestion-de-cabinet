import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ln-page">

      <!-- Panneau gauche -->
      <div class="ln-left">
        <div class="ln-left-inner">

          <div class="ln-logo" (click)="auth.navigate('home')">
            <div class="ln-logo-icon">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <path d="M11 2v18M2 11h18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>
            <span>MediNova</span>
          </div>

          <div class="ln-left-body">
            <div class="ln-badge">Cabinet médical numérique</div>
            <h2 class="ln-tagline">La gestion médicale<br>simple et sécurisée</h2>
            <p class="ln-desc">Dossiers patients, rendez-vous, ordonnances et soins — centralisés en une seule plateforme conforme à la loi 17-08.</p>

            <div class="ln-features">
              <div class="ln-feat">
                <div class="ln-feat-ico">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <span>Prise de rendez-vous en ligne</span>
              </div>
              <div class="ln-feat">
                <div class="ln-feat-ico">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                </div>
                <span>Dossier médical numérique</span>
              </div>
              <div class="ln-feat">
                <div class="ln-feat-ico">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <span>Analyse IA des symptômes</span>
              </div>
              <div class="ln-feat">
                <div class="ln-feat-ico">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <span>Données chiffrées et sécurisées</span>
              </div>
            </div>
          </div>

          <div class="ln-left-footer">
            <span>Conforme Loi 18-07</span>
            <span class="ln-sep">·</span>
            <span>Alger, Algérie</span>
            <span class="ln-sep">·</span>
            <span>© 2026 MediNova</span>
          </div>

        </div>
      </div>

      <!-- Panneau droit — formulaire -->
      <div class="ln-right">
        <div class="ln-form-wrap">

          <div class="ln-form-header">
            <h1>Connexion</h1>
            <p>Accédez à votre espace de santé</p>
          </div>

          <div class="ln-form-body">
            <div class="ln-field">
              <label>Adresse email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                placeholder="exemple@gmail.com"
                autocomplete="email"
                (keyup.enter)="login()"
              />
            </div>

            <div class="ln-field">
              <label>Mot de passe</label>
              <div class="ln-pwd-wrap">
                <input
                  [type]="showPwd ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="pwd"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  (keyup.enter)="login()"
                />
                <button type="button" class="ln-eye" (click)="showPwd=!showPwd">
                  <svg *ngIf="!showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showPwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="ln-error" *ngIf="error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ error }}
            </div>

            <button class="ln-btn" (click)="login()" [disabled]="loading">
              <span class="ln-btn-spinner" *ngIf="loading"></span>
              {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
            </button>

            <div class="ln-divider"><span>Nouveau patient ?</span></div>

            <button class="ln-btn-outline" (click)="auth.navigate('register')">
              Créer un compte patient
            </button>
          </div>

          <a class="ln-back" (click)="auth.navigate('home')">
            ← Retour à l'accueil
          </a>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .ln-page {
      display: flex;
      min-height: 100vh;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* ── GAUCHE ─────────────────────────────── */
    .ln-left {
      width: 42%;
      background: #1B4F8A;
      display: flex;
      align-items: stretch;
      position: relative;
      overflow: hidden;
    }
    .ln-left::before {
      content: '';
      position: absolute;
      top: -120px; right: -120px;
      width: 400px; height: 400px;
      border-radius: 50%;
      background: rgba(255,255,255,.04);
    }
    .ln-left::after {
      content: '';
      position: absolute;
      bottom: -80px; left: -80px;
      width: 280px; height: 280px;
      border-radius: 50%;
      background: rgba(18,122,99,.5);
    }
    .ln-left-inner {
      display: flex;
      flex-direction: column;
      padding: 40px;
      width: 100%;
      position: relative;
      z-index: 1;
    }
    .ln-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      font-weight: 800;
      color: white;
      cursor: pointer;
      margin-bottom: auto;
      letter-spacing: -.3px;
    }
    .ln-logo-icon {
      width: 34px; height: 34px;
      background: rgba(255,255,255,.15);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255,255,255,.2);
    }
    .ln-left-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px 0;
    }
    .ln-badge {
      display: inline-block;
      background: rgba(255,255,255,.12);
      border: 1px solid rgba(255,255,255,.2);
      color: rgba(255,255,255,.9);
      padding: 5px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: .5px;
      text-transform: uppercase;
      margin-bottom: 22px;
      width: fit-content;
    }
    .ln-tagline {
      font-size: 32px;
      font-weight: 800;
      color: white;
      line-height: 1.2;
      letter-spacing: -.5px;
      margin-bottom: 14px;
    }
    .ln-desc {
      font-size: 14px;
      color: rgba(255,255,255,.7);
      line-height: 1.7;
      margin-bottom: 32px;
      max-width: 320px;
    }
    .ln-features {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ln-feat {
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255,255,255,.85);
      font-size: 13.5px;
      font-weight: 500;
    }
    .ln-feat-ico {
      width: 30px; height: 30px;
      border-radius: 8px;
      background: rgba(255,255,255,.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: white;
    }
    .ln-left-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      color: rgba(255,255,255,.4);
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,.1);
    }
    .ln-sep { opacity: .4; }

    /* ── DROITE ─────────────────────────────── */
    .ln-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FAFBFC;
      padding: 48px 32px;
    }
    .ln-form-wrap {
      width: 100%;
      max-width: 400px;
    }
    .ln-form-header {
      margin-bottom: 32px;
    }
    .ln-form-header h1 {
      font-size: 26px;
      font-weight: 800;
      color: #1A1F2E;
      letter-spacing: -.5px;
      margin-bottom: 6px;
    }
    .ln-form-header p {
      font-size: 14px;
      color: #8E9AB5;
    }
    .ln-form-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .ln-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .ln-field label {
      font-size: 13px;
      font-weight: 600;
      color: #1A1F2E;
    }
    .ln-field input {
      width: 100%;
      padding: 11px 14px;
      border: 1.5px solid #E0E6EF;
      border-radius: 10px;
      font-size: 14px;
      color: #1A1F2E;
      background: white;
      font-family: inherit;
      transition: border-color .18s, box-shadow .18s;
      outline: none;
    }
    .ln-field input:focus {
      border-color: #1B4F8A;
      box-shadow: 0 0 0 3px rgba(13,92,74,.12);
    }
    .ln-field input::placeholder { color: #C5CDD8; }
    .ln-pwd-wrap { position: relative; }
    .ln-pwd-wrap input { padding-right: 44px; }
    .ln-eye {
      position: absolute;
      right: 12px; top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #8E9AB5;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color .15s;
    }
    .ln-eye:hover { color: #1B4F8A; }
    .ln-error {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #FDF0F0;
      border: 1px solid #E8A3A3;
      color: #8B1B1B;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
    }
    .ln-btn {
      width: 100%;
      padding: 13px;
      background: #1B4F8A;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      transition: background .18s, transform .18s, box-shadow .18s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 2px 8px rgba(13,92,74,.25);
    }
    .ln-btn:hover:not(:disabled) {
      background: #2563B0;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(13,92,74,.3);
    }
    .ln-btn:disabled { opacity: .6; cursor: not-allowed; }
    .ln-btn-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .ln-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #C5CDD8;
      font-size: 12px;
      font-weight: 500;
    }
    .ln-divider::before, .ln-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #E0E6EF;
    }
    .ln-btn-outline {
      width: 100%;
      padding: 12px;
      background: white;
      color: #1B4F8A;
      border: 1.5px solid #90BDE8;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: all .18s;
    }
    .ln-btn-outline:hover {
      background: #EBF4FD;
      border-color: #1B4F8A;
    }
    .ln-back {
      display: block;
      text-align: center;
      margin-top: 24px;
      font-size: 12px;
      color: #8E9AB5;
      cursor: pointer;
      transition: color .15s;
    }
    .ln-back:hover { color: #1B4F8A; }

    @media (max-width: 768px) {
      .ln-left { display: none; }
      .ln-right { padding: 32px 20px; }
    }
  `]
})
export class LoginComponent {
  email    = "";
  password = "";
  showPwd  = false;
  loading  = false;
  error    = "";

  constructor(public auth: AuthService) {}

  login() {
    if (!this.email || !this.password) {
      this.error = "Email et mot de passe obligatoires.";
      return;
    }
    this.loading = true;
    this.error   = "";
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.loading = false; },
      error: e  => {
        this.loading = false;
        this.error   = e.error?.message || "Identifiants incorrects.";
      }
    });
  }
}