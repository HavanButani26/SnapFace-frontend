import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthLayout } from '../auth-layout/auth-layout';
import { AuthService } from '../../../core/services/auth';

type VerifyState = 'loading' | 'success' | 'error';

@Component({
  selector: 'sf-verify-email',
  standalone: true,
  imports: [RouterLink, ButtonModule, AuthLayout],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
})
export class VerifyEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  state = signal<VerifyState>('loading');
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const uid = this.route.snapshot.paramMap.get('uid');
    const token = this.route.snapshot.paramMap.get('token');

    if (!uid || !token) {
      this.state.set('error');
      this.errorMessage.set('This verification link is invalid.');
      return;
    }

    this.authService.verifyEmail(uid, token).subscribe({
      next: () => {
        this.state.set('success');
        // Auto-redirect to login after a short pause so the user sees the confirmation
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.state.set('error');
        this.errorMessage.set(
          err?.error?.error ?? 'This verification link is invalid or has expired.',
        );
      },
    });
  }
}
