import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, API } from '../../core/services/auth.service';

const COLORS = ['#1B4F8A', '#2563B0', '#163d6e', '#0A6E4A', '#875C00', '#5B2C8D'];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, AfterViewInit {
  medecins: any[] = [];
  stats: any = null;
  loading = true;
  rdvDashboard: any[] = [];
  rdvColors = ['#EBF4FD', '#E8F5F1', '#FFF8E6', '#F2ECF9', '#FDF0F0'];

  contactNom = ''; contactEmail = ''; contactSujet = '';
  contactMessage = ''; contactSuccess = false; contactError = '';
  contactLoading = false;

  avis = [
    { texte: "Service exceptionnel ! La prise de rendez-vous en ligne est très pratique.", nom: "Amira B.", initiales: "AB", date: "Mai 2026" },
    { texte: "Le dossier médical numérique est une révolution. Je peux voir mes ordonnances à tout moment.", nom: "Karim M.", initiales: "KM", date: "Avril 2026" },
    { texte: "Très professionnel. L'IA de triage m'a aidé à comprendre mes symptômes avant ma consultation.", nom: "Fatima Z.", initiales: "FZ", date: "Mars 2026" },
  ];

  articles = [
    { emoji: "🫀", couleur: "#fee2e2", categorie: "Cardiologie", titre: "Comment prévenir les maladies cardiovasculaires ?", extrait: "L'hypertension touche 30% des algériens. Découvrez les gestes simples pour protéger votre coeur.", date: "20 Mai 2026" },
    { emoji: "🧠", couleur: "#f5f3ff", categorie: "Neurologie", titre: "Le stress chronique : reconnaitre et agir", extrait: "Le stress prolonge peut avoir des effets serieux sur la sante. Notre medecin vous explique comment le gerer.", date: "15 Mai 2026" },
    { emoji: "🍎", couleur: "#dcfce7", categorie: "Nutrition", titre: "Alimentation equilibree en Algerie", extrait: "Comment adapter une alimentation saine aux habitudes alimentaires algeriennes ? Nos conseils accessibles.", date: "10 Mai 2026" },
  ];

  roles = [
    { title: "Patient", desc: "Prenez RDV, consultez votre dossier medical et recevez vos ordonnances.", bg: "#EBF4FD", color: "#1B4F8A", items: ["Prise de RDV en ligne", "Dossier medical numerique", "Ordonnances avec QR Code", "Analyse IA des symptomes"] },
    { title: "Medecin", desc: "Gerez votre planning, redigez ordonnances et suivez vos patients.", bg: "#E8F5F1", color: "#0A6E4A", items: ["Planning et disponibilites", "Consultation et diagnostic", "Generation d'ordonnances", "Chat avec les patients"] },
    { title: "Infirmiere", desc: "Gerez la file d'attente, les soins et la facturation des patients.", bg: "#FFF8E6", color: "#875C00", items: ["File d'attente patients", "Soins infirmiers", "Facturation", "Notifications urgences"] },
    { title: "Administrateur", desc: "Pilotez toute l'activite du cabinet depuis un tableau de bord centralise.", bg: "#F2ECF9", color: "#5B2C8D", items: ["Statistiques & rapports", "Gestion des utilisateurs", "Rappels RDV automatiques", "Messages contact"] },
  ];

  roleIcons = [
    '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  ];

  constructor(public auth: AuthService, private http: HttpClient) {}

  goLogin()    { this.auth.navigate('login'); }
  goRegister() { this.auth.navigate('register'); }

  formatStatut(s: string): string {
    const m: any = { en_attente: 'Attente', confirme: 'Confirmé', patient_arrive: 'Arrivé', annule: 'Annulé', termine: 'Terminé' };
    return m[s] || s;
  }

  initiales(m: any): string {
    return ((m.prenom?.[0] || '') + (m.nom?.[0] || '')).toUpperCase();
  }

  color(i: number): string { return COLORS[i % COLORS.length]; }

  envoyerContact() {
    if (!this.contactNom || !this.contactEmail || !this.contactMessage) {
      this.contactError = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    this.contactLoading = true;
    this.contactError = '';
    this.http.post(`${API}/contact`, {
      nom: this.contactNom, email: this.contactEmail,
      sujet: this.contactSujet, message: this.contactMessage
    }).subscribe({
      next: () => {
        this.contactLoading = false;
        this.contactSuccess = true;
        this.contactNom = ''; this.contactEmail = '';
        this.contactSujet = ''; this.contactMessage = '';
        setTimeout(() => this.contactSuccess = false, 5000);
      },
      error: () => { this.contactLoading = false; this.contactError = "Erreur d'envoi. Réessayez."; }
    });
  }

  ngOnInit() {
    this.chargerMedecins();
    this.chargerStats();
    this.chargerRdvDashboard();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('hm-visible'); obs.unobserve(e.target); } });
      }, { threshold: 0.08 });
      document.querySelectorAll('.hm-animate').forEach(el => obs.observe(el));
    }, 300);
  }

  chargerRdvDashboard() {
    this.http.get<any[]>(`${API}/rdv-recents`).subscribe({
      next: (rdvs: any[]) => { this.rdvDashboard = (rdvs || []).slice(0, 4); },
      error: () => { this.rdvDashboard = []; }
    });
  }

  chargerMedecins() {
    this.loading = true;
    this.http.get<any[]>(`${API}/medecins`).subscribe({
      next: m => { this.medecins = m; this.loading = false; },
      error: () => { this.medecins = []; this.loading = false; }
    });
  }

  chargerStats() {
    this.http.get<any>(`${API}/admin/rapport`).subscribe({
      next: s => { this.stats = s; },
      error: () => {}
    });
  }
}