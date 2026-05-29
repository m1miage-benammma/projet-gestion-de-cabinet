import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn) { router.navigate(['/login']); return false; }
  const role = route.data?.["role"];
  if (role && auth.user?.role !== role) { auth.redirectToDashboard(); return false; }
  return true;
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn) { auth.redirectToDashboard(); return false; }
  return true;
};
