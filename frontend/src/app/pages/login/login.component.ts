import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <div class="auth-logo" (click)="auth.navigate('home')">
          <div class="nb-icon">
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <path d="M11 2v18M2 11h18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          MediNova
        </div>

        <h1 class="auth-title">Connexion</h1>
        <p class="auth-subtitle">Accédez à votre espace santé sécurisé</p>

        <div class="auth-form">
          <div class="form-group">
            <label class="form-label">Adresse email</label>
            <input type="email" class="form-input" [(ngModel)]="email"
              name="email" placeholder="votre@email.com"
              autocomplete="email" (keyup.enter)="login()"/>
          </div>

          <div class="form-group">
            <label class="form-label" style="display:flex;justify-content:space-between">
              <span>Mot de passe</span>
            </label>
            <div style="position:relative">
              <input [type]="showPwd?'text':'password'" class="form-input"
                [(ngModel)]="password" name="pwd"
                placeholder="Votre mot de passe"
                autocomplete="current-password"
                (keyup.enter)="login()" style="padding-right:42px"/>
              <button type="button" (click)="showPwd=!showPwd"
                style="position:absolute;right:10px;top:50%;transform:translateY(-50%);
                background:none;color:var(--muted);padding:4px;border:none;cursor:pointer">
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

          <div class="alert alert-danger" *ngIf="error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {{ error }}
          </div>

          <button class="btn btn-primary btn-full btn-lg" (click)="login()" [disabled]="loading">
            <div class="spinner spinner-sm" *ngIf="loading"></div>
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </div>

        <div class="auth-footer">
          Pas encore de compte ?
          <a (click)="auth.navigate('register')">Créer un compte patient</a>
        </div>

        <div style="text-align:center;margin-top:12px">
          <a (click)="auth.navigate('home')"
            style="font-size:12px;color:var(--muted);cursor:pointer">
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  `
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