import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export const API = 'http://localhost:8000/api';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private pageSubject = new BehaviorSubject<string>('home');
  page$ = this.pageSubject.asObservable();

  user: any = null;
  darkMode = false;

  private readonly TOKEN_KEY = 'medinova_token';
  private readonly USER_KEY  = 'medinova_user';

  constructor(private http: HttpClient) {
    // Restaurer session
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user  = localStorage.getItem(this.USER_KEY);
    if (token && user) {
      try {
        this.user = JSON.parse(user);
      } catch { this.clearSession(); }
    }
    // Dark mode
    this.darkMode = localStorage.getItem('darkMode') === '1';
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  // ── Auth ──────────────────────────────────────────────────────────
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${API}/login`, {
      email, mot_de_passe: password
    }).pipe(tap(res => {
      this.saveSession(res);
      this.redirectToDashboard();
    }));
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${API}/register`, {
      nom:               data.nom,
      prenom:            data.prenom,
      email:             data.email,
      telephone:         data.telephone,
      genre:             data.genre,
      mot_de_passe:      data.mot_de_passe,
      role:              data.role || 'patient',
      date_naissance:    data.date_naissance,
      adresse:           data.adresse,
      wilaya:            data.wilaya,
      numero_cni:        data.numero_cni,
      groupe_sanguin:    data.groupe_sanguin || 'ND',
      assurance_maladie: data.assurance_maladie,
      numero_assurance:  data.numero_assurance,
      allergies:         data.allergies,
      antecedents:       data.antecedents,
      traitements:       data.traitements,
      urgence_nom:       data.urgence_nom,
      urgence_tel:       data.urgence_tel,
    }).pipe(tap(res => {
      if (res?.token) {
        this.saveSession(res);
        this.redirectToDashboard();
      }
    }));
  }

  logout(): void {
    this.http.post(`${API}/logout`, {}, { headers: this.headers() }).subscribe();
    this.clearSession();
    this.navigate('home');
  }

  // ── Session ───────────────────────────────────────────────────────
  private saveSession(res: any): void {
    const token = res.token;
    const user  = res.user || res;
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY,  JSON.stringify(user));
    this.user = user;
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.user = null;
  }

  // ── Helpers ───────────────────────────────────────────────────────
  getToken(): string { return localStorage.getItem(this.TOKEN_KEY) || ''; }

  headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
      Accept:        'application/json',
    });
  }

  isLoggedIn(): boolean { return !!this.getToken() && !!this.user; }

  userId(): number { return this.user?.id_utilisateur || this.user?.id || 0; }

  initiales(): string {
    if (!this.user) return '?';
    return (this.user.prenom?.[0] || '') + (this.user.nom?.[0] || '');
  }

  // ── Navigation ────────────────────────────────────────────────────
  navigate(page: string): void { this.pageSubject.next(page); }

  redirectToDashboard(): void {
    const role = this.user?.role;
    const map: any = {
      patient:    'patient',
      medecin:    'medecin',
      infirmiere: 'infirmiere',
      admin:      'admin',
    };
    this.navigate(map[role] || 'home');
  }

  // ── Dark mode ─────────────────────────────────────────────────────
  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode', this.darkMode);
    localStorage.setItem('darkMode', this.darkMode ? '1' : '0');
  }
}