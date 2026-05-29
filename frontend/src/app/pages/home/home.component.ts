import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, API } from '../../core/services/auth.service';

const COLORS = [
  { bg: '#EBF5FB', text: '#0A3D62' },
  { bg: '#DCFCE7', text: '#166534' },
  { bg: '#F5F3FF', text: '#6D28D9' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#FEE2E2', text: '#991B1B' },
  { bg: '#EFF6FF', text: '#1E40AF' },
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet"/>

<div class="hw">

  <!-- NAV -->
  <nav class="nav">
    <div class="nav-in">
      <div class="logo" (click)="auth.navigate('home')">
        <div class="logo-icon">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <path d="M11 2v18M2 11h18" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
          </svg>
        </div>
        MediNova
      </div>
      <div class="nav-links">
        <a href="#medecins">Médecins</a>
        <a href="#services">Services</a>
        <a href="#securite">Sécurité</a>
        <a href="#contact">Contact</a>
      </div>
      <div class="nav-btns">
        <button class="btn-o" (click)="auth.navigate('login')">Se connecter</button>
        <button class="btn-f" (click)="auth.navigate('register')">Créer un compte</button>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-bg-grid"></div>
    <div class="hero-glow g1"></div>
    <div class="hero-glow g2"></div>

    <!-- Floating medical icons -->
    <div class="float-icon fi1">❤️</div>
    <div class="float-icon fi2">💊</div>
    <div class="float-icon fi3">🩺</div>
    <div class="float-icon fi4">🏥</div>
    <div class="float-icon fi5">💉</div>
    <div class="float-icon fi6">🧬</div>
    <div class="hero-in">

      <!-- LEFT -->
      <div class="hero-l">
        <div class="hero-tag">
          <span class="tag-dot"></span>
          Plateforme médicale · Algérie
        </div>
        <h1 class="hero-h1">
          Votre santé,<br>
          <span class="hero-grad">simplifiée</span><br>
          et sécurisée
        </h1>
        <p class="hero-p">
          MediNova connecte patients, médecins et infirmières pour une prise en charge médicale moderne, rapide et conforme à la loi algérienne 18-07.
        </p>
        <div class="hero-btns">
          <button class="btn-primary-lg" (click)="auth.navigate('register')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            Créer mon dossier patient
          </button>
          <button class="btn-secondary-lg" (click)="auth.navigate('login')">
            Espace médical
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div class="hero-stats">
          <div class="h-stat" *ngFor="let s of heroStats">
            <div class="h-stat-n">{{ s.val }}</div>
            <div class="h-stat-l">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- RIGHT : Dashboard Preview -->
      <div class="hero-r">
        <div class="dash-preview">
          <div class="dp-header">
            <div class="dp-dots">
              <span class="dp-dot" style="background:#FF5F57"></span>
              <span class="dp-dot" style="background:#FFBD2E"></span>
              <span class="dp-dot" style="background:#28CA41"></span>
            </div>
            <span class="dp-title">Tableau de bord — MediNova</span>
          </div>
          <div class="dp-kpis">
            <div class="dp-kpi">
              <div class="dp-kpi-val">{{ stats?.total_rendez_vous ?? '—' }}</div>
              <div class="dp-kpi-lbl">Rendez-vous</div>
            </div>
            <div class="dp-kpi">
              <div class="dp-kpi-val">{{ stats?.total_patients ?? '—' }}</div>
              <div class="dp-kpi-lbl">Patients</div>
            </div>
            <div class="dp-kpi">
              <div class="dp-kpi-val">{{ stats?.total_medecins ?? '—' }}</div>
              <div class="dp-kpi-lbl">Médecins</div>
            </div>
          </div>
          <div class="dp-divider"></div>
          <div class="dp-list">
            <ng-container *ngIf="medecins.length > 0">
              <div class="dp-row" *ngFor="let m of medecins.slice(0,4); let i=index"
                   [style.animation-delay]="(i * 80) + 'ms'">
                <div class="dp-ava" [style.background]="color(i).bg" [style.color]="color(i).text">
                  {{ initiales(m) }}
                </div>
                <div class="dp-info">
                  <div class="dp-name">Dr. {{ m.prenom }} {{ m.nom }}</div>
                  <div class="dp-spec">{{ m.specialite || 'Médecine générale' }}</div>
                </div>
                <span class="dp-badge" [class]="i===1?'badge-wait':'badge-ok'">
                  {{ i===1 ? 'Occupé' : 'Disponible' }}
                </span>
              </div>
            </ng-container>
            <!-- Skeletons -->
            <ng-container *ngIf="medecins.length === 0">
              <div class="dp-row sk" *ngFor="let s of [1,2,3,4]">
                <div class="sk-ava"></div>
                <div style="flex:1">
                  <div class="sk-line" style="width:130px;margin-bottom:6px"></div>
                  <div class="sk-line" style="width:85px"></div>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <!-- Floating badges -->
        <div class="fb fb1">
          <div class="fb-ico">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <div class="fb-val">{{ stats?.rdv_confirmes ?? '—' }}</div>
            <div class="fb-lbl">RDV confirmés</div>
          </div>
        </div>
        <div class="fb fb2">
          <div class="fb-ico" style="background:#EFF6FF">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <div class="fb-val" style="color:#1E40AF">{{ stats?.rdv_ce_mois ?? '—' }}</div>
            <div class="fb-lbl">Ce mois</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- VAGUE -->
  <div class="wave-wrap">
    <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#F8FAFC"/>
    </svg>
  </div>

  <!-- MÉDECINS DYNAMIQUES -->
  <section class="sec" id="medecins">
    <div class="sec-in">
      <div class="sec-tag fade-up">Nos spécialistes</div>
      <h2 class="sec-h2 fade-up fade-up-delay-1">Des médecins qualifiés<br>à votre service</h2>
      <p class="sec-sub fade-up fade-up-delay-2">Prenez rendez-vous en ligne avec nos spécialistes — confirmation instantanée, rappel automatique 24h avant.</p>

      <!-- Loading -->
      <div class="docs-loading" *ngIf="loading">
        <div class="loader"></div>
        Chargement des médecins...
      </div>

      <div class="docs-grid" *ngIf="!loading">
        <div class="doc-card" *ngFor="let m of medecins; let i=index"
             (click)="auth.navigate('register')">
          <div class="doc-top">
            <div class="doc-ava" [style.background]="color(i).bg" [style.color]="color(i).text">
              {{ initiales(m) }}
            </div>
            <div class="doc-meta">
              <div class="doc-name">Dr. {{ m.prenom }} {{ m.nom }}</div>
              <div class="doc-spec">{{ m.specialite || 'Médecine générale' }}</div>
            </div>
            <div class="doc-avail">
              <span class="avail-dot"></span>
              Disponible
            </div>
          </div>
          <div class="doc-sep"></div>
          <div class="doc-foot">
            <div class="doc-info-item" *ngIf="m.numero_ordre">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              N° {{ m.numero_ordre }}
            </div>
            <button class="btn-rdv">Prendre RDV</button>
          </div>
        </div>

        <!-- Message si aucun médecin -->
        <div class="no-docs" *ngIf="medecins.length === 0 && !loading">
          Aucun médecin enregistré pour le moment.
        </div>
      </div>
    </div>
  </section>

  <!-- SERVICES -->
  <section class="sec sec-alt" id="services">
    <div class="sec-in">
      <div class="sec-tag fade-up">Fonctionnalités</div>
      <h2 class="sec-h2 fade-up fade-up-delay-1">Tout ce dont vous avez<br>besoin, au même endroit</h2>
      <div class="srv-grid">
        <!-- Prise de RDV -->
        <div class="srv-card fade-up">
          <div class="srv-ico" style="background:#EBF5FB">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A3D62" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
            </svg>
          </div>
          <div class="srv-title">Prise de rendez-vous</div>
          <div class="srv-desc">Réservez en quelques clics auprès de votre médecin. Confirmation instantanée, rappel automatique 24h avant.</div>
        </div>
        <!-- Dossier médical -->
        <div class="srv-card fade-up fade-up-delay-1">
          <div class="srv-ico" style="background:#DCFCE7">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="srv-title">Dossier médical numérique</div>
          <div class="srv-desc">Accédez à l'intégralité de votre historique médical, consultations et ordonnances en toute sécurité.</div>
        </div>
        <!-- Ordonnances -->
        <div class="srv-card fade-up fade-up-delay-2">
          <div class="srv-ico" style="background:#F5F3FF">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div class="srv-title">Ordonnances numériques</div>
          <div class="srv-desc">Vos prescriptions médicales disponibles en ligne avec QR code de vérification d'authenticité.</div>
        </div>
        <!-- IA -->
        <div class="srv-card fade-up">
          <div class="srv-ico" style="background:#FEF3C7">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div class="srv-title">Analyse IA des symptômes</div>
          <div class="srv-desc">Décrivez vos symptômes et obtenez une orientation vers la bonne spécialité médicale instantanément.</div>
        </div>
        <!-- Soins -->
        <div class="srv-card fade-up fade-up-delay-1">
          <div class="srv-ico" style="background:#FEE2E2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#991B1B" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div class="srv-title">Soins infirmiers</div>
          <div class="srv-desc">Suivi des soins paramédicaux, gestion des actes infirmiers et communication inter-professionnelle.</div>
        </div>
        <!-- Notifications -->
        <div class="srv-card fade-up fade-up-delay-2">
          <div class="srv-ico" style="background:#EFF6FF">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <div class="srv-title">Notifications & Rappels</div>
          <div class="srv-desc">Recevez des rappels automatiques 24h avant chaque rendez-vous et suivez vos notifications en temps réel.</div>
        </div>
      </div>
    </div>
  </section>

  <!-- COMMENT ÇA MARCHE -->
  <section class="sec" id="comment-ca-marche">
    <div class="sec-in">
      <div class="sec-tag">Simple & rapide</div>
      <h2 class="sec-h2">Comment ça marche ?</h2>
      <p class="sec-sub">En 3 étapes simples, accédez à des soins de qualité depuis chez vous.</p>

      <div class="steps-wrap">
        <!-- Ligne de connexion -->
        <div class="steps-line"></div>

        <div class="steps-grid">
          <!-- Étape 1 -->
          <div class="step-card">
            <div class="step-num">01</div>
            <div class="step-icon-wrap" style="background:#EBF5FB">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A3D62" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="step-title">Créez votre compte</div>
            <div class="step-desc">Inscrivez-vous en moins de 2 minutes avec vos informations personnelles. Votre dossier médical est créé automatiquement.</div>
            <div class="step-badge">Gratuit</div>
          </div>

          <!-- Étape 2 -->
          <div class="step-card step-card--mid">
            <div class="step-num" style="color:#00C9A7;border-color:rgba(0,201,167,.2);background:rgba(0,201,167,.06)">02</div>
            <div class="step-icon-wrap" style="background:#DCFCE7">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
              </svg>
            </div>
            <div class="step-title">Prenez rendez-vous</div>
            <div class="step-desc">Choisissez votre médecin, sélectionnez un créneau disponible et confirmez votre rendez-vous en quelques clics.</div>
            <div class="step-badge" style="background:rgba(0,201,167,.1);color:#0d9276">Instantané</div>
          </div>

          <!-- Étape 3 -->
          <div class="step-card">
            <div class="step-num" style="color:#6D28D9;border-color:rgba(109,40,217,.2);background:rgba(109,40,217,.06)">03</div>
            <div class="step-icon-wrap" style="background:#F5F3FF">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div class="step-title">Accédez à vos soins</div>
            <div class="step-desc">Consultez votre médecin, recevez vos ordonnances numériques avec QR code et suivez votre dossier médical en ligne.</div>
            <div class="step-badge" style="background:rgba(109,40,217,.08);color:#6D28D9">Sécurisé</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SÉCURITÉ & CONFORMITÉ -->
  <section class="sec sec-alt" id="securite">
    <div class="sec-in">
      <div class="sec-tag">Conforme & sécurisé</div>
      <h2 class="sec-h2">Votre sécurité,<br>notre priorité</h2>
      <p class="sec-sub">MediNova respecte la loi algérienne 17-08 sur la protection des données de santé.</p>

      <div class="sec-features-grid">
        <div class="sec-feature">
          <div class="sec-feature-icon" style="background:#EBF5FB">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A3D62" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h3 class="sec-feature-title">Données chiffrées</h3>
          <p class="sec-feature-desc">Toutes vos données médicales sont chiffrées et stockées de manière sécurisée conformément aux standards internationaux.</p>
        </div>
        <div class="sec-feature">
          <div class="sec-feature-icon" style="background:#DCFCE7">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3 class="sec-feature-title">Loi 17-08 conforme</h3>
          <p class="sec-feature-desc">Notre plateforme respecte intégralement la loi algérienne relative à la protection des personnes physiques dans le traitement des données à caractère personnel.</p>
        </div>
        <div class="sec-feature">
          <div class="sec-feature-icon" style="background:#F5F3FF">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3 class="sec-feature-title">Accès contrôlé</h3>
          <p class="sec-feature-desc">Chaque médecin n'accède qu'aux dossiers de ses propres patients. Chaque accès est tracé et enregistré pour garantir la confidentialité.</p>
        </div>
        <div class="sec-feature">
          <div class="sec-feature-icon" style="background:#FEF3C7">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 class="sec-feature-title">Consentement explicite</h3>
          <p class="sec-feature-desc">Chaque patient donne son consentement explicite lors de l'inscription pour le traitement de ses données médicales personnelles.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <div class="cta-wrap">
    <div class="cta" id="contact">
      <div class="cta-circles">
        <div class="cc cc1"></div>
        <div class="cc cc2"></div>
      </div>
      <div class="cta-in">
        <div class="cta-text">
          <h2 class="cta-h2">Rejoignez MediNova<br>dès aujourd'hui</h2>
          <p class="cta-p">Créez votre dossier patient en moins de 2 minutes. Accédez à vos ordonnances, rendez-vous et dossier médical depuis n'importe où.</p>
        </div>
        <button class="btn-cta" (click)="auth.navigate('register')">
          Créer mon compte gratuitement
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  </div>

  <!-- ═══ STATISTIQUES ═══ -->
  <section style="background:linear-gradient(135deg,#0A3D62,#1a5c8a);padding:60px 24px">
    <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center">
      <div *ngFor="let s of stats" style="color:white">
        <div style="font-size:48px;font-weight:900;font-family:Sora,sans-serif;line-height:1">{{ s.val }}</div>
        <div style="font-size:13px;opacity:.75;margin-top:8px">{{ s.label }}</div>
      </div>
    </div>
  </section>

  <!-- ═══ AVIS PATIENTS ═══ -->
  <section style="padding:80px 24px;background:#f8fafc" id="avis">
    <div style="max-width:1100px;margin:0 auto">
      <div style="text-align:center;margin-bottom:48px">
        <span style="background:#EBF5FB;color:#0A3D62;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Témoignages</span>
        <h2 style="font-family:Sora,sans-serif;font-size:32px;font-weight:800;margin-top:12px">Ce que disent nos patients</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
        <div *ngFor="let a of avis" style="background:white;border-radius:16px;padding:24px;border:1.5px solid #e2e8f0;transition:all .2s"
             onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 32px rgba(10,61,98,.1)'"
             onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='none'">
          <div style="display:flex;gap:4px;margin-bottom:12px">
            <span *ngFor="let s of [1,2,3,4,5]" style="color:#f59e0b;font-size:16px">★</span>
          </div>
          <p style="font-size:14px;color:#475569;line-height:1.7;margin-bottom:16px;font-style:italic">"{{ a.texte }}"</p>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#0A3D62,#1a5c8a);color:white;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px">
              {{ a.initiales }}
            </div>
            <div>
              <div style="font-size:14px;font-weight:700">{{ a.nom }}</div>
              <div style="font-size:11px;color:#94a3b8">{{ a.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══ CARTE / LOCALISATION ═══ -->
  <section style="padding:80px 24px;background:white" id="contact">
    <div style="max-width:1100px;margin:0 auto">
      <div style="text-align:center;margin-bottom:48px">
        <span style="background:#EBF5FB;color:#0A3D62;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Nous trouver</span>
        <h2 style="font-family:Sora,sans-serif;font-size:32px;font-weight:800;margin-top:12px">Localisation du cabinet</h2>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start">
        <!-- Infos contact -->
        <div>
          <div *ngFor="let c of contacts" style="display:flex;align-items:flex-start;gap:16px;padding:20px;background:#f8fafc;border-radius:14px;border:1.5px solid #e2e8f0;margin-bottom:12px">
            <div style="width:48px;height:48px;border-radius:12px;background:#EBF5FB;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">
              {{ c.icon }}
            </div>
            <div>
              <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;margin-bottom:4px">{{ c.label }}</div>
              <div style="font-size:15px;font-weight:600;color:#0f172a">{{ c.valeur }}</div>
            </div>
          </div>
          <!-- Horaires -->
          <div style="background:#EBF5FB;border-radius:14px;padding:20px;margin-top:12px">
            <div style="font-size:13px;font-weight:800;color:#0A3D62;margin-bottom:12px">🕐 Horaires d'ouverture</div>
            <div *ngFor="let h of horaires" style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid rgba(10,61,98,.08)">
              <span style="font-weight:600;color:#0A3D62">{{ h.jour }}</span>
              <span [style.color]="h.ferme ? '#e74c3c' : '#166534'" style="font-weight:700">{{ h.heure }}</span>
            </div>
          </div>
        </div>
        <!-- Carte SVG -->
        <div style="border-radius:20px;overflow:hidden;border:2px solid #e2e8f0;background:#f0f4f8;height:420px;display:flex;align-items:center;justify-content:center;position:relative">
          <svg viewBox="0 0 400 300" style="width:100%;height:100%">
            <!-- Fond carte -->
            <rect width="400" height="300" fill="#e8f0f7"/>
            <!-- Rues -->
            <rect x="0" y="130" width="400" height="14" fill="#fff" opacity=".9" rx="2"/>
            <rect x="180" y="0" width="14" height="300" fill="#fff" opacity=".9" rx="2"/>
            <rect x="0" y="200" width="400" height="8" fill="#fff" opacity=".6" rx="2"/>
            <rect x="100" y="0" width="8" height="300" fill="#fff" opacity=".6" rx="2"/>
            <rect x="280" y="0" width="8" height="300" fill="#fff" opacity=".6" rx="2"/>
            <!-- Blocs bâtiments -->
            <rect x="40" y="50" width="50" height="70" fill="#cbd5e1" rx="4"/>
            <rect x="110" y="20" width="60" height="100" fill="#94a3b8" rx="4"/>
            <rect x="200" y="40" width="70" height="80" fill="#cbd5e1" rx="4"/>
            <rect x="40" y="150" width="50" height="40" fill="#94a3b8" rx="4"/>
            <rect x="200" y="160" width="70" height="30" fill="#cbd5e1" rx="4"/>
            <rect x="300" y="50" width="60" height="70" fill="#94a3b8" rx="4"/>
            <rect x="300" y="155" width="60" height="35" fill="#cbd5e1" rx="4"/>
            <rect x="40" y="220" width="50" height="50" fill="#94a3b8" rx="4"/>
            <rect x="200" y="215" width="70" height="55" fill="#cbd5e1" rx="4"/>
            <!-- Marqueur Cabinet -->
            <circle cx="187" cy="137" r="22" fill="#0A3D62" opacity=".15"/>
            <circle cx="187" cy="137" r="14" fill="#0A3D62"/>
            <text x="187" y="142" text-anchor="middle" font-size="14" fill="white">🏥</text>
            <!-- Label -->
            <rect x="120" y="105" width="120" height="24" fill="white" rx="12" opacity=".95"/>
            <text x="180" y="121" text-anchor="middle" font-size="11" fill="#0A3D62" font-weight="700">Cabinet MediNova</text>
            <!-- Labels rues -->
            <text x="200" y="128" text-anchor="middle" font-size="9" fill="#64748b">Rue Didouche Mourad</text>
          </svg>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══ FORMULAIRE CONTACT ═══ -->
  <section style="padding:80px 24px;background:#f8fafc">
    <div style="max-width:680px;margin:0 auto">
      <div style="text-align:center;margin-bottom:48px">
        <span style="background:#EBF5FB;color:#0A3D62;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Contact</span>
        <h2 style="font-family:Sora,sans-serif;font-size:32px;font-weight:800;margin-top:12px">Écrivez-nous</h2>
        <p style="color:#64748b;margin-top:8px">Nous vous répondrons dans les 24 heures</p>
      </div>
      <div style="background:white;border-radius:20px;padding:36px;border:1.5px solid #e2e8f0;box-shadow:0 4px 24px rgba(10,61,98,.06)">
        <div *ngIf="contactSuccess" style="background:#dcfce7;border:1.5px solid #86efac;border-radius:12px;padding:16px;text-align:center;margin-bottom:20px;color:#166534;font-weight:700">
          ✅ Message envoyé ! Nous vous répondrons bientôt.
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
          <div>
            <label style="font-size:12px;font-weight:700;color:#0f172a;display:block;margin-bottom:5px">Nom complet</label>
            <input type="text" [(ngModel)]="contactNom" placeholder="Votre nom"
                   style="width:100%;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 13px;font-size:13.5px;color:#0f172a;font-family:inherit"/>
          </div>
          <div>
            <label style="font-size:12px;font-weight:700;color:#0f172a;display:block;margin-bottom:5px">Email</label>
            <input type="email" [(ngModel)]="contactEmail" placeholder="votre@email.com"
                   style="width:100%;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 13px;font-size:13.5px;color:#0f172a;font-family:inherit"/>
          </div>
        </div>
        <div style="margin-bottom:14px">
          <label style="font-size:12px;font-weight:700;color:#0f172a;display:block;margin-bottom:5px">Sujet</label>
          <input type="text" [(ngModel)]="contactSujet" placeholder="Ex: Prise de rendez-vous, Renseignement..."
                 style="width:100%;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 13px;font-size:13.5px;color:#0f172a;font-family:inherit"/>
        </div>
        <div style="margin-bottom:20px">
          <label style="font-size:12px;font-weight:700;color:#0f172a;display:block;margin-bottom:5px">Message</label>
          <textarea [(ngModel)]="contactMessage" placeholder="Votre message..."
                    style="width:100%;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:10px 13px;font-size:13.5px;color:#0f172a;font-family:inherit;min-height:120px;resize:vertical"></textarea>
        </div>
        <button (click)="envoyerContact()"
                style="width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#0A3D62,#1a5c8a);color:white;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s"
                onmouseenter="this.style.transform='translateY(-2px)'"
                onmouseleave="this.style.transform='translateY(0)'">
          📨 Envoyer le message
        </button>
      </div>
    </div>
  </section>

  <!-- ═══ BLOG / ACTUALITES ═══ -->
  <section style="padding:80px 24px;background:white">
    <div style="max-width:1100px;margin:0 auto">
      <div style="text-align:center;margin-bottom:48px">
        <span style="background:#EBF5FB;color:#0A3D62;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Blog Santé</span>
        <h2 style="font-family:Sora,sans-serif;font-size:32px;font-weight:800;margin-top:12px">Actualités & Conseils</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
        <div *ngFor="let article of articles"
             style="border-radius:16px;overflow:hidden;border:1.5px solid #e2e8f0;transition:all .2s;cursor:pointer"
             onmouseenter="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 32px rgba(10,61,98,.1)'"
             onmouseleave="this.style.transform='translateY(0)';this.style.boxShadow='none'">
          <div [style.background]="article.couleur" style="height:140px;display:flex;align-items:center;justify-content:center;font-size:56px">
            {{ article.emoji }}
          </div>
          <div style="padding:20px">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#94a3b8;margin-bottom:6px">{{ article.categorie }}</div>
            <h3 style="font-family:Sora,sans-serif;font-size:16px;font-weight:700;color:#0f172a;margin-bottom:8px;line-height:1.4">{{ article.titre }}</h3>
            <p style="font-size:13px;color:#64748b;line-height:1.6;margin-bottom:12px">{{ article.extrait }}</p>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:11px;color:#94a3b8">{{ article.date }}</span>
              <span style="font-size:12px;font-weight:700;color:#0A3D62">Lire →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="footer-in">
      <div class="footer-logo">
        <div class="logo-icon" style="width:30px;height:30px;border-radius:8px">
          <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
            <path d="M11 2v18M2 11h18" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
          </svg>
        </div>
        MediNova
      </div>
      <div class="footer-copy">
        © 2026 MediNova · Conforme à la Loi algérienne n° 18-07 · Tous droits réservés
      </div>
    </div>
  </footer>

</div>
  `,
  styles: [`
    .hw {
      font-family: 'DM Sans', -apple-system, sans-serif;
      background: #F8FAFC;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* ── NAV ─────────────────────────────────── */
    .nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 900;
      height: 66px;
      background: rgba(255,255,255,.93);
      backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(10,61,98,.07);
      animation: fadeDown .65s cubic-bezier(.16,1,.3,1);
    }
    @keyframes fadeDown { from{opacity:0;transform:translateY(-18px)} to{opacity:1;transform:translateY(0)} }
    .nav-in {
      max-width: 1260px; margin: 0 auto; padding: 0 32px;
      height: 100%; display: flex; align-items: center; gap: 40px;
    }
    .logo {
      display: flex; align-items: center; gap: 10px;
      font-family: 'Sora', sans-serif; font-weight: 900; font-size: 19px;
      color: #0A3D62; cursor: pointer; letter-spacing: -.4px; flex-shrink: 0;
    }
    .logo-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #0A3D62, #1a6b9a);
      display: flex; align-items: center; justify-content: center;
    }
    .nav-links { display: flex; gap: 32px; margin-left: auto; }
    .nav-links a {
      font-size: 13.5px; font-weight: 500; color: #64748B;
      text-decoration: none; cursor: pointer; transition: color .2s;
    }
    .nav-links a:hover { color: #0A3D62; }
    .nav-btns { display: flex; gap: 10px; }
    .btn-o {
      padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
      border: 1.5px solid rgba(10,61,98,.2); color: #0A3D62;
      background: transparent; cursor: pointer; transition: all .2s;
      font-family: 'DM Sans', sans-serif;
    }
    .btn-o:hover { border-color: #0A3D62; background: rgba(10,61,98,.04); }
    .btn-f {
      padding: 9px 20px; border-radius: 8px; font-size: 13px; font-weight: 700;
      background: linear-gradient(135deg, #0A3D62, #1a5c8a);
      color: white; border: none; cursor: pointer;
      box-shadow: 0 4px 14px rgba(10,61,98,.22);
      transition: all .2s; font-family: 'DM Sans', sans-serif;
    }
    .btn-f:hover { transform: translateY(-1px); box-shadow: 0 8px 22px rgba(10,61,98,.32); }

    /* ── HERO ────────────────────────────────── */
    .hero {
      min-height: 100vh; padding: 120px 32px 80px;
      position: relative; overflow: hidden;
    }
    .hero-bg-grid {
      position: absolute; inset: 0; z-index: 0;
      background-image:
        linear-gradient(rgba(10,61,98,.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(10,61,98,.025) 1px, transparent 1px);
      background-size: 56px 56px;
    }
    .hero-glow {
      position: absolute; border-radius: 50%; z-index: 0; pointer-events: none;
    }
    .g1 {
      width: 640px; height: 640px;
      background: radial-gradient(circle, rgba(0,201,167,.07) 0%, transparent 70%);
      top: -200px; right: -100px;
      animation: glow1 14s ease-in-out infinite alternate;
    }
    .g2 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(10,61,98,.055) 0%, transparent 70%);
      bottom: -100px; left: 0;
      animation: glow1 10s ease-in-out infinite alternate-reverse;
    }
    @keyframes glow1 {
      from { transform: scale(1) translate(0,0); }
      to   { transform: scale(1.2) translate(30px, 20px); }
    }
    .hero-in {
      max-width: 1260px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 72px; align-items: center; position: relative; z-index: 1;
    }

    /* Hero Left */
    .hero-l { animation: fadeUp .8s cubic-bezier(.16,1,.3,1) both; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }

    .hero-tag {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(0,201,167,.1); border: 1px solid rgba(0,201,167,.25);
      color: #0d9276; padding: 6px 16px; border-radius: 100px;
      font-size: 12px; font-weight: 700; margin-bottom: 24px;
      letter-spacing: .4px; text-transform: uppercase;
    }
    .tag-dot {
      width: 7px; height: 7px; background: #00C9A7;
      border-radius: 50%; animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%,100%{opacity:1;transform:scale(1)}
      50%{opacity:.4;transform:scale(1.7)}
    }
    .hero-h1 {
      font-family: 'Sora', sans-serif;
      font-size: clamp(36px, 4.5vw, 58px);
      font-weight: 900; line-height: 1.06;
      letter-spacing: -2.5px; color: #0F172A;
      margin-bottom: 22px;
    }
    .hero-grad {
      background: linear-gradient(135deg, #0A3D62 0%, #1a6b9a 40%, #00C9A7 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-p {
      font-size: 16px; line-height: 1.75; color: #475569;
      margin-bottom: 36px; max-width: 460px;
    }
    .hero-btns { display: flex; gap: 14px; margin-bottom: 48px; flex-wrap: wrap; }
    .btn-primary-lg {
      display: flex; align-items: center; gap: 9px;
      padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 700;
      background: linear-gradient(135deg, #0A3D62, #1a6b9a);
      color: white; border: none; cursor: pointer;
      box-shadow: 0 8px 24px rgba(10,61,98,.28);
      transition: all .25s; font-family: 'DM Sans', sans-serif;
    }
    .btn-primary-lg:hover { transform: translateY(-3px); box-shadow: 0 16px 36px rgba(10,61,98,.38); }
    .btn-secondary-lg {
      display: flex; align-items: center; gap: 8px;
      padding: 14px 24px; border-radius: 12px; font-size: 15px; font-weight: 600;
      background: white; color: #0A3D62;
      border: 1.5px solid rgba(10,61,98,.16);
      cursor: pointer; transition: all .2s; font-family: 'DM Sans', sans-serif;
    }
    .btn-secondary-lg:hover { border-color: #0A3D62; transform: translateY(-1px); }

    .hero-stats { display: flex; gap: 36px; }
    .h-stat-n {
      font-family: 'Sora', sans-serif; font-size: 30px; font-weight: 900;
      color: #0A3D62; line-height: 1;
    }
    .h-stat-l { font-size: 12px; color: #64748B; margin-top: 4px; font-weight: 500; }

    /* Hero Right */
    .hero-r {
      position: relative;
      animation: fadeUp .8s cubic-bezier(.16,1,.3,1) .18s both;
    }
    .dash-preview {
      background: white; border-radius: 20px;
      box-shadow: 0 24px 64px rgba(10,61,98,.11), 0 0 0 1px rgba(10,61,98,.05);
      overflow: hidden;
    }
    .dp-header {
      display: flex; align-items: center; gap: 8px;
      padding: 14px 18px; border-bottom: 1px solid #F1F5F9;
    }
    .dp-dots { display: flex; gap: 5px; }
    .dp-dot { width: 10px; height: 10px; border-radius: 50%; }
    .dp-title { font-size: 12px; color: #94A3B8; font-weight: 600; margin-left: 4px; }

    .dp-kpis {
      display: grid; grid-template-columns: repeat(3, 1fr);
      padding: 16px 18px; gap: 8px;
    }
    .dp-kpi {
      background: #F8FAFC; border-radius: 10px; padding: 12px;
      text-align: center;
    }
    .dp-kpi-val {
      font-family: 'Sora', sans-serif; font-size: 22px; font-weight: 900;
      color: #0A3D62;
    }
    .dp-kpi-lbl { font-size: 10px; color: #94A3B8; margin-top: 3px; font-weight: 600; }
    .dp-divider { height: 1px; background: #F1F5F9; margin: 0 18px; }

    .dp-list { padding: 8px 18px 14px; }
    .dp-row {
      display: flex; align-items: center; gap: 11px;
      padding: 10px 0; border-bottom: 1px solid #F8FAFC;
      animation: fadeUp .4s cubic-bezier(.16,1,.3,1) both;
      transition: all .2s;
    }
    .dp-row:last-child { border-bottom: none; }
    .dp-ava {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 800;
      flex-shrink: 0;
    }
    .dp-name { font-size: 13px; font-weight: 700; color: #0F172A; }
    .dp-spec { font-size: 11px; color: #94A3B8; margin-top: 2px; }
    .dp-badge {
      margin-left: auto; padding: 3px 9px; border-radius: 100px;
      font-size: 10px; font-weight: 800; white-space: nowrap; flex-shrink: 0;
    }
    .badge-ok   { background: #DCFCE7; color: #166534; }
    .badge-wait { background: #FEF3C7; color: #92400E; }

    /* Skeletons */
    .sk-ava {
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    .sk-line {
      height: 10px; border-radius: 5px;
      background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Floating badges */
    .fb {
      position: absolute; background: white; border-radius: 14px;
      padding: 12px 16px; box-shadow: 0 16px 40px rgba(10,61,98,.12);
      display: flex; align-items: center; gap: 12px;
      animation: float 6s ease-in-out infinite;
    }
    .fb1 { bottom: -28px; left: -44px; animation-delay: 0s; }
    .fb2 { top: -20px; right: -36px; animation-delay: 3s; }
    @keyframes float {
      0%,100%{transform:translateY(0)}
      50%{transform:translateY(-10px)}
    }
    .fb-ico {
      width: 34px; height: 34px; border-radius: 9px;
      background: #DCFCE7; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .fb-val {
      font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 900; color: #0A3D62;
    }
    .fb-lbl { font-size: 10px; color: #94A3B8; font-weight: 600; margin-top: 1px; }

    /* ── SECTIONS ────────────────────────────── */
    .sec { padding: 100px 32px; }
    .sec-alt { background: white; }
    .sec-in { max-width: 1260px; margin: 0 auto; }
    .sec-tag {
      display: inline-flex; align-items: center;
      background: rgba(10,61,98,.07); color: #0A3D62;
      padding: 5px 16px; border-radius: 100px;
      font-size: 11px; font-weight: 800; text-transform: uppercase;
      letter-spacing: .5px; margin-bottom: 16px;
    }
    .sec-h2 {
      font-family: 'Sora', sans-serif;
      font-size: clamp(26px, 3.5vw, 42px);
      font-weight: 900; letter-spacing: -1.5px;
      color: #0F172A; margin-bottom: 14px;
    }
    .sec-sub { font-size: 15px; color: #64748B; margin-bottom: 52px; max-width: 520px; }

    /* Docs grid */
    .docs-loading {
      display: flex; align-items: center; justify-content: center;
      gap: 14px; padding: 60px; color: #94A3B8; font-size: 14px;
    }
    .loader {
      width: 26px; height: 26px; border-radius: 50%;
      border: 2.5px solid rgba(10,61,98,.15); border-top-color: #0A3D62;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to{transform:rotate(360deg)} }

    .docs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px;
    }
    .doc-card {
      background: white; border-radius: 18px; padding: 22px;
      border: 1.5px solid #E2E8F0;
      cursor: pointer; transition: all .28s cubic-bezier(.16,1,.3,1);
    }
    .doc-card:hover {
      transform: translateY(-7px);
      box-shadow: 0 20px 48px rgba(10,61,98,.12);
      border-color: rgba(10,61,98,.2);
    }
    .doc-top { display: flex; align-items: flex-start; gap: 13px; margin-bottom: 16px; }
    .doc-ava {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 900;
      flex-shrink: 0;
    }
    .doc-meta { flex: 1; }
    .doc-name { font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 800; color: #0F172A; }
    .doc-spec { font-size: 12px; color: #64748B; margin-top: 4px; }
    .doc-avail {
      display: flex; align-items: center; gap: 5px; margin-top: 2px;
      font-size: 11px; font-weight: 700; color: #166534;
    }
    .avail-dot {
      width: 7px; height: 7px; background: #00C9A7;
      border-radius: 50%; animation: pulse 2s infinite;
    }
    .doc-sep { height: 1px; background: #F1F5F9; margin-bottom: 14px; }
    .doc-foot { display: flex; align-items: center; justify-content: space-between; }
    .doc-info-item {
      display: flex; align-items: center; gap: 5px;
      font-size: 11px; color: #94A3B8;
    }
    .btn-rdv {
      background: linear-gradient(135deg, #0A3D62, #1a6b9a);
      color: white; padding: 8px 16px; border-radius: 9px;
      font-size: 12px; font-weight: 700; border: none; cursor: pointer;
      transition: all .2s; font-family: 'DM Sans', sans-serif;
    }
    .btn-rdv:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(10,61,98,.3); }

    .no-docs {
      grid-column: 1/-1; text-align: center; padding: 48px;
      color: #94A3B8; font-size: 14px;
    }

    /* Services */
    .srv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
    .srv-card {
      background: white; border-radius: 20px; padding: 30px;
      border: 1.5px solid #E2E8F0;
      transition: all .3s cubic-bezier(.16,1,.3,1);
      position: relative; overflow: hidden;
    }
    .srv-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, #0A3D62, #00C9A7);
      opacity: 0; transition: opacity .3s;
    }
    .srv-card:hover { transform: translateY(-8px); box-shadow: 0 20px 48px rgba(10,61,98,.12); border-color: rgba(10,61,98,.15); }
    .srv-card:hover::after { opacity: 1; }
    .srv-ico {
      width: 60px; height: 60px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 20px;
    }
    .srv-title { font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 800; color: #0F172A; margin-bottom: 10px; }
    .srv-desc { font-size: 14px; color: #64748B; line-height: 1.7; }

    /* CTA */
    .cta-wrap { padding: 0 32px 80px; }
    .cta {
      max-width: 1260px; margin: 0 auto; border-radius: 26px; overflow: hidden;
      background: linear-gradient(135deg, #0A3D62 0%, #0d5a8a 55%, #1a6b9a 100%);
      padding: 80px 64px; position: relative;
    }
    .cta-circles { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
    .cc {
      position: absolute; border-radius: 50%;
      background: rgba(255,255,255,.05);
    }
    .cc1 { width: 420px; height: 420px; top: -160px; right: -80px; }
    .cc2 { width: 240px; height: 240px; bottom: -90px; left: 80px; }
    .cta-in {
      position: relative; z-index: 1;
      display: flex; align-items: center; justify-content: space-between;
      gap: 48px; flex-wrap: wrap;
    }
    .cta-h2 {
      font-family: 'Sora', sans-serif; font-size: 36px; font-weight: 900;
      color: white; letter-spacing: -1px; margin-bottom: 14px;
    }
    .cta-p { font-size: 15px; color: rgba(255,255,255,.75); line-height: 1.65; max-width: 440px; }
    .btn-cta {
      display: flex; align-items: center; gap: 10px; white-space: nowrap;
      background: white; color: #0A3D62;
      padding: 16px 32px; border-radius: 14px;
      font-size: 15px; font-weight: 800; border: none; cursor: pointer;
      box-shadow: 0 8px 28px rgba(0,0,0,.16);
      transition: all .25s; font-family: 'DM Sans', sans-serif; flex-shrink: 0;
    }
    .btn-cta:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 16px 40px rgba(0,0,0,.22); }

    /* Comment ça marche */
    .steps-wrap { position: relative; }
    .steps-line {
      position: absolute; top: 80px; left: calc(16% + 40px); right: calc(16% + 40px);
      height: 2px;
      background: linear-gradient(90deg, #0A3D62, #00C9A7, #6D28D9);
      opacity: .2; z-index: 0;
    }
    .steps-grid {
      display: grid; grid-template-columns: repeat(3,1fr);
      gap: 28px; position: relative; z-index: 1;
    }
    .step-card {
      background: white; border-radius: 22px; padding: 32px 28px;
      border: 1.5px solid #E2E8F0; text-align: center;
      transition: all .3s cubic-bezier(.16,1,.3,1);
      display: flex; flex-direction: column; align-items: center; gap: 16px;
    }
    .step-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 24px 56px rgba(10,61,98,.1);
      border-color: rgba(10,61,98,.15);
    }
    .step-card--mid {
      border-color: rgba(0,201,167,.25);
      background: linear-gradient(160deg, #f0fdf9 0%, white 60%);
    }
    .step-num {
      font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 900;
      color: #0A3D62; letter-spacing: 1px;
      border: 1.5px solid rgba(10,61,98,.2); border-radius: 100px;
      padding: 4px 14px; background: rgba(10,61,98,.04);
    }
    .step-icon-wrap {
      width: 72px; height: 72px; border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
    }
    .step-title {
      font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 800;
      color: #0F172A;
    }
    .step-desc { font-size: 13.5px; color: #64748B; line-height: 1.7; }
    .step-badge {
      background: rgba(10,61,98,.07); color: #0A3D62;
      padding: 5px 16px; border-radius: 100px;
      font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px;
    }

    /* Floating medical icons */
    .float-icon {
      position: absolute; font-size: 32px; opacity: .12;
      animation: floatAnim 6s ease-in-out infinite;
      pointer-events: none; z-index: 0; user-select: none;
    }
    .fi1 { top: 15%; left: 5%; animation-delay: 0s; }
    .fi2 { top: 60%; left: 8%; animation-delay: 1.2s; font-size: 24px; }
    .fi3 { top: 25%; right: 8%; animation-delay: .8s; }
    .fi4 { bottom: 20%; right: 5%; animation-delay: 2s; font-size: 28px; }
    .fi5 { top: 70%; right: 12%; animation-delay: .4s; font-size: 22px; }
    .fi6 { top: 40%; left: 3%; animation-delay: 1.6s; font-size: 26px; }
    @keyframes floatAnim {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      33% { transform: translateY(-15px) rotate(5deg); }
      66% { transform: translateY(8px) rotate(-3deg); }
    }

    /* Wave */
    .wave-wrap { margin-top: -2px; line-height: 0; }
    .wave-wrap svg { width: 100%; height: 80px; display: block; }

    /* Scroll animations */
    .fade-up {
      opacity: 0; transform: translateY(30px);
      transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1);
    }
    .fade-up.visible { opacity: 1; transform: translateY(0); }
    .fade-up-delay-1 { transition-delay: .1s; }
    .fade-up-delay-2 { transition-delay: .2s; }
    .fade-up-delay-3 { transition-delay: .3s; }

    /* Sécurité features */
    .sec-features-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-top: 48px; }
    .sec-feature { background: white; border-radius: 20px; padding: 28px 24px; border: 1.5px solid #E2E8F0; transition: all .3s cubic-bezier(.16,1,.3,1); }
    .sec-feature:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(10,61,98,.1); border-color: rgba(10,61,98,.15); }
    .sec-feature-icon { width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
    .sec-feature-title { font-family: 'Sora',sans-serif; font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 10px; }
    .sec-feature-desc { font-size: 13px; color: #64748B; line-height: 1.7; }

    /* Footer */
    .footer { background: #0A3D62; padding: 32px; }
    .footer-in {
      max-width: 1260px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 16px;
    }
    .footer-logo {
      display: flex; align-items: center; gap: 10px;
      font-family: 'Sora', sans-serif; font-weight: 900; font-size: 17px; color: white;
    }
    .footer-copy { font-size: 12px; color: rgba(255,255,255,.45); }

    /* RESPONSIVE */
    @media (max-width: 960px) {
      .hero-in { grid-template-columns: 1fr; }
      .hero-r { display: none; }
      .srv-grid { grid-template-columns: 1fr 1fr; }
      .steps-grid { grid-template-columns: 1fr; }
      .steps-line { display: none; }
      .sec-features-grid { grid-template-columns: 1fr 1fr; }
      .nav-links { display: none; }
      .cta { padding: 48px 32px; }
    }
    @media (max-width: 640px) {
      .srv-grid { grid-template-columns: 1fr; }
      .hero-stats { gap: 20px; }
      .docs-grid { grid-template-columns: 1fr; }
      .hero-h1 { letter-spacing: -1.5px; }
      .cta-h2 { font-size: 26px; }
    }
  `]
})
export class HomeComponent implements OnInit {
  medecins: any[] = [];
  stats: any = null;
  loading = true;

  // Statistiques
  statsData = [
    { val: '2+', label: 'Médecins spécialistes' },
    { val: '500+', label: 'Patients suivis' },
    { val: '98%', label: 'Satisfaction patients' },
    { val: '24/7', label: 'Dossier accessible' },
  ];

  // Avis patients
  avis = [
    { texte: 'Service exceptionnel ! La prise de rendez-vous en ligne est très pratique et le médecin est très attentionné.', nom: 'Amira B.', initiales: 'AB', date: 'Mai 2026' },
    { texte: 'Le dossier médical numérique est une révolution. Je peux voir mes ordonnances et consultations à tout moment.', nom: 'Karim M.', initiales: 'KM', date: 'Avril 2026' },
    { texte: 'Très professionnel. L\'IA de triage m\'a aidé à comprendre mes symptômes avant ma consultation.', nom: 'Fatima Z.', initiales: 'FZ', date: 'Mars 2026' },
  ];

  // Contact
  contacts = [
    { icon: '📍', label: 'Adresse', valeur: 'Rue Didouche Mourad, Alger Centre, Algérie' },
    { icon: '📞', label: 'Téléphone', valeur: '+213 21 XX XX XX' },
    { icon: '✉️', label: 'Email', valeur: 'contact@medinova.dz' },
    { icon: '🕐', label: 'Urgences', valeur: 'Via l\'application 24h/24' },
  ];

  horaires = [
    { jour: 'Lundi — Vendredi', heure: '08:00 — 17:00', ferme: false },
    { jour: 'Samedi', heure: '08:00 — 12:00', ferme: false },
    { jour: 'Dimanche', heure: 'Fermé', ferme: true },
  ];

  // Formulaire contact
  contactNom = '';
  contactEmail = '';
  contactSujet = '';
  contactMessage = '';
  contactSuccess = false;

  // Blog articles
  articles = [
    { emoji: '🫀', couleur: '#fee2e2', categorie: 'Cardiologie', titre: 'Comment prévenir les maladies cardiovasculaires ?', extrait: 'L\'hypertension artérielle touche 30% des algériens. Découvrez les gestes simples pour protéger votre cœur au quotidien.', date: '20 Mai 2026' },
    { emoji: '🧠', couleur: '#f5f3ff', categorie: 'Neurologie', titre: 'Le stress chronique : reconnaître et agir', extrait: 'Le stress prolongé peut avoir des effets sérieux sur la santé. Notre médecin vous explique comment le gérer efficacement.', date: '15 Mai 2026' },
    { emoji: '🍎', couleur: '#dcfce7', categorie: 'Nutrition', titre: 'Alimentation équilibrée en Algérie : guide pratique', extrait: 'Comment adapter une alimentation saine aux habitudes alimentaires algériennes ? Nos conseils nutritionnels accessibles.', date: '10 Mai 2026' },
  ];

  heroStats: any[] = [
    { val: '—', label: 'Médecins actifs' },
    { val: '—', label: 'Rendez-vous' },
    { val: '—', label: 'Patients' },
  ];

  services = [
    {
      title: 'Prise de rendez-vous',
      desc: 'Réservez en quelques clics auprès de votre médecin. Confirmation instantanée, rappel automatique 24h avant.',
      icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>',
      bg: '#EBF5FB', color: '#0A3D62',
    },
    {
      title: 'Dossier médical numérique',
      desc: 'Accédez à l\'intégralité de votre historique médical, consultations et ordonnances en toute sécurité.',
      icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      bg: '#DCFCE7', color: '#166534',
    },
    {
      title: 'Ordonnances numériques',
      desc: 'Vos prescriptions médicales sont disponibles en ligne, avec QR code de vérification d\'authenticité.',
      icon: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
      bg: '#F5F3FF', color: '#6D28D9',
    },
    {
      title: 'Analyse IA des symptômes',
      desc: 'Décrivez vos symptômes et obtenez une orientation vers la bonne spécialité médicale instantanément.',
      icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
      bg: '#FEF3C7', color: '#92400E',
    },
    {
      title: 'Soins infirmiers',
      desc: 'Suivi des soins paramédicaux, gestion des actes infirmiers et communication inter-professionnelle.',
      icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
      bg: '#FEE2E2', color: '#991B1B',
    },
    {
      title: 'Notifications & Rappels',
      desc: 'Recevez des rappels automatiques 24h avant chaque rendez-vous et suivez vos notifications en temps réel.',
      icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
      bg: '#EFF6FF', color: '#1E40AF',
    },
  ];

  constructor(public auth: AuthService, private http: HttpClient) {}

  envoyerContact() {
    if (!this.contactNom || !this.contactEmail || !this.contactMessage) return;
    this.http.post(`${API}/contact`, {
      nom: this.contactNom, email: this.contactEmail,
      sujet: this.contactSujet, message: this.contactMessage
    }).subscribe({ next: () => {}, error: () => {} });
    this.contactSuccess = true;
    this.contactNom = ''; this.contactEmail = '';
    this.contactSujet = ''; this.contactMessage = '';
    setTimeout(() => this.contactSuccess = false, 5000);
  }

  ngOnInit() {
    this.chargerMedecins();
    this.chargerStats();
    // Animations au scroll
    setTimeout(() => this.initScrollAnimations(), 500);
  }

  initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
  }

  chargerMedecins() {
    this.loading = true;
    this.http.get<any[]>(`${API}/medecins`).subscribe({
      next: m => {
        this.medecins = m;
        this.loading = false;
        this.heroStats[0].val = m.length || '—';
      },
      error: () => { this.medecins = []; this.loading = false; }
    });
  }

  chargerStats() {
    this.http.get<any>(`${API}/admin/rapport`).subscribe({
      next: s => {
        this.stats = s;
        this.heroStats[0].val = s.total_medecins || '—';
        this.heroStats[1].val = s.total_rendez_vous || '—';
        this.heroStats[2].val = s.total_patients || '—';
      },
      error: () => {}
    });
  }

  initiales(m: any): string {
    return ((m.prenom?.[0] || '') + (m.nom?.[0] || '')).toUpperCase();
  }

  color(i: number) { return COLORS[i % COLORS.length]; }
}