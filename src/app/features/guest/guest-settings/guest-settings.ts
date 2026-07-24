import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ThemeService, ThemeMode } from '../../../core/services/theme';
import { ToastService } from '../../../core/services/toast';
import { AvatarPicker } from '../../../shared/avatar-picker/avatar-picker';

@Component({
  selector: 'sf-guest-settings',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AvatarPicker],
  template: `
    <div class="sf-guest-settings">
      <h1>Settings</h1>

      <section class="sf-card sf-guest-settings__section">
        <h2>Profile</h2>

        <div class="sf-guest-settings__avatar-row">
          <div class="sf-guest-settings__avatar">
            @if (authService.currentUser()?.profile_photo) {
              <img [src]="authService.currentUser()!.profile_photo" alt="Profile photo" />
            } @else {
              <span>{{ userInitials }}</span>
            }
          </div>
          <button
            type="button"
            class="sf-guest-settings__avatar-btn"
            (click)="avatarPickerOpen.set(true)"
          >
            Change Photo
          </button>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="sf-guest-settings__form">
          <div class="sf-form-field">
            <label>Username</label>
            <input type="text" formControlName="username" />
          </div>
          <div class="sf-form-field">
            <label>Mobile Number</label>
            <input type="text" formControlName="mobile" placeholder="Optional" />
          </div>
          <button type="submit" class="sf-guest-settings__save-btn" [disabled]="savingProfile()">
            {{ savingProfile() ? 'Saving...' : 'Save Profile' }}
          </button>
        </form>
      </section>

      <section class="sf-card sf-guest-settings__section">
        <h2>Security</h2>
        <a routerLink="/guest/settings/change-password" class="sf-guest-settings__option">
          <span>Change Password</span>
          <i class="pi pi-chevron-right"></i>
        </a>
      </section>

      <section class="sf-card sf-guest-settings__section">
        <h2>Appearance</h2>
        <div class="sf-guest-settings__theme-options">
          <button
            type="button"
            class="sf-guest-settings__theme-btn"
            [class.sf-guest-settings__theme-btn--active]="themeService.mode() === 'light'"
            (click)="setTheme('light')"
          >
            <i class="pi pi-sun"></i><span>Light</span>
          </button>
          <button
            type="button"
            class="sf-guest-settings__theme-btn"
            [class.sf-guest-settings__theme-btn--active]="themeService.mode() === 'dark'"
            (click)="setTheme('dark')"
          >
            <i class="pi pi-moon"></i><span>Dark</span>
          </button>
        </div>
      </section>

      @if (avatarPickerOpen()) {
        <sf-avatar-picker (close)="avatarPickerOpen.set(false)" />
      }
    </div>
  `,
  styleUrl: './guest-settings.scss',
})
export class GuestSettings {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private toastService = inject(ToastService);

  savingProfile = signal(false);
  avatarPickerOpen = signal(false);

  profileForm = this.fb.nonNullable.group({
    username: [
      this.authService.currentUser()?.username ?? '',
      [Validators.required, Validators.minLength(3)],
    ],
    mobile: [this.authService.currentUser()?.mobile ?? ''],
  });

  get userInitials(): string {
    const name = this.authService.currentUser()?.username ?? '';
    return name.slice(0, 2).toUpperCase();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.savingProfile.set(true);
    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.toastService.success('Profile updated.');
      },
      error: () => {
        this.savingProfile.set(false);
        this.toastService.error('Could not update profile.');
      },
    });
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
    this.authService.updateProfile({ theme_preference: mode }).subscribe();
  }
}
