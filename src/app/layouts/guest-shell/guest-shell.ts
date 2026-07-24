import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeService } from '../../core/services/theme';
import { AuthService } from '../../core/services/auth';
import { ConfirmService } from '../../core/services/confirm';
import { ToastService } from '../../core/services/toast';
import { NotificationBell } from '../../shared/notification-bell/notification-bell';

@Component({
  selector: 'sf-guest-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NotificationBell],
  template: `
    <div class="sf-guest-shell">
      <aside class="sf-guest-shell__sidebar">
        <a routerLink="/guest/my-photos" class="sf-guest-shell__brand">
          <span class="sf-guest-shell__brand-text">SnapFace</span>
        </a>

        <nav class="sf-guest-shell__nav">
          <a
            routerLink="/guest/my-photos"
            class="sf-guest-shell__nav-link"
            [class.sf-guest-shell__nav-link--active]="isActive('/guest/my-photos')"
          >
            <i class="pi pi-images"></i>
            <span>My Photos</span>
          </a>
          <a
            routerLink="/guest/settings"
            class="sf-guest-shell__nav-link"
            [class.sf-guest-shell__nav-link--active]="isActive('/guest/settings')"
          >
            <i class="pi pi-cog"></i>
            <span>Settings</span>
          </a>
        </nav>

        <button type="button" class="sf-guest-shell__theme-toggle" (click)="toggleTheme()">
          <i
            class="pi"
            [class.pi-sun]="themeService.mode() === 'dark'"
            [class.pi-moon]="themeService.mode() === 'light'"
          ></i>
          <span>{{ themeService.mode() === 'dark' ? 'Light mode' : 'Dark mode' }}</span>
        </button>
      </aside>

      <div class="sf-guest-shell__main">
        <header class="sf-guest-shell__topbar">
          <button
            type="button"
            class="sf-guest-shell__hamburger"
            (click)="mobileSidebarOpen.set(!mobileSidebarOpen())"
            aria-label="Menu"
          >
            <i class="pi pi-bars"></i>
          </button>
          <span class="sf-guest-shell__spacer"></span>

          <sf-notification-bell />

          <div class="sf-guest-shell__user-dropdown">
            <button
              type="button"
              class="sf-guest-shell__user-btn"
              (click)="userMenuOpen.set(!userMenuOpen())"
            >
              <span class="sf-guest-shell__avatar">
                @if (authService.currentUser()?.profile_photo) {
                  <img [src]="authService.currentUser()!.profile_photo" alt="" />
                } @else {
                  {{ userInitials }}
                }
              </span>
              <span class="sf-guest-shell__username">{{
                authService.currentUser()?.username
              }}</span>
              <i class="pi pi-chevron-down"></i>
            </button>

            @if (userMenuOpen()) {
              <div class="sf-guest-shell__user-panel">
                <a
                  routerLink="/guest/settings"
                  class="sf-guest-shell__user-item"
                  (click)="userMenuOpen.set(false)"
                >
                  <i class="pi pi-cog"></i><span>Settings</span>
                </a>
                <button
                  type="button"
                  class="sf-guest-shell__user-item sf-guest-shell__user-item--danger"
                  (click)="confirmLogout()"
                >
                  <i class="pi pi-sign-out"></i><span>Log out</span>
                </button>
              </div>
            }
          </div>
        </header>

        <main class="sf-guest-shell__content">
          <router-outlet />
        </main>
      </div>

      @if (mobileSidebarOpen()) {
        <div class="sf-guest-shell__mobile-nav">
          <a
            routerLink="/guest/my-photos"
            [class.sf-guest-shell__nav-link--active]="isActive('/guest/my-photos')"
            (click)="mobileSidebarOpen.set(false)"
            ><i class="pi pi-images"></i><span>My Photos</span></a
          >
          <a
            routerLink="/guest/settings"
            [class.sf-guest-shell__nav-link--active]="isActive('/guest/settings')"
            (click)="mobileSidebarOpen.set(false)"
            ><i class="pi pi-cog"></i><span>Settings</span></a
          >
        </div>
      }

      @if (userMenuOpen()) {
        <div class="sf-dropdown-backdrop" (click)="userMenuOpen.set(false)"></div>
      }
    </div>
  `,
  styleUrl: './guest-shell.scss',
})
export class GuestShell {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  mobileSidebarOpen = signal(false);
  userMenuOpen = signal(false);
  currentPath = signal(this.router.url.split('?')[0]);

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.currentPath.set(this.router.url.split('?')[0]);
      this.mobileSidebarOpen.set(false);
      this.userMenuOpen.set(false);
    });
  }

  isActive(path: string): boolean {
    return this.currentPath().startsWith(path);
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  confirmLogout(): void {
    this.userMenuOpen.set(false);
    this.confirmService.ask({
      title: 'Log out?',
      message: 'You\u2019ll need to log in again to access your photos.',
      confirmLabel: 'Log out',
      danger: true,
      onConfirm: () => {
        this.authService.logout();
        this.toastService.success('You\u2019ve been logged out.');
      },
    });
  }

  get userInitials(): string {
    const name = this.authService.currentUser()?.username ?? '';
    return name.slice(0, 2).toUpperCase();
  }
}
