import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
    <div style="min-height:100vh;background:linear-gradient(135deg,#0A3D62,#1a5c8a);display:flex;align-items:center;justify-content:center;font-family:'Segoe UI',sans-serif">
      <div style="text-align:center;color:white;padding:40px">
        <div style="font-size:120px;font-weight:900;line-height:1;opacity:.15">404</div>
        <div style="font-size:80px;margin:-40px 0 20px">🏥</div>
        <h1 style="font-size:32px;font-weight:900;margin-bottom:12px">Page introuvable</h1>
        <p style="font-size:16px;opacity:.8;margin-bottom:32px">Cette page n'existe pas ou a été déplacée</p>
        <button (click)="auth.navigate('home')"
                style="background:white;color:#0A3D62;border:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:800;cursor:pointer;transition:all .2s"
                onmouseenter="this.style.transform='translateY(-2px)'"
                onmouseleave="this.style.transform='translateY(0)'">
          🏠 Retour à l'accueil
        </button>
      </div>
    </div>
  `
})
export class NotFoundComponent {
  constructor(public auth: AuthService) {}
}