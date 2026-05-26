import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-ordonnance-publique',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ordo-pub-wrap">
      <div class="ordo-pub-loading" *ngIf="loading">
        <div class="spinner"></div>
        <p>Chargement de l'ordonnance...</p>
      </div>

      <div class="ordo-pub-error" *ngIf="!loading && error">
        <div style="font-size:48px">❌</div>
        <h2>Ordonnance introuvable</h2>
        <p>{{ error }}</p>
      </div>

      <div class="ordo-pub-card" *ngIf="!loading && !error && ordo">
        <!-- Header -->
        <div class="ordo-pub-header">
          <div class="ordo-pub-clinic">
            <div class="ordo-pub-logo">🏥</div>
            <div>
              <div class="ordo-pub-clinic-name">Cabinet MediNova</div>
              <div class="ordo-pub-clinic-sub">Système de Gestion Médicale</div>
            </div>
          </div>
          <div class="ordo-pub-badge">
            <div class="ordo-pub-badge-title">ORDONNANCE</div>
            <div class="ordo-pub-badge-num">N° ORD-{{ ordo.id_ordonnance }}</div>
          </div>
        </div>

        <!-- Verified banner -->
        <div class="ordo-pub-verified">
          ✅ Ordonnance vérifiée — Cabinet MediNova
        </div>

        <!-- Info patient & médecin -->
        <div class="ordo-pub-info-grid">
          <div class="ordo-pub-info-box">
            <div class="ordo-pub-info-label">Patient</div>
            <div class="ordo-pub-info-value">{{ ordo.patient_prenom }} {{ ordo.patient_nom }}</div>
          </div>
          <div class="ordo-pub-info-box">
            <div class="ordo-pub-info-label">Médecin</div>
            <div class="ordo-pub-info-value">Dr. {{ ordo.medecin_prenom }} {{ ordo.medecin_nom }}</div>
          </div>
          <div class="ordo-pub-info-box">
            <div class="ordo-pub-info-label">Date d'émission</div>
            <div class="ordo-pub-info-value">{{ ordo.date_emission | date:'dd/MM/yyyy' }}</div>
          </div>
        </div>

        <!-- Médicaments -->
        <div class="ordo-pub-section">
          <div class="ordo-pub-section-title">℞ Médicaments prescrits</div>
          <div *ngIf="!ordo.medicaments?.length" class="ordo-pub-empty">Aucun médicament prescrit.</div>
          <div *ngFor="let m of ordo.medicaments; let i=index" class="ordo-pub-med">
            <div class="ordo-pub-med-num">{{ i+1 }}</div>
            <div>
              <div class="ordo-pub-med-name">{{ m.nom }}</div>
              <div class="ordo-pub-med-detail">{{ m.dosage }} — {{ m.duree }}</div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="ordo-pub-section" *ngIf="ordo.instructions">
          <div class="ordo-pub-section-title">📋 Instructions</div>
          <div class="ordo-pub-instructions">{{ ordo.instructions }}</div>
        </div>

        <!-- Footer -->
        <div class="ordo-pub-footer">
          <div class="ordo-pub-signature">
            <div class="ordo-pub-sig-line"></div>
            <div class="ordo-pub-sig-label">Signature du médecin</div>
          </div>
          <button class="ordo-pub-print-btn" (click)="imprimer()">🖨️ Imprimer</button>
        </div>
      </div>
    </div>

    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #f0f4f8; font-family: 'Segoe UI', sans-serif; }
      .ordo-pub-wrap { min-height: 100vh; background: #f0f4f8; display: flex; align-items: center; justify-content: center; padding: 24px; }
      .ordo-pub-loading, .ordo-pub-error { text-align: center; color: #0A3D62; }
      .spinner { width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top-color: #0A3D62; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .ordo-pub-card { background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(10,61,98,0.12); max-width: 640px; width: 100%; overflow: hidden; }
      .ordo-pub-header { background: #0A3D62; color: white; padding: 24px; display: flex; justify-content: space-between; align-items: center; }
      .ordo-pub-clinic { display: flex; align-items: center; gap: 12px; }
      .ordo-pub-logo { font-size: 32px; }
      .ordo-pub-clinic-name { font-size: 20px; font-weight: 700; }
      .ordo-pub-clinic-sub { font-size: 12px; opacity: 0.75; }
      .ordo-pub-badge { text-align: right; }
      .ordo-pub-badge-title { font-size: 14px; font-weight: 700; letter-spacing: 2px; opacity: 0.85; }
      .ordo-pub-badge-num { font-size: 18px; font-weight: 700; }
      .ordo-pub-verified { background: #d4edda; color: #155724; padding: 10px 24px; font-size: 14px; font-weight: 600; text-align: center; }
      .ordo-pub-info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; background: #e8ecf0; border-bottom: 1px solid #e8ecf0; }
      .ordo-pub-info-box { background: white; padding: 16px; }
      .ordo-pub-info-label { font-size: 11px; text-transform: uppercase; color: #6c757d; letter-spacing: 1px; margin-bottom: 4px; }
      .ordo-pub-info-value { font-size: 15px; font-weight: 600; color: #0A3D62; }
      .ordo-pub-section { padding: 20px 24px; border-bottom: 1px solid #f0f4f8; }
      .ordo-pub-section-title { font-size: 14px; font-weight: 700; color: #0A3D62; margin-bottom: 12px; }
      .ordo-pub-med { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px dashed #e8ecf0; }
      .ordo-pub-med:last-child { border-bottom: none; }
      .ordo-pub-med-num { width: 28px; height: 28px; background: #0A3D62; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
      .ordo-pub-med-name { font-weight: 600; color: #212529; font-size: 15px; }
      .ordo-pub-med-detail { font-size: 13px; color: #6c757d; margin-top: 2px; }
      .ordo-pub-instructions { font-size: 14px; color: #495057; line-height: 1.6; background: #f8f9fa; padding: 12px; border-radius: 8px; }
      .ordo-pub-empty { color: #6c757d; font-size: 14px; font-style: italic; }
      .ordo-pub-footer { padding: 20px 24px; display: flex; justify-content: space-between; align-items: flex-end; }
      .ordo-pub-sig-line { width: 160px; height: 1px; background: #0A3D62; margin-bottom: 6px; }
      .ordo-pub-sig-label { font-size: 12px; color: #6c757d; }
      .ordo-pub-print-btn { background: #0A3D62; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
      .ordo-pub-print-btn:hover { background: #1a5276; }
      @media print {
        .ordo-pub-wrap { padding: 0; background: white; }
        .ordo-pub-print-btn { display: none; }
        .ordo-pub-card { box-shadow: none; border-radius: 0; }
      }
      @media (max-width: 480px) {
        .ordo-pub-info-grid { grid-template-columns: 1fr; }
        .ordo-pub-header { flex-direction: column; gap: 12px; text-align: center; }
      }
    </style>
  `
})
export class OrdonnancePubliqueComponent implements OnInit {
  @Input() ordonnanceId: number = 0;
  ordo: any = null;
  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    if (!this.ordonnanceId) {
      this.loading = false;
      this.error = 'ID ordonnance manquant.';
      return;
    }
    this.api.ordonnancePublique(this.ordonnanceId).subscribe({
      next: o => { this.ordo = o; this.loading = false; },
      error: () => { this.error = 'Ordonnance introuvable ou invalide.'; this.loading = false; }
    });
  }

  imprimer() {
    window.print();
  }
}