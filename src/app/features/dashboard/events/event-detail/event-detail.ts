import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import * as QRCode from 'qrcode';
import { EventService, Event as AppEvent } from '../../../../core/services/event';
import { PhotoService, Photo } from '../../../../core/services/photo';
import { ToastService } from '../../../../core/services/toast';
import { SubscriptionService, UsageSnapshot } from '../../../../core/services/subscription';

interface StagedFile {
  id: number;
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'sf-event-detail',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink, ButtonModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private photoService = inject(PhotoService);
  private toastService = inject(ToastService);
  private subscriptionService = inject(SubscriptionService);

  usage = signal<UsageSnapshot | null>(null);

  // Total size of currently-staged (not-yet-uploaded) files, using the
  // SAME estimation multiplier as the backend (original + optimized +
  // thumbnail), so this preview agrees with what will actually be
  // enforced server-side.
  stagedTotalBytes = computed(
    () =>
      this.stagedFiles().reduce((sum, s) => sum + s.file.size, 0) *
      SubscriptionService.STORAGE_ESTIMATE_MULTIPLIER,
  );

  remainingStorageBytes = computed(() => {
    const u = this.usage();
    if (!u) return null;
    const limitBytes = u.storage.limit * 1024 * 1024 * 1024;
    const usedBytes = u.storage.used * 1024 * 1024 * 1024;
    return limitBytes - usedBytes;
  });

  wouldExceedStorage = computed(() => {
    const remaining = this.remainingStorageBytes();
    if (remaining === null) return false;
    return this.stagedTotalBytes() > remaining;
  });

  event = signal<AppEvent | null>(null);
  photos = signal<Photo[]>([]);
  previewPhotos = computed(() => this.photos().slice(0, 8));
  loading = signal(true);
  qrDataUrl = signal<string | null>(null);
  isDragging = signal(false);

  // Files selected/dropped but not yet uploaded — reviewable, removable.
  stagedFiles = signal<StagedFile[]>([]);

  // Custom lightbox state (index into stagedFiles, not the browser's
  // native image viewer or any native dialog).
  lightboxIndex = signal<number | null>(null);

  // Compact upload progress — a count, not a per-file list.
  uploading = signal(false);
  uploadTotal = signal(0);
  uploadCompleted = signal(0);
  uploadPercent = computed(() =>
    this.uploadTotal() === 0 ? 0 : Math.round((100 * this.uploadCompleted()) / this.uploadTotal()),
  );

  private nextStagedId = 0;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.eventService.get(id).subscribe({
      next: (event) => {
        this.event.set(event);
        this.loading.set(false);
        this.generateQrCode(event.guest_link);
      },
      error: () => this.loading.set(false),
    });

    this.photoService.list(id).subscribe({
      next: (photos) => {
        this.photos.set(photos);
        this.maybeStartPolling();
      },
    });

    this.fetchUsage();
  }

  private fetchUsage(): void {
    this.subscriptionService.getMyUsage().subscribe({
      next: (usage) => this.usage.set(usage),
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // ------------------------------------------------------------------
  // Realtime-ish status updates via lightweight polling — no
  // WebSocket/Channels infrastructure needed. Only runs while at least
  // one photo is still being processed by the Celery/InsightFace
  // pipeline, and stops itself automatically once everything settles.
  // ------------------------------------------------------------------
  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private readonly pollIntervalMs = 4000;

  private hasPendingPhotos(): boolean {
    return this.photos().some(
      (p) => p.status === 'uploaded' || p.status === 'queued' || p.status === 'processing',
    );
  }

  private maybeStartPolling(): void {
    if (this.pollHandle || !this.hasPendingPhotos()) return;

    const eventId = this.event()?.id;
    if (!eventId) return;

    this.pollHandle = setInterval(() => {
      this.photoService.list(eventId).subscribe({
        next: (photos) => {
          this.photos.set(photos);
          if (!this.hasPendingPhotos()) {
            this.stopPolling();
          }
        },
      });
    }, this.pollIntervalMs);
  }

  private stopPolling(): void {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  private generateQrCode(link: string): void {
    QRCode.toDataURL(link, { width: 220, margin: 1 })
      .then((dataUrl) => this.qrDataUrl.set(dataUrl))
      .catch(() => this.qrDataUrl.set(null));
  }

  copyGuestLink(): void {
    const link = this.event()?.guest_link;
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      this.toastService.success('Guest link copied to clipboard.');
    });
  }

  // ------------------------------------------------------------------
  // Selecting files — adds to the staging area, does NOT upload yet.
  // ------------------------------------------------------------------
  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(false);
    const files = e.dataTransfer?.files;
    if (files) this.stageFiles(files);
  }

  onFileInputChange(e: globalThis.Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) this.stageFiles(input.files);
    input.value = '';
  }

  // No limit on file COUNT or total upload size — only a per-file cap,
  // since Cloudinary/browser memory considerations apply to individual
  // files, not the batch as a whole.
  private readonly maxFileSizeBytes = 50 * 1024 * 1024; // 50MB

  private stageFiles(fileList: FileList): void {
    const incoming = Array.from(fileList).filter((f) => f.type.startsWith('image/'));

    const tooLarge = incoming.filter((f) => f.size > this.maxFileSizeBytes);
    const accepted = incoming.filter((f) => f.size <= this.maxFileSizeBytes);

    if (tooLarge.length === 1) {
      this.toastService.error(`${tooLarge[0].name} exceeds the 50MB limit and was skipped.`);
    } else if (tooLarge.length > 1) {
      this.toastService.error(`${tooLarge.length} files exceed the 50MB limit and were skipped.`);
    }

    const newItems: StagedFile[] = accepted.map((file) => ({
      id: this.nextStagedId++,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    this.stagedFiles.update((list) => [...list, ...newItems]);
  }

  /** Removing a staged (not-yet-uploaded) file is fully reversible — no
   *  confirmation needed, native or custom; nothing has happened yet. */
  removeStagedFile(id: number): void {
    const item = this.stagedFiles().find((s) => s.id === id);
    if (item) URL.revokeObjectURL(item.previewUrl);
    this.stagedFiles.update((list) => list.filter((s) => s.id !== id));

    // Keep the lightbox in a valid state if the removed file was showing
    // or shifted the array.
    const idx = this.lightboxIndex();
    if (idx !== null) {
      if (this.stagedFiles().length === 0) {
        this.lightboxIndex.set(null);
      } else if (idx >= this.stagedFiles().length) {
        this.lightboxIndex.set(this.stagedFiles().length - 1);
      }
    }
  }

  clearAllStaged(): void {
    this.stagedFiles().forEach((s) => URL.revokeObjectURL(s.previewUrl));
    this.stagedFiles.set([]);
    this.lightboxIndex.set(null);
  }

  // ------------------------------------------------------------------
  // Custom lightbox (staged files only, for reviewing before upload)
  // ------------------------------------------------------------------
  openLightbox(index: number): void {
    this.lightboxIndex.set(index);
  }

  closeLightbox(): void {
    this.lightboxIndex.set(null);
  }

  nextLightboxImage(): void {
    const idx = this.lightboxIndex();
    if (idx === null) return;
    this.lightboxIndex.set((idx + 1) % this.stagedFiles().length);
  }

  prevLightboxImage(): void {
    const idx = this.lightboxIndex();
    if (idx === null) return;
    this.lightboxIndex.set((idx - 1 + this.stagedFiles().length) % this.stagedFiles().length);
  }

  removeCurrentLightboxImage(): void {
    const idx = this.lightboxIndex();
    if (idx === null) return;
    this.removeStagedFile(this.stagedFiles()[idx].id);
  }

  // ------------------------------------------------------------------
  // Actual upload — triggered explicitly by the "Upload" button
  // ------------------------------------------------------------------
  startUpload(): void {
    const ev = this.event();
    const files = this.stagedFiles();
    if (!ev || files.length === 0) return;

    if (this.wouldExceedStorage()) {
      this.toastService.error(
        'This upload would exceed your storage limit. Upgrade your plan or add storage to continue.',
      );
      return;
    }

    this.uploading.set(true);
    this.uploadTotal.set(files.length);
    this.uploadCompleted.set(0);

    files.forEach((staged) => this.uploadOne(ev.id, staged));
  }

  private uploadOne(eventId: number, staged: StagedFile): void {
    this.photoService.getUploadSignature(eventId, staged.file.size).subscribe({
      next: (sig) => {
        this.photoService
          .uploadDirectToCloudinary(staged.file, sig, () => {
            // Individual byte-progress isn't surfaced in the compact
            // summary UI — only completed-file count is shown, per
            // request. (Kept as a no-op hook if we want it back later.)
          })
          .then((result) => {
            this.photoService.saveMetadata(eventId, result).subscribe({
              next: (photo) => {
                this.photos.update((list) => [photo, ...list]);
                this.onFileUploadSettled(staged);
                this.fetchUsage(); // keep the remaining-storage preview live
              },
              error: () => this.onFileUploadFailed(staged, 'Failed to save photo details.'),
            });
          })
          .catch((err: Error) => this.onFileUploadFailed(staged, err.message));
      },
      error: (err) => {
        // A 402 here means the backend's pre-flight storage check
        // rejected this specific file — surface its real message.
        this.onFileUploadFailed(staged, err?.error?.error ?? 'Could not start the upload.');
      },
    });
  }

  private onFileUploadSettled(staged: StagedFile): void {
    URL.revokeObjectURL(staged.previewUrl);
    this.stagedFiles.update((list) => list.filter((s) => s.id !== staged.id));
    this.uploadCompleted.update((n) => n + 1);
    this.checkUploadFinished();
    this.maybeStartPolling(); // the just-uploaded photo starts as 'queued'
  }

  private onFileUploadFailed(staged: StagedFile, reason: string): void {
    this.toastService.error(`${staged.file.name}: ${reason}`);
    URL.revokeObjectURL(staged.previewUrl);
    this.stagedFiles.update((list) => list.filter((s) => s.id !== staged.id));
    this.uploadCompleted.update((n) => n + 1); // still counts toward "done processing"
    this.checkUploadFinished();
  }

  private checkUploadFinished(): void {
    if (this.uploadCompleted() >= this.uploadTotal()) {
      this.uploading.set(false);
      this.toastService.success(`Uploaded ${this.uploadTotal()} photo(s).`);
    }
  }
}
