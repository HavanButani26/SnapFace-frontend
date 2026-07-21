import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { DrawerModule } from 'primeng/drawer';
import { ThemeService } from '../../core/services/theme';
import { AuthService } from '../../core/services/auth';
import { ConfirmService } from '../../core/services/confirm';
import { ToastService } from '../../core/services/toast';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface UserMenuAction {
  label: string;
  icon: string;
  action: () => void;
}

@Component({
  selector: 'sf-app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, DrawerModule],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private router = inject(Router);
  private confirmService = inject(ConfirmService);
  private toastService = inject(ToastService);

  mobileSidebarOpen = signal(false);
  userMenuOpen = signal(false);
  currentPath = signal(this.router.url.split('?')[0]);

  navItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: 'pi-home' },
    { label: 'Events', path: '/dashboard/events', icon: 'pi-calendar' },
    { label: 'Photos', path: '/dashboard/photos', icon: 'pi-images' },
    { label: 'Analytics', path: '/dashboard/analytics', icon: 'pi-chart-bar' },
    { label: 'Settings', path: '/dashboard/settings', icon: 'pi-cog' },
  ];

  userMenuActions: UserMenuAction[] = [
    {
      label: 'Settings',
      icon: 'pi-cog',
      action: () => this.router.navigate(['/dashboard/settings']),
    },
    {
      label: 'View public site',
      icon: 'pi-external-link',
      action: () => window.open('/?preview=1', '_blank'),
    },
    { label: 'Log out', icon: 'pi-sign-out', action: () => this.confirmLogout() },
  ];

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.currentPath.set(this.router.url.split('?')[0]);
      this.mobileSidebarOpen.set(false);
      this.userMenuOpen.set(false);
    });
  }

  isActive(item: NavItem): boolean {
    if (item.path === '/dashboard') {
      return this.currentPath() === '/dashboard';
    }
    return this.currentPath().startsWith(item.path);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.set(!this.mobileSidebarOpen());
  }

  toggleUserMenu(): void {
    this.userMenuOpen.set(!this.userMenuOpen());
  }

  runUserMenuAction(item: UserMenuAction): void {
    this.userMenuOpen.set(false);
    item.action();
  }

  private confirmLogout(): void {
    this.confirmService.ask({
      title: 'Log out?',
      message: 'You\u2019ll need to log in again to access your dashboard.',
      confirmLabel: 'Log out',
      danger: true,
      onConfirm: () => {
        this.authService.logout();
        this.toastService.success('You\u2019ve been logged out.');
      },
    });
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  get userInitials(): string {
    const name = this.authService.currentUser()?.username ?? '';
    return name.slice(0, 2).toUpperCase();
  }
}
