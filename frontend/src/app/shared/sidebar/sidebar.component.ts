import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AuthService } from "../../core/services/auth.service";
import { LangService } from "../../core/services/lang.service";
import { ThemeService } from "../../core/services/theme.service";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar-overlay" [class.visible]="open" (click)="closeOverlay.emit()"></div>
    <aside class="sidebar" [class.open]="open" [style.background]="getSidebarBg()">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <path d="M11 2v18M2 11h18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        MediNova
      </div>
      <nav class="sidebar-nav">
        <div *ngFor="let tab of tabs"
             class="sidebar-item"
             [class.active]="activeTab === tab.id"
             (click)="tabChange.emit(tab.id)">
          <div class="sidebar-item-ico">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 [innerHTML]="getIcon(tab.icon)"></svg>
          </div>
          {{ getTabLabel(tab) }}
          <span class="sidebar-notif-badge has-notif"
                *ngIf="tab.id==='notifications' && notifCount>0">{{ notifCount }}</span>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-avatar">{{ auth.initiales() }}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">{{ auth.user?.prenom }} {{ auth.user?.nom }}</div>
            <div class="sidebar-user-role">{{ formatRole(auth.user?.role) }}</div>
          </div>
          <div class="sidebar-logout" (click)="auth.logout()" title="Déconnexion">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() tabs: any[] = [];
  @Input() activeTab = "";
  @Input() color = "primary";
  @Input() open = false;
  @Input() notifCount = 0;
  @Output() tabChange = new EventEmitter<string>();
  @Output() closeOverlay = new EventEmitter<void>();

  constructor(public auth: AuthService, public lang: LangService, public theme: ThemeService) {}

  getSidebarBg(): string {
    const colors: any = {
      'medecin':    'linear-gradient(180deg, #0A3D62 0%, #1a5c8a 100%)',
      'infirmiere': 'linear-gradient(180deg, #6D28D9 0%, #7C3AED 100%)',
      'admin':      'linear-gradient(180deg, #991B1B 0%, #b91c1c 100%)',
      'patient':    this.theme.getPatientBg(),
    };
    return colors[this.color] || colors['medecin'];
  }

  getTabLabel(tab: any): string {
    const translations: any = {
      en: {
        'Accueil': 'Home', 'Rendez-vous': 'Appointments', 'Dossier médical': 'Medical Record',
        'Ordonnances': 'Prescriptions', 'Notifications': 'Notifications', 'Mon profil': 'My Profile',
        'Messages': 'Messages', 'Soins infirmiers': 'Nursing Care', 'Mon planning': 'My Schedule',
        'Consultation': 'Consultation', 'Dossiers patients': 'Patient Files', 'Disponibilités': 'Availability',
        "File d'attente": 'Waiting Queue', 'Tableau de bord': 'Dashboard', 'Utilisateurs': 'Users'
      },
      ar: {
        'Accueil': 'الرئيسية', 'Rendez-vous': 'المواعيد', 'Dossier médical': 'الملف الطبي',
        'Ordonnances': 'الوصفات', 'Notifications': 'الإشعارات', 'Mon profil': 'ملفي',
        'Messages': 'الرسائل', 'Soins infirmiers': 'الرعاية التمريضية', 'Mon planning': 'جدولي',
        'Consultation': 'الاستشارة', 'Dossiers patients': 'ملفات المرضى', 'Disponibilités': 'التوفر',
        "File d'attente": 'قائمة الانتظار', 'Tableau de bord': 'لوحة التحكم', 'Utilisateurs': 'المستخدمون'
      }
    };
    return translations[this.lang.currentLang]?.[tab.label] || tab.label;
  }

  getIcon(icon: string): string {
    const icons: any = {
      home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
      calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>',
      folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
      'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
      user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
      'message-circle': '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
      clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
      users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    };
    return icons[icon] || icons['home'];
  }

  formatRole(r: string): string {
    const m: any = { medecin: 'Médecin', infirmiere: 'Infirmière', patient: 'Patient', admin: 'Administrateur' };
    return m[r] || r || 'Utilisateur';
  }
}