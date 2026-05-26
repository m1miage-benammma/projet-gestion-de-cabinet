import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="dash-header">
      <button class="dash-header-menu" (click)="menuClick.emit()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div class="dash-header-title">
        <span style="display:flex;align-items:center;gap:6px;font-weight:700;color:var(--primary)">
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <path d="M11 2v18M2 11h18" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          MediNova
        </span>
      </div>
      <div class="dash-header-right">
        <button class="dash-header-btn" (click)="auth.toggleDarkMode()" title="Mode sombre">
          <svg *ngIf="!auth.darkMode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg *ngIf="auth.darkMode"  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
        </button>
        <div style="width:34px;height:34px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700">
          {{ auth.initiales() }}
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Input() activeTab = "";
  @Output() menuClick = new EventEmitter<void>();
  constructor(public auth: AuthService) {}
}