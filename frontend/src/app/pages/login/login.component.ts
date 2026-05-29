import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";
import { LangService } from "../../core/services/lang.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <!-- Côté gauche — illustration -->
      <div class="login-left">
        <div class="login-left-content">
          <div class="login-brand" (click)="auth.navigate('home')">
            <div class="nb-icon">
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <path d="M11 2v18M2 11h18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>
            <span>MediNova</span>
          </div>

          <div class="login-hero-text">
            <h2>Votre santé,<br>notre priorité</h2>
            <p>Plateforme médicale numérique conforme à la loi 17-08</p>
          </div>

          <!-- Illustration SVG médicale -->
          <div class="login-illustration">
            <svg viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Cercle fond -->
              <circle cx="140" cy="140" r="120" fill="rgba(255,255,255,.08)"/>
              <!-- Croix médicale -->
              <rect x="112" y="80" width="56" height="120" rx="12" fill="rgba(255,255,255,.15)"/>
              <rect x="80" y="112" width="120" height="56" rx="12" fill="rgba(255,255,255,.15)"/>
              <!-- Icônes flottantes -->
              <circle cx="60" cy="80" r="20" fill="rgba(255,255,255,.12)"/>
              <text x="60" y="87" text-anchor="middle" font-size="18">💊</text>
              <circle cx="220" cy="100" r="20" fill="rgba(255,255,255,.12)"/>
              <text x="220" y="107" text-anchor="middle" font-size="18">🩺</text>
              <circle cx="50" cy="200" r="20" fill="rgba(255,255,255,.12)"/>
              <text x="50" y="207" text-anchor="middle" font-size="18">❤️</text>
              <circle cx="230" cy="200" r="20" fill="rgba(255,255,255,.12)"/>
              <text x="230" y="207" text-anchor="middle" font-size="18">🧬</text>
              <!-- Stéthoscope simplifié -->
              <circle cx="140" cy="140" r="24" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.4)" stroke-width="2"/>
              <text x="140" y="150" text-anchor="middle" font-size="28">🏥</text>
            </svg>
          </div>

          <!-- Stats -->
          <div class="login-stats">
            <div class="login-stat"><div class="login-stat-val">2</div><div class="login-stat-label">Médecins</div></div>
            <div class="login-stat-sep"></div>
            <div class="login-stat"><div class="login-stat-val">100%</div><div class="login-stat-label">Sécurisé</div></div>
            <div class="login-stat-sep"></div>
            <div class="login-stat"><div class="login-stat-val">Loi 17-08</div><div class="login-stat-label">Conforme</div></div>
          </div>
        </div>
      </div>

      <!-- Côté droit — formulaire -->
      <div class="login-right">
        <div class="login-form-wrap">
          <div style="text-align:center;margin-bottom:32px">
            <h1 class="auth-title">{{ lang.get('bonjour') }} 👋</h1>
            <p class="auth-subtitle">Connectez-vous à votre espace santé</p>
          </div>

          <div class="auth-form">
            <div class="form-group">
              <label class="form-label">Adresse email</label>
              <input type="email" class="form-input" [(ngModel)]="email"
                name="email" placeholder="{{ lang.get('email') }}"
                autocomplete="email" (keyup.enter)="login()"/>
            </div>

            <div class="form-group">
              <label class="form-label">Mot de passe</label>
              <div style="position:relative">
                <input [type]="showPwd?'text':'password'" class="form-input"
                  [(ngModel)]="password" name="pwd"
                  placeholder="{{ lang.get('mot_de_passe') }}"
                  autocomplete="current-password"
                  (keyup.enter)="login()" style="padding-right:42px"/>
                <button type="button" (click)="showPwd=!showPwd"
                  style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;color:var(--muted);padding:4px;border:none;cursor:pointer">
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

            <div class="alert alert-danger" *ngIf="error">{{ error }}</div>

            <button class="btn btn-primary btn-full btn-lg" (click)="login()" [disabled]="loading">
              <div class="spinner spinner-sm" *ngIf="loading"></div>
              {{ loading ? lang.get('connexion') : lang.get('se_connecter') }}
            </button>
          </div>

          <div class="auth-footer" style="margin-top:24px">
            Pas encore de compte ?
            <a (click)="auth.navigate('register')" style="cursor:pointer">{{ lang.get('creer_compte') }}</a>
          </div>

          <div style="text-align:center;margin-top:16px">
            <a (click)="auth.navigate('home')" style="font-size:12px;color:var(--muted);cursor:pointer">
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { display:flex; min-height:100vh; }
    .login-left {
      width:45%; background:linear-gradient(135deg,#0A3D62 0%,#1a5c8a 50%,#00C9A7 100%);
      display:flex; align-items:center; justify-content:center; padding:40px;
      position:relative; overflow:hidden;
    }
    .login-left::before { content:''; position:absolute; top:-100px; right:-100px; width:300px; height:300px; border-radius:50%; background:rgba(255,255,255,.04); }
    .login-left-content { color:white; width:100%; max-width:360px; }
    .login-brand { display:flex; align-items:center; gap:10px; font-size:22px; font-weight:900; cursor:pointer; margin-bottom:40px; }
    .login-hero-text h2 { font-size:36px; font-weight:900; line-height:1.2; margin-bottom:12px; }
    .login-hero-text p { font-size:14px; opacity:.8; margin-bottom:32px; }
    .login-illustration { display:flex; justify-content:center; margin:20px 0; }
    .login-illustration svg { width:180px; height:180px; }
    .login-stats { display:flex; align-items:center; gap:16px; margin-top:24px; background:rgba(255,255,255,.1); border-radius:12px; padding:16px; }
    .login-stat { text-align:center; flex:1; }
    .login-stat-val { font-size:16px; font-weight:900; }
    .login-stat-label { font-size:10px; opacity:.7; margin-top:2px; }
    .login-stat-sep { width:1px; height:30px; background:rgba(255,255,255,.2); }
    .login-right { flex:1; display:flex; align-items:center; justify-content:center; padding:40px; background:var(--bg, #f8fafc); }
    .login-form-wrap { width:100%; max-width:400px; }
    @media (max-width:768px) { .login-left { display:none; } .login-right { padding:24px; } }
  `]
})
export class LoginComponent {
  email    = "";
  password = "";
  showPwd  = false;
  loading  = false;
  error    = "";

  constructor(public auth: AuthService, public lang: LangService) {
    // Reset theme to default blue on login page
    const vars: any = {
      '--primary': '#0A3D62', '--primary-dark': '#072d48',
      '--primary-mid': '#1a5c8a', '--primary-light': '#EBF5FB',
      '--primary-border': '#AED6F1', '--accent': '#00C9A7'
    };
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v as string));
  }

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