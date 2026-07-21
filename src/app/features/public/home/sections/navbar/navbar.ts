import { Component, inject, signal, HostListener, OnDestroy } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ThemeService } from '../../../../../core/services/theme';
import { AuthService } from '../../../../../core/services/auth';

interface NavLink {
  label: string;
  path: string;
  fragment?: string; // present = in-page anchor scroll; absent = real routed page
}

@Component({
  selector: 'sf-navbar',
  standalone: true,
  imports: [RouterLink, ButtonModule, DrawerModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnDestroy {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private router = inject(Router);

  mobileMenuOpen = signal(false);
  isScrolled = signal(false);

  /** Current pathname (no fragment/query) — used to highlight route-based links. */
  currentPath = signal(this.router.url.split('#')[0].split('?')[0]);

  /** Which in-page section is currently scrolled into view, if on the home page. */
  activeFragment = signal<string | null>(null);

  private scrollSpyObserver?: IntersectionObserver;

  navLinks: NavLink[] = [
    { label: 'Features', path: '/', fragment: 'features' },
    { label: 'How It Works', path: '/', fragment: 'how-it-works' },
    { label: 'For Photographers', path: '/for-photographers' },
    { label: 'For Guests', path: '/for-guests' },
    { label: 'Pricing', path: '/pricing' },
  ];

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.currentPath.set(this.router.url.split('#')[0].split('?')[0]);
      this.setupScrollSpy();
    });
    // Cover the very first load too (NavigationEnd already fired before this constructor ran)
    this.setupScrollSpy();
  }

  ngOnDestroy(): void {
    this.scrollSpyObserver?.disconnect();
  }

  isLinkActive(link: NavLink): boolean {
    if (link.fragment) {
      return this.currentPath() === '/' && this.activeFragment() === link.fragment;
    }
    return this.currentPath() === link.path;
  }

  private setupScrollSpy(): void {
    this.scrollSpyObserver?.disconnect();

    if (this.currentPath() !== '/') {
      this.activeFragment.set(null);
      return;
    }

    // Home's sections render just after navigation completes — wait a tick.
    setTimeout(() => {
      const features = document.getElementById('features');
      const howItWorks = document.getElementById('how-it-works');
      if (!features || !howItWorks) return;

      this.scrollSpyObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.activeFragment.set(entry.target.id);
            }
          }
        },
        // Triggers when a section is within the upper ~30% of the viewport,
        // accounting for the sticky navbar's height.
        { rootMargin: '-96px 0px -65% 0px', threshold: 0 },
      );

      this.scrollSpyObserver.observe(features);
      this.scrollSpyObserver.observe(howItWorks);
    }, 50);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 8);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  toggleTheme() {
    this.themeService.toggle();
  }
}
