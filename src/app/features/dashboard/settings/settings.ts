import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/auth';
import { ThemeService, ThemeMode } from '../../../core/services/theme';
import { ToastService } from '../../../core/services/toast';
import { AvatarPicker } from '../../../shared/avatar-picker/avatar-picker';

@Component({
  selector: 'sf-settings',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, AvatarPicker],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private toastService = inject(ToastService);

  savingProfile = signal(false);
  avatarPickerOpen = signal(false);

  get userInitials(): string {
    const name = this.authService.currentUser()?.username ?? '';
    return name.slice(0, 2).toUpperCase();
  }

  profileForm = this.fb.nonNullable.group({
    username: [
      this.authService.currentUser()?.username ?? '',
      [Validators.required, Validators.minLength(3)],
    ],
    mobile: [this.authService.currentUser()?.mobile ?? ''],
  });

  get username() {
    return this.profileForm.controls.username;
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
        this.toastService.error('Could not update profile. Please try again.');
      },
    });
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setTheme(mode);
    this.authService.updateProfile({ theme_preference: mode }).subscribe();
  }
}
