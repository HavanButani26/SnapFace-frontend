import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Preserve where the user was trying to go, so login/register can
  // send them back afterward instead of always landing on a default page.
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
