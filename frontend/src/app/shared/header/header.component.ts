import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../core/services/auth.service";
import { ApiService } from "../../core/services/api.service";

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

        <!-- Cloche notifications — masquée pour admin -->
        <div style="position:relative" *ngIf="auth.user?.role !== 'admin'">
          <button class="dash-header-btn" (click)="toggleNotifs()" title="Notifications" style="position:relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span *ngIf="unreadCount > 0" style="position:absolute;top:-4px;right:-4px;background:#e74c3c;color:white;border-radius:50%;width:16px;height:16px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;line-height:1">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </button>

          <div *ngIf="showNotifs" class="notif-dropdown">
            <div class="notif-dropdown-header">
              <span>Notifications</span>
              <span *ngIf="unreadCount > 0" style="font-size:12px;color:#e74c3c;font-weight:600">{{ unreadCount }} non lue(s)</span>
            </div>
            <div class="notif-dropdown-empty" *ngIf="notifications.length === 0">
              Aucune notification
            </div>
            <div *ngFor="let n of notifications.slice(0,5)"
                 class="notif-dropdown-item"
                 [class.notif-unread]="!n.lu"
                 (click)="marquerLue(n.id_notification)">
              <div class="notif-dot" *ngIf="!n.lu"></div>
              <div style="flex:1">
                <div class="notif-msg">{{ n.message }}</div>
                <div class="notif-time">{{ n.created_at | date:'dd/MM HH:mm' }}</div>
              </div>
            </div>
            <div class="notif-dropdown-footer" *ngIf="notifications.length > 5">
              {{ notifications.length - 5 }} autre(s) notification(s)
            </div>
          </div>
        </div>

        <button class="dash-header-btn" (click)="auth.toggleDarkMode()" title="Mode sombre">
          <svg *ngIf="!auth.darkMode" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg *ngIf="auth.darkMode"  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/></svg>
        </button>




        <div style="width:34px;height:34px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700">
          {{ auth.initiales() }}
        </div>
      </div>
    </header>

    <style>
      .notif-dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 320px;
        background: var(--card-bg, white);
        border: 1px solid var(--border, #e8ecf0);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        z-index: 9999;
        overflow: hidden;
      }
      .notif-dropdown-header {
        padding: 14px 16px;
        font-weight: 700;
        font-size: 14px;
        border-bottom: 1px solid var(--border, #e8ecf0);
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--text, #212529);
      }
      .notif-dropdown-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid var(--border, #f0f4f8);
        transition: background 0.15s;
      }
      .notif-dropdown-item:hover { background: var(--hover-bg, #f8f9fa); }
      .notif-unread { background: #eef4ff; }
      .notif-unread:hover { background: #ddeeff; }
      .notif-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #0A3D62;
        flex-shrink: 0;
        margin-top: 5px;
      }
      .notif-msg { font-size: 13px; color: var(--text, #212529); line-height: 1.4; }
      .notif-time { font-size: 11px; color: #6c757d; margin-top: 3px; }
      .notif-dropdown-empty { padding: 20px 16px; text-align: center; color: #6c757d; font-size: 13px; }
      .notif-dropdown-footer { padding: 10px 16px; text-align: center; font-size: 12px; color: #6c757d; background: var(--hover-bg, #f8f9fa); }
    </style>
  `
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() activeTab = "";
  @Output() menuClick = new EventEmitter<void>();

  notifications: any[] = [];
  unreadCount = 0;
  showNotifs = false;
  private interval: any;

  constructor(public auth: AuthService, private api: ApiService) {}

  changeTheme(id: string) {
    // Force re-render sidebar
    document.querySelectorAll('.sidebar').forEach((el: any) => {
      const colors: any = {
        blue:   'linear-gradient(180deg, #0A3D62 0%, #1a5c8a 100%)',
        green:  'linear-gradient(180deg, #166534 0%, #15803d 100%)',
        purple: 'linear-gradient(180deg, #6D28D9 0%, #7C3AED 100%)',
        red:    'linear-gradient(180deg, #991B1B 0%, #b91c1c 100%)',
        orange: 'linear-gradient(180deg, #92400E 0%, #b45309 100%)',
        teal:   'linear-gradient(180deg, #0f766e 0%, #0d9488 100%)',
      };
      el.style.background = colors[id] || colors['blue'];
    });
  }

  ngOnInit() {
    // Attendre que l'auth soit prête avant de charger
    setTimeout(() => this.chargerNotifications(), 500);
    this.interval = setInterval(() => this.chargerNotifications(), 30000);
    document.addEventListener('click', this.closeOnOutside);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    document.removeEventListener('click', this.closeOnOutside);
  }

  closeOnOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.dash-header-right')) {
      this.showNotifs = false;
    }
  };

  chargerNotifications() {
    const user = this.auth.user;
    const userId = this.auth.userId();
    if (!userId) return;
    this.api.getNotifications(userId).subscribe({
      next: (n: any[]) => {
        this.notifications = n;
        this.unreadCount = n.filter(x => !x.lu).length;
      },
      error: () => {}
    });
  }

  toggleNotifs() {
    this.showNotifs = !this.showNotifs;
    if (this.showNotifs) this.chargerNotifications();
  }

  marquerLue(id: number) {
    this.api.marquerLue(id).subscribe({
      next: () => this.chargerNotifications(),
      error: () => {}
    });
  }
}