import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GuestService, GuestPhotosByEvent } from '../../../core/services/guest-event';

@Component({
  selector: 'sf-guest-my-photos',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="sf-my-photos">
      <h1>My Photos</h1>
      <p class="sf-my-photos__hint">Every photo you've been matched in, across all events.</p>

      @if (loading()) {
        <p class="sf-my-photos__loading">Loading your photos...</p>
      } @else if (eventGroups().length === 0) {
        <div class="sf-card sf-my-photos__empty">
          <i class="pi pi-images"></i>
          <h3>No photos yet</h3>
          <p>Scan an event's QR code and search with a selfie to find your photos — they'll show up here.</p>
        </div>
      } @else {
        @for (group of eventGroups(); track group.event_slug) {
          <section class="sf-my-photos__event">
            <div class="sf-my-photos__event-header">
              <h2>{{ group.event_name }} <span class="sf-my-photos__count">({{ group.photos.length }})</span></h2>
              <a [routerLink]="['/e', group.event_slug]" class="sf-my-photos__search-link">
                Search this event again <i class="pi pi-arrow-right"></i>
              </a>
            </div>
            <div class="sf-my-photos__grid">
              @for (photo of group.photos; track photo.id) {
                <div class="sf-my-photos__item">
                  <img [src]="photo.thumbnail_url || photo.image_url" [alt]="photo.original_filename" loading="lazy" />
                </div>
              }
            </div>
          </section>
        }
      }
    </div>
  `,
  styleUrl: './guest-my-photos.scss'
})
export class GuestMyPhotos implements OnInit {
  private guestService = inject(GuestService);

  loading = signal(true);
  eventGroups = signal<GuestPhotosByEvent[]>([]);

  ngOnInit(): void {
    this.guestService.getMyPhotos().subscribe({
      next: (res) => {
        this.eventGroups.set(res.events);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}