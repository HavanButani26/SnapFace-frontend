import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { AuthLayout } from '../auth-layout/auth-layout';
import { GoogleSigninButton } from '../google-signin-button/google-signin-button';
import { AuthService, User } from '../../../core/services/auth';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const password2 = control.get('password2')?.value;
  return password && password2 && password !== password2 ? { mismatch: true } : null;
}

@Component({
  selector: 'sf-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    MessageModule,
    AuthLayout,
    GoogleSigninButton,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Register is photographer-only — guests never self-register here.
  private readonly fixedRole = 'photographer';

  form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password2: ['', [Validators.required]],
      agreeTerms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordsMatch },
  );

  get username() {
    return this.form.controls.username;
  }
  get email() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }
  get password2() {
    return this.form.controls.password2;
  }
  get agreeTerms() {
    return this.form.controls.agreeTerms;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { username, email, password, password2 } = this.form.getRawValue();

    this.authService
      .register({
        email,
        username,
        password,
        password2,
        role: this.fixedRole,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set(
            'Account created! Check your email to verify your account before logging in.',
          );
          this.form.reset({ agreeTerms: false });
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(this.extractError(err));
        },
      });
  }

  private extractError(err: unknown): string {
    const data = (err as { error?: unknown })?.error;
    if (!data) return 'Something went wrong. Please try again.';
    if (typeof data === 'string') return data;
    const record = data as Record<string, unknown>;
    const firstKey = Object.keys(record)[0];
    const firstVal = record[firstKey];
    return Array.isArray(firstVal) ? String(firstVal[0]) : String(firstVal);
  }

  onGoogleSuccess(_user: User): void {
    this.router.navigate(['/dashboard']);
  }

  onGoogleError(message: string): void {
    this.errorMessage.set(message);
  }
}
