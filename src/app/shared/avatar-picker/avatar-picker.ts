import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { AuthService } from '../../core/services/auth';
import { PhotoService } from '../../core/services/photo';
import { ToastService } from '../../core/services/toast';

type TabName = 'avatars' | 'upload';

@Component({
  selector: 'sf-avatar-picker',
  standalone: true,
  imports: [ImageCropperComponent],
  template: `
    <div class="sf-avatar-picker__backdrop" (click)="close.emit()"></div>

    <div class="sf-avatar-picker" role="dialog" aria-modal="true">
      <div class="sf-avatar-picker__header">
        <h3>Change Profile Photo</h3>
        <button
          type="button"
          class="sf-avatar-picker__close"
          (click)="close.emit()"
          aria-label="Close"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="sf-avatar-picker__tabs">
        <button
          type="button"
          class="sf-avatar-picker__tab"
          [class.sf-avatar-picker__tab--active]="activeTab() === 'avatars'"
          (click)="setTab('avatars')"
        >
          Choose Avatar
        </button>
        <button
          type="button"
          class="sf-avatar-picker__tab"
          [class.sf-avatar-picker__tab--active]="activeTab() === 'upload'"
          (click)="setTab('upload')"
        >
          Upload Photo
        </button>
      </div>

      <div class="sf-avatar-picker__body">
        @if (activeTab() === 'avatars') {
          <div class="sf-avatar-picker__grid">
            @for (url of presetAvatars; track url) {
              <button
                type="button"
                class="sf-avatar-picker__preset"
                [disabled]="saving()"
                (click)="selectPreset(url)"
              >
                <img [src]="url" alt="Avatar option" />
              </button>
            }
          </div>
        }

        @if (activeTab() === 'upload') {
          @if (!imageChangedEvent) {
            <label class="sf-avatar-picker__upload-zone">
              <i class="pi pi-image"></i>
              <span>Click to choose a photo</span>
              <input type="file" accept="image/*" (change)="onFileSelected($event)" />
            </label>
          } @else {
            <div class="sf-avatar-picker__crop-wrap">
              <image-cropper
                [imageChangedEvent]="imageChangedEvent"
                [maintainAspectRatio]="true"
                [aspectRatio]="1"
                [roundCropper]="true"
                format="jpeg"
                (imageCropped)="onImageCropped($event)"
              ></image-cropper>
            </div>
            <p class="sf-avatar-picker__crop-hint">Drag to reposition, scroll or pinch to zoom.</p>
            <div class="sf-avatar-picker__actions">
              <button
                type="button"
                class="sf-avatar-picker__btn-outline"
                [disabled]="saving()"
                (click)="cancelCrop()"
              >
                Choose Different Photo
              </button>
              <button
                type="button"
                class="sf-avatar-picker__btn"
                [disabled]="saving()"
                (click)="confirmCrop()"
              >
                {{ saving() ? 'Saving...' : 'Save Photo' }}
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
  styleUrl: './avatar-picker.scss',
})
export class AvatarPicker {
  @Output() close = new EventEmitter<void>();

  private authService = inject(AuthService);
  private photoService = inject(PhotoService);
  private toastService = inject(ToastService);

  activeTab = signal<TabName>('avatars');
  saving = signal(false);

  imageChangedEvent: Event | null = null;
  private croppedBlob: Blob | null = null;

  presetAvatars: string[] = [
    'Felix',
    'Aneka',
    'Bailey',
    'Cleo',
    'Duke',
    'Willow',
    'Milo',
    'Nova',
    'Oscar',
    'Ruby',
  ].map((seed) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`);

  setTab(tab: TabName): void {
    this.activeTab.set(tab);
  }

  selectPreset(url: string): void {
    this.saving.set(true);
    // Explicitly clear profile_photo_key — otherwise a previously
    // uploaded photo's key would still take priority in the backend's
    // resolution logic, and this new preset would never actually show.
    this.authService.updateProfile({ profile_photo: url, profile_photo_key: '' }).subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success('Profile photo updated.');
        this.close.emit();
      },
      error: () => {
        this.saving.set(false);
        this.toastService.error('Could not update profile photo.');
      },
    });
  }

  onFileSelected(event: Event): void {
    this.imageChangedEvent = event;
  }

  /** Fires continuously as the user drags/zooms — we just keep the
   *  latest cropped result in memory until they confirm. */
  onImageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.croppedBlob = event.blob;
    }
  }

  cancelCrop(): void {
    this.imageChangedEvent = null;
    this.croppedBlob = null;
  }

  confirmCrop(): void {
    if (!this.croppedBlob) {
      this.toastService.error('Please wait a moment for the image to finish loading.');
      return;
    }

    this.saving.set(true);
    const file = new File([this.croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
    this.uploadAndSave(file);
  }

  private uploadAndSave(file: File): void {
    this.authService.getAvatarUploadUrl(file.type || 'image/jpeg').subscribe({
      next: (result) => {
        this.photoService
          .uploadDirectToR2(file, result.upload_url, () => {})
          .then(() => {
            this.authService
              .updateProfile({ profile_photo: '', profile_photo_key: result.object_key })
              .subscribe({
                next: () => {
                  this.saving.set(false);
                  this.toastService.success('Profile photo updated.');
                  this.close.emit();
                },
                error: () => {
                  this.saving.set(false);
                  this.toastService.error('Could not save your new photo.');
                },
              });
          })
          .catch(() => {
            this.saving.set(false);
            this.toastService.error('Upload failed. Please try again.');
          });
      },
      error: () => {
        this.saving.set(false);
        this.toastService.error('Could not start the upload.');
      },
    });
  }
}
