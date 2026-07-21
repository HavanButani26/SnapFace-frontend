import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  email: string;
  username: string;
  role: 'photographer' | 'guest' | 'admin' | 'super_admin';
  mobile: string;
  profile_photo: string;
  is_email_verified: boolean;
  theme_preference: 'light' | 'dark' | '';
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  private currentUserSignal = signal<User | null>(this.loadUserFromStorage());
  currentUser = computed(() => this.currentUserSignal());
  isLoggedIn = computed(() => !!this.currentUserSignal());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem('sf_user');
    return raw ? JSON.parse(raw) : null;
  }

  register(data: {
    email: string;
    username: string;
    password: string;
    password2: string;
    role: string;
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/register/`, data);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login/`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  googleLogin(idToken: string, role?: string): Observable<AuthResponse> {
    const body: { id_token: string; role?: string } = { id_token: idToken };
    if (role) body.role = role;

    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/google/`, body)
      .pipe(tap((res) => this.setSession(res)));
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem('sf_access', res.access);
    localStorage.setItem('sf_refresh', res.refresh);
    localStorage.setItem('sf_user', JSON.stringify(res.user));
    this.currentUserSignal.set(res.user);
  }

  logout() {
    const refresh = localStorage.getItem('sf_refresh');
    if (refresh) {
      this.http.post(`${this.apiUrl}/auth/logout/`, { refresh }).subscribe({
        complete: () => this.clearSession(),
        error: () => this.clearSession(),
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession() {
    localStorage.removeItem('sf_access');
    localStorage.removeItem('sf_refresh');
    localStorage.removeItem('sf_user');
    this.currentUserSignal.set(null);
    this.router.navigate(['/']);
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = localStorage.getItem('sf_refresh');
    return this.http
      .post<{ access: string }>(`${this.apiUrl}/auth/login/refresh/`, { refresh })
      .pipe(tap((res) => localStorage.setItem('sf_access', res.access)));
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/forgot-password/`, { email });
  }

  resetPassword(uid: string, token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/reset-password/${uid}/${token}/`,
      { password },
    );
  }

  verifyEmail(uid: string, token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/auth/verify-email/${uid}/${token}/`,
      {},
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('sf_access');
  }

  updateProfile(
    data: Partial<Pick<User, 'username' | 'mobile' | 'theme_preference' | 'profile_photo'>>,
  ): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/auth/me/`, data).pipe(
      tap((updatedUser) => {
        const current = this.currentUserSignal();
        if (current) {
          const merged = { ...current, ...updatedUser };
          this.currentUserSignal.set(merged);
          localStorage.setItem('sf_user', JSON.stringify(merged));
        }
      }),
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/change-password/`, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  /** Same signed direct-to-Cloudinary pattern as event photos, scoped to this user's avatar folder. */
  getAvatarUploadSignature(): Observable<CloudinarySignature> {
    return this.http.post<CloudinarySignature>(`${this.apiUrl}/auth/avatar-upload-signature/`, {});
  }
}
