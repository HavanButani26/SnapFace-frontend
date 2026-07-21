import { Component, inject, signal, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GuestService, GuestEventInfo } from '../../../core/services/guest-event';
import { Photo } from '../../../core/services/photo';

type ViewState = 'loading' | 'password' | 'ready' | 'error';

@Component({
  selector: 'sf-guest-event',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './guest-event.html',
  styleUrl: './guest-event.scss',
})
export class GuestEvent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private guestService = inject(GuestService);

  slug = '';
  state = signal<ViewState>('loading');
  errorMessage = signal<string | null>(null);
  event = signal<GuestEventInfo | null>(null);
  guestToken = signal<string | null>(null);

  // Password gate
  passwordInput = signal('');
  passwordError = signal<string | null>(null);
  verifying = signal(false);

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

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';

    this.guestService.getEventInfo(this.slug).subscribe({
      next: (info) => {
        this.event.set(info);
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
  }

  clearSelfie(): void {
    if (this.selfiePreviewUrl()) URL.revokeObjectURL(this.selfiePreviewUrl()!);
    this.selfiePreviewUrl.set(null);
    this.selfieFile = null;
    this.searchDone.set(false);
    this.results.set([]);
    this.searchError.set(null);
  }

  // ------------------------------------------------------------------
  // Live camera capture path (works on both mobile and desktop, unlike
  // the file input's capture="user" hint which is mobile-only and
  // inconsistently supported)
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
  // Search
  // ------------------------------------------------------------------
  findMyPhotos(): void {
    if (!this.selfieFile) return;
    this.searching.set(true);
    this.searchError.set(null);

    this.guestService
      .searchSelfie(this.slug, this.selfieFile, this.guestToken() ?? undefined)
      .subscribe({
        next: (result) => {
          this.searching.set(false);
          this.searchDone.set(true);
          this.results.set(result.photos);
        },
        error: (err) => {
          this.searching.set(false);
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
  downloadingPhotoId = signal<number | null>(null);

  /**
   * The HTML `download` attribute is ignored by browsers for
   * cross-origin links (Cloudinary is a different origin from ours) —
   * that's exactly why clicking used to just open/navigate to the
   * image instead of downloading it. Fetching the bytes first and
   * downloading from a same-origin blob: URL fixes this properly.
   */
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
      // Fallback so the guest can still get the photo somehow (e.g. via
      // long-press/save) rather than nothing happening at all.
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
