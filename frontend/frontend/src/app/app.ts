import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MedecinComponent } from './pages/medecin/medecin.component';
import { PatientComponent } from './pages/patient/patient.component';
import { InfirmiereComponent } from './pages/infirmiere/infirmiere.component';
import { AdminComponent } from './pages/admin/admin.component';
import { HomeComponent } from './pages/home/home.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LoginComponent,
    RegisterComponent,
    MedecinComponent,
    PatientComponent,
    InfirmiereComponent,
    AdminComponent,
    HomeComponent,
  ],
  template: `
    <app-home       *ngIf="page==='home'"></app-home>
    <app-login      *ngIf="page==='login'"></app-login>
    <app-register   *ngIf="page==='register'"></app-register>
    <app-medecin    *ngIf="page==='medecin'"></app-medecin>
    <app-patient    *ngIf="page==='patient'"></app-patient>
    <app-infirmiere *ngIf="page==='infirmiere'"></app-infirmiere>
    <app-admin      *ngIf="page==='admin'"></app-admin>
  `,
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  page = 'home';

  constructor(private auth: AuthService) {}

  ngOnInit() {
    // Écouter les changements de page depuis AuthService
    this.auth.page$.subscribe(p => this.page = p);

    // Si déjà connecté → rediriger vers dashboard
    if (this.auth.isLoggedIn()) {
      this.auth.redirectToDashboard();
    }
  }
}