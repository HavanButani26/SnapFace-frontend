import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const homeRedirectGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Escape hatch for "View public site" -- a logged-in user explicitly
  // asked to preview the marketing site, so don't redirect them away.
  if (route.queryParamMap.get('preview') === '1') {
    return true;
  }

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Logged in -- WHERE to send them depends on role now that guest
  // accounts exist (this guard used to assume every logged-in user
  // was a photographer, since guests didn't have accounts yet).
  const role = authService.currentUser()?.role;
  if (role === 'guest') {
    router.navigate(['/guest/my-photos']);
  } else {
    router.navigate(['/dashboard']);
  }
  return false;
};
