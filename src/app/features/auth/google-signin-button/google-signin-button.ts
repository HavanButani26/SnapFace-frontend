import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { AuthService, User } from '../../../core/services/auth';
import { environment } from '../../../../environments/environment';

// Google's GSI script attaches `google` to the global window object;
// there's no official npm types package worth adding for this one call.
declare const google: any;

@Component({
  selector: 'sf-google-signin-button',
  standalone: true,
  template: `<div #googleBtn class="sf-google-btn-container"></div>`,
  styles: [
    `
      .sf-google-btn-container {
        width: 100%;
        display: flex;
        justify-content: center;
        overflow: hidden; /* safety net: never let the button visually spill past the card */
      }
      :host ::ng-deep iframe {
        width: 100% !important;
      }
    `,
  ],
})
export class GoogleSigninButton implements AfterViewInit, OnDestroy {
  @ViewChild('googleBtn', { static: true }) buttonRef!: ElementRef<HTMLDivElement>;

  /** Only used for brand-new users signing up (Register page). Ignored for existing accounts. */
  @Input() role?: string;

  @Output() success = new EventEmitter<User>();
  @Output() error = new EventEmitter<string>();

  private authService = inject(AuthService);
  private resizeObserver?: ResizeObserver;
  private lastRenderedWidth = 0;
  private initialized = false;

  ngAfterViewInit(): void {
    this.waitForGoogleScript(() => {
      this.initialized = true;
      this.renderButton();

      // Google's button has no built-in responsive mode — a fixed pixel
      // width is baked in at render time. Watch the container and
      // re-render whenever its available width actually changes
      // (e.g. window resize, orientation change, drawer open/close)
      // instead of using one hardcoded value that breaks on narrow
      // screens.
      this.resizeObserver = new ResizeObserver(() => this.renderButton());
      this.resizeObserver.observe(this.buttonRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private waitForGoogleScript(callback: () => void, attempts = 0): void {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      callback();
    } else if (attempts < 50) {
      setTimeout(() => this.waitForGoogleScript(callback, attempts + 1), 100);
    } else {
      this.error.emit('Google sign-in failed to load. Please refresh and try again.');
    }
  }

  private renderButton(): void {
    if (!this.initialized) return;

    const container = this.buttonRef.nativeElement;
    const available = Math.floor(container.offsetWidth);

    // Nothing meaningful to size against yet (e.g. display:none ancestor
    // mid-transition), or width barely changed — skip to avoid thrashing.
    if (available < 50 || Math.abs(available - this.lastRenderedWidth) < 4) {
      return;
    }
    this.lastRenderedWidth = available;

    // Google's renderButton width option only accepts a fixed pixel
    // number (no "100%"/auto), and caps out around 400px.
    const width = Math.min(400, available);

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => this.handleCredential(response.credential),
    });

    // Clear before re-rendering so repeated calls (on resize) don't stack
    // duplicate button elements inside the container.
    container.innerHTML = '';

    google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      width,
      text: 'continue_with',
    });
  }

  private handleCredential(idToken: string): void {
    this.authService.googleLogin(idToken, this.role).subscribe({
      next: (res) => this.success.emit(res.user),
      error: () => this.error.emit('Google sign-in failed. Please try again.'),
    });
  }
}
