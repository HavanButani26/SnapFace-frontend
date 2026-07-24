import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { homeRedirectGuard } from './core/guards/home-redirect-guard';

export const routes: Routes = [
  {
    path: 'e/:slug',
    loadComponent: () =>
      import('./features/guest/guest-event/guest-event').then((m) => m.GuestEvent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout').then((m) => m.PublicLayout),
    children: [
      {
        path: '',
        canActivate: [homeRedirectGuard],
        loadComponent: () => import('./features/public/home/home').then((m) => m.Home),
      },
      {
        path: 'for-photographers',
        loadComponent: () =>
          import('./features/public/for-photographers/for-photographers').then(
            (m) => m.ForPhotographers,
          ),
      },
      {
        path: 'for-guests',
        loadComponent: () =>
          import('./features/public/for-guests/for-guests').then((m) => m.ForGuests),
      },
      {
        path: 'pricing',
        loadComponent: () => import('./features/public/pricing/pricing').then((m) => m.Pricing),
      },
    ],
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'verify-email/:uid/:token',
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email').then((m) => m.VerifyEmail),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'events',
        loadComponent: () => import('./features/dashboard/events/events').then((m) => m.Events),
      },
      {
        path: 'events/new',
        loadComponent: () =>
          import('./features/dashboard/events/event-form/event-form').then((m) => m.EventForm),
      },
      {
        path: 'events/:id',
        loadComponent: () =>
          import('./features/dashboard/events/event-detail/event-detail').then(
            (m) => m.EventDetail,
          ),
      },
      {
        path: 'events/:id/photos',
        loadComponent: () =>
          import('./features/dashboard/events/event-photos/event-photos').then(
            (m) => m.EventPhotos,
          ),
      },
      {
        path: 'events/:id/edit',
        loadComponent: () =>
          import('./features/dashboard/events/event-form/event-form').then((m) => m.EventForm),
      },
      {
        path: 'photos',
        loadComponent: () => import('./features/dashboard/photos/photos').then((m) => m.Photos),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/dashboard/analytics/analytics').then((m) => m.Analytics),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/dashboard/settings/settings').then((m) => m.Settings),
      },
      {
        path: 'settings/change-password',
        loadComponent: () =>
          import('./features/dashboard/settings/change-password/change-password').then(
            (m) => m.ChangePassword,
          ),
      },
      {
        path: 'settings/addons',
        loadComponent: () =>
          import('./features/dashboard/settings/addons/addons').then((m) => m.AddOns),
      },
    ],
  },
  {
    // Top-level sibling of 'dashboard', NOT nested inside it — this is
    // the fix. Real URL is now /guest/my-photos, matching what
    // login.ts/register.ts/guest-event.ts already expect.
    path: 'guest',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/guest-shell/guest-shell').then((m) => m.GuestShell),
    children: [
      {
        path: 'my-photos',
        loadComponent: () =>
          import('./features/guest/guest-my-photos/guest-my-photos').then(
            (m) => m.GuestMyPhotos,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/guest/guest-settings/guest-settings').then((m) => m.GuestSettings),
      },
      {
        path: 'settings/change-password',
        loadComponent: () =>
          import('./features/dashboard/settings/change-password/change-password').then(
            (m) => m.ChangePassword,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];