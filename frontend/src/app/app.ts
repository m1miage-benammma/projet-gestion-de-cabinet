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
import { OrdonnancePubliqueComponent } from './pages/ordonnance-publique/ordonnance-publique.component';

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
    OrdonnancePubliqueComponent,
  ],
  template: `
    <app-ordonnance-publique *ngIf="page==='ordonnance'" [ordonnanceId]="ordonnanceId"></app-ordonnance-publique>
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
  ordonnanceId = 0;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    // Vérifier si URL contient ?ordonnance=ID (pour QR code scan)
    const params = new URLSearchParams(window.location.search);
    const ordId = params.get('ordonnance');
    if (ordId && !isNaN(+ordId)) {
      this.ordonnanceId = +ordId;
      this.page = 'ordonnance';
      return;
    }

    // Sinon comportement normal
    this.auth.page$.subscribe(p => this.page = p);
    if (this.auth.isLoggedIn()) {
      this.auth.redirectToDashboard();
    }
  }
}