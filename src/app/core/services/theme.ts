import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'sf_theme';
  mode = signal<ThemeMode>(this.resolveInitialTheme());

  constructor() {
    effect(() => this.applyTheme(this.mode()));

    // Live-follow OS changes only if user hasn't explicitly chosen (no logged-in override, no manual pick stored)
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          this.mode.set(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  private resolveInitialTheme(): ThemeMode {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(mode: ThemeMode) {
    const html = document.documentElement;
    html.classList.toggle('snapface-dark', mode === 'dark');
  }

  /** Manual toggle from UI (persists as an explicit user choice) */
  setTheme(mode: ThemeMode) {
    this.mode.set(mode);
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  toggle() {
    this.setTheme(this.mode() === 'dark' ? 'light' : 'dark');
  }

  /** Called after login once we fetch the user's saved preference from the backend */
  applyUserPreference(mode: ThemeMode) {
    this.mode.set(mode);
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  /** Called on logout so the next visitor gets device-based detection again */
  resetToDevicePreference() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.mode.set(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
}
