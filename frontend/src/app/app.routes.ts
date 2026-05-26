import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
  { path: 'patient', canActivate: [authGuard], data: {role:'patient'}, loadComponent: () => import('./pages/patient/patient.component').then(m => m.PatientComponent) },
  { path: 'medecin', canActivate: [authGuard], data: {role:'medecin'}, loadComponent: () => import('./pages/medecin/medecin.component').then(m => m.MedecinComponent) },
  { path: 'infirmiere', canActivate: [authGuard], data: {role:'infirmiere'}, loadComponent: () => import('./pages/infirmiere/infirmiere.component').then(m => m.InfirmiereComponent) },
  { path: 'admin', canActivate: [authGuard], data: {role:'admin'}, loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) },
  { path: '**', redirectTo: '' }
];
