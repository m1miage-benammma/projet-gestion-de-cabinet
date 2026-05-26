import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
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

  <!-- MÉDECINS DYNAMIQUES -->
  <section class="sec" id="medecins">
    <div class="sec-in">
      <div class="sec-tag">Nos spécialistes</div>
      <h2 class="sec-h2">Des médecins qualifiés<br>à votre service</h2>
      <p class="sec-sub">Prenez rendez-vous en ligne avec nos spécialistes — confirmation instantanée, rappel automatique 24h avant.</p>

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
      <div class="sec-tag">Fonctionnalités</div>
      <h2 class="sec-h2">Tout ce dont vous avez<br>besoin, au même endroit</h2>
      <div class="srv-grid">
        <div class="srv-card" *ngFor="let s of services">
          <div class="srv-ico" [style.background]="s.bg">
            <svg [attr.width]="22" [attr.height]="22" viewBox="0 0 24 24" fill="none" [attr.stroke]="s.color" stroke-width="2" [innerHTML]="s.icon"></svg>
          </div>
          <div class="srv-title">{{ s.title }}</div>
          <div class="srv-desc">{{ s.desc }}</div>
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
    .srv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .srv-card {
      background: #F8FAFC; border-radius: 18px; padding: 28px;
      border: 1.5px solid #E2E8F0;
      transition: all .28s cubic-bezier(.16,1,.3,1);
    }
    .srv-card:hover { background: white; transform: translateY(-5px); box-shadow: 0 16px 40px rgba(10,61,98,.1); }
    .srv-ico {
      width: 50px; height: 50px; border-radius: 13px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 18px;
    }
    .srv-title { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 800; color: #0F172A; margin-bottom: 10px; }
    .srv-desc { font-size: 13.5px; color: #64748B; line-height: 1.7; }

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

  ngOnInit() {
    this.chargerMedecins();
    this.chargerStats();
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