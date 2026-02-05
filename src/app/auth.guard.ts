// auth.guard.ts (para rutas que requieren cualquier usuario logueado)
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from './core/services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/validate'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  return true;
};