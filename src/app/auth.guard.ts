// auth.guard.ts (para rutas que requieren cualquier usuario logueado)
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from './core/services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Verificar Mesa
  if (!authService.currentMesa()){
    authService.errorMesa.set('No tienes una mesa asignada. Por favor, vuelva a scanear el QR de la mesa.');
    router.navigate(['/validate/1'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  // Verificar Usuario
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }


  return true;
};