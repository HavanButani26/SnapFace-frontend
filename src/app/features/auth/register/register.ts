import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private route = inject(ActivatedRoute);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  registered = signal(false);
  selectedRole = signal<'photographer' | 'guest'>('photographer');

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

  setRole(role: 'photographer' | 'guest'): void {
    this.selectedRole.set(role);
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
        username,
        email,
        password,
        password2,
        role: this.selectedRole(),
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          // Email verification is still required after registration —
          // the returnUrl (if present) carries through automatically,
          // since it stays in the URL and LOGIN reads it after they
          // verify and log in for the first time.
          this.registered.set(true);
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

  onGoogleSuccess(user: User): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else if (user.role === 'guest') {
      this.router.navigate(['/guest/my-photos']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onGoogleError(message: string): void {
    this.errorMessage.set(message);
  }
}
