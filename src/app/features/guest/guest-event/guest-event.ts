import { Component, inject, signal, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { GuestService, GuestEventInfo } from '../../../core/services/guest-event';
import { Photo } from '../../../core/services/photo';

type ViewState = 'loading' | 'needs-login' | 'password' | 'ready' | 'error';

@Component({
  selector: 'sf-guest-event',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './guest-event.html',
  styleUrl: './guest-event.scss',
})
export class GuestEvent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private guestService = inject(GuestService);

  slug = '';
  state = signal<ViewState>('loading');
  errorMessage = signal<string | null>(null);
  event = signal<GuestEventInfo | null>(null);
  guestToken = signal<string | null>(null);

  // Password gate (event-specific, independent of account login)
  passwordInput = signal('');
  passwordError = signal<string | null>(null);
  verifying = signal(false);

  // Biometric consent — shown only if the backend tells us this
  // account hasn't given it yet (checked once ever, not per-search).
  needsConsent = signal(false);
  consentChecked = signal(false);

  // Selfie + results
  selfiePreviewUrl = signal<string | null>(null);
  private selfieFile: File | null = null;
  searching = signal(false);
  searchDone = signal(false);
  results = signal<Photo[]>([]);
  searchError = signal<string | null>(null);

  // Live camera capture
  cameraActive = signal(false);
  cameraError = signal<string | null>(null);
  private mediaStream: MediaStream | null = null;

  @ViewChild('videoEl') set videoElRef(el: ElementRef<HTMLVideoElement> | undefined) {
    if (el && this.mediaStream) {
      el.nativeElement.srcObject = this.mediaStream;
    }
  }

  // Zip download
  downloadingZip = signal(false);
  downloadingPhotoId = signal<number | null>(null);

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';

    this.guestService.getEventInfo(this.slug).subscribe({
      next: (info) => {
        this.event.set(info);

        // Login is checked FIRST — shown as a deliberate landing state
        // with event context visible, not a blind involuntary redirect.
        if (!this.authService.isLoggedIn()) {
          this.state.set('needs-login');
          return;
        }

        this.proceedPastLogin(info);
      },
      error: () => {
        this.state.set('error');
        this.errorMessage.set('This event link is invalid or no longer available.');
      },
    });
  }

  ngOnDestroy(): void {
    this.stopCameraStream();
  }

  private proceedPastLogin(info: GuestEventInfo): void {
    if (info.is_password_protected) {
      const stored = this.guestService.getStoredToken(this.slug);
      if (stored) {
        this.guestToken.set(stored);
        this.state.set('ready');
      } else {
        this.state.set('password');
      }
    } else {
      this.state.set('ready');
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: `/e/${this.slug}` } });
  }

  goToRegister(): void {
    this.router.navigate(['/register'], { queryParams: { returnUrl: `/e/${this.slug}` } });
  }

  submitPassword(): void {
    if (!this.passwordInput()) return;
    this.verifying.set(true);
    this.passwordError.set(null);

    this.guestService.verifyPassword(this.slug, this.passwordInput()).subscribe({
      next: (res) => {
        this.verifying.set(false);
        this.guestToken.set(res.token);
        this.guestService.storeToken(this.slug, res.token);
        this.state.set('ready');
      },
      error: () => {
        this.verifying.set(false);
        this.passwordError.set('Incorrect password. Please try again.');
      },
    });
  }

  // ------------------------------------------------------------------
  // File upload path
  // ------------------------------------------------------------------
  onSelfieSelected(e: globalThis.Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.setSelfieFile(file);
  }

  private setSelfieFile(file: File): void {
    this.selfieFile = file;
    this.selfiePreviewUrl.set(URL.createObjectURL(file));
    this.searchDone.set(false);
    this.results.set([]);
    this.searchError.set(null);
    this.needsConsent.set(false);
  }

  clearSelfie(): void {
    if (this.selfiePreviewUrl()) URL.revokeObjectURL(this.selfiePreviewUrl()!);
    this.selfiePreviewUrl.set(null);
    this.selfieFile = null;
    this.searchDone.set(false);
    this.results.set([]);
    this.searchError.set(null);
    this.needsConsent.set(false);
  }

  // ------------------------------------------------------------------
  // Live camera capture path
  // ------------------------------------------------------------------
  async openCamera(): Promise<void> {
    this.cameraError.set(null);
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      this.cameraActive.set(true);
    } catch {
      this.cameraError.set(
        'Could not access your camera. Please check permissions, or upload a photo instead.',
      );
    }
  }

  private stopCameraStream(): void {
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = null;
  }

  closeCamera(): void {
    this.stopCameraStream();
    this.cameraActive.set(false);
  }

  capturePhoto(videoElement: HTMLVideoElement): void {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoElement, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        this.setSelfieFile(file);
        this.closeCamera();
      },
      'image/jpeg',
      0.92,
    );
  }

  // ------------------------------------------------------------------
  // Search — handles the consent_required response specially
  // ------------------------------------------------------------------
  findMyPhotos(): void {
    if (!this.selfieFile) return;
    this.runSearch(this.consentChecked());
  }

  confirmConsentAndSearch(): void {
    this.consentChecked.set(true);
    this.needsConsent.set(false);
    this.runSearch(true);
  }

  private runSearch(consent: boolean): void {
    if (!this.selfieFile) return;
    this.searching.set(true);
    this.searchError.set(null);

    this.guestService
      .searchSelfie(this.slug, this.selfieFile, consent, this.guestToken() ?? undefined)
      .subscribe({
        next: (result) => {
          this.searching.set(false);
          this.searchDone.set(true);
          this.results.set(result.photos);
        },
        error: (err) => {
          this.searching.set(false);

          if (err?.error?.error === 'consent_required') {
            this.needsConsent.set(true);
            return;
          }

          this.searchDone.set(true);
          this.searchError.set(
            err?.error?.error ?? 'Something went wrong while searching. Please try again.',
          );
        },
      });
  }

  // ------------------------------------------------------------------
  // Downloads
  // ------------------------------------------------------------------
  async downloadOne(photo: Photo): Promise<void> {
    this.downloadingPhotoId.set(photo.id);
    try {
      const response = await fetch(photo.image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = photo.original_filename || `photo_${photo.id}.jpg`;
      link.click();

      URL.revokeObjectURL(url);
    } catch {
      window.open(photo.image_url, '_blank');
    } finally {
      this.downloadingPhotoId.set(null);
    }
  }

  downloadAll(): void {
    const photoIds = this.results().map((p) => p.id);
    if (photoIds.length === 0 || this.downloadingZip()) return;

    this.downloadingZip.set(true);

    this.guestService.downloadZip(this.slug, photoIds, this.guestToken() ?? undefined).subscribe({
      next: (blob) => {
        this.downloadingZip.set(false);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.event()?.name || 'event'}-photos.zip`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        this.downloadingZip.set(false);
        this.searchError.set('Could not create the download. Please try again.');
      },
    });
  }
}
