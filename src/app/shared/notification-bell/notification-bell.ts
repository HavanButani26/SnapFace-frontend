import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../core/services/notification';

@Component({
  selector: 'sf-notification-bell',
  standalone: true,
  imports: [],
  template: `
    <div class="sf-notif-bell">
      <button
        type="button"
        class="sf-notif-bell__trigger"
        (click)="toggleOpen($event)"
        aria-label="Notifications"
      >
        <i class="pi pi-bell"></i>
        @if (unreadCount() > 0) {
          <span class="sf-notif-bell__badge">{{ unreadCount() > 9 ? '9+' : unreadCount() }}</span>
        }
      </button>

      @if (open()) {
        <div class="sf-notif-bell__panel">
          <div class="sf-notif-bell__header">
            <h4>Notifications</h4>
            @if (unreadCount() > 0) {
              <button type="button" class="sf-notif-bell__mark-all" (click)="markAllRead()">
                Mark all read
              </button>
            }
          </div>

          <div class="sf-notif-bell__scroll-area">
            @if (loading()) {
              <p class="sf-notif-bell__empty">Loading...</p>
            } @else if (notifications().length === 0) {
              <p class="sf-notif-bell__empty">No notifications yet.</p>
            } @else {
              <div class="sf-notif-bell__list">
                @for (n of notifications(); track n.id) {
                  <button
                    type="button"
                    class="sf-notif-bell__item"
                    [class.sf-notif-bell__item--unread]="!n.is_read"
                    (click)="onNotificationClick(n)"
                  >
                    <span
                      class="sf-notif-bell__item-dot"
                      [class.sf-notif-bell__item-dot--visible]="!n.is_read"
                    ></span>
                    <span class="sf-notif-bell__item-content">
                      <span class="sf-notif-bell__item-title">{{ n.title }}</span>
                      @if (n.message) {
                        <span class="sf-notif-bell__item-message">{{ n.message }}</span>
                      }
                      <span class="sf-notif-bell__item-time">{{ timeAgo(n.created_at) }}</span>
                    </span>
                  </button>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './notification-bell.scss',
})
export class NotificationBell implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  open = signal(false);
  loading = signal(true);
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private readonly pollIntervalMs = 30000;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  ngOnInit(): void {
    this.fetchNotifications();

    // Polling, not WebSockets — same reasoning as photo processing
    // status: notifications can be created server-side (e.g. right
    // after creating an event) while this page is already open, so we
    // need SOME way to notice without a full reload or manual click.
    this.pollHandle = setInterval(() => this.fetchNotifications(), this.pollIntervalMs);
  }

  ngOnDestroy(): void {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  private fetchNotifications(): void {
    this.notificationService.list().subscribe({
      next: (res) => {
        this.notifications.set(res.notifications);
        this.unreadCount.set(res.unread_count);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleOpen(event: MouseEvent): void {
    event.stopPropagation();
    const wasOpen = this.open();
    this.open.set(!wasOpen);
    if (!wasOpen) {
      this.fetchNotifications(); // refresh every time it's opened
    }
  }

  close(): void {
    this.open.set(false);
  }

  onNotificationClick(n: Notification): void {
    if (!n.is_read) {
      this.notificationService.markRead(n.id).subscribe({
        next: () => {
          this.notifications.update((list) =>
            list.map((item) => (item.id === n.id ? { ...item, is_read: true } : item)),
          );
          this.unreadCount.update((count) => Math.max(0, count - 1));
        },
      });
    }

    this.close();
    if (n.link) {
      this.router.navigateByUrl(n.link);
    }
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications.update((list) => list.map((item) => ({ ...item, is_read: true })));
        this.unreadCount.set(0);
      },
    });
  }

  timeAgo(isoDate: string): string {
    const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
