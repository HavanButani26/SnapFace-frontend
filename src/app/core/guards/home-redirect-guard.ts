import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const homeRedirectGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Explicit escape hatch: "View public site" (from the dashboard's user
  // menu) links here with ?preview=1 so a logged-in user can intentionally
  // see the marketing homepage without losing their session — normal
  // visits to '/' (no query param) still redirect as before.
  const isPreview = route.queryParamMap.get('preview') === '1';

  if (authService.isLoggedIn() && !isPreview) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
