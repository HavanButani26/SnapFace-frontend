import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService, Event as AppEvent } from '../../../../core/services/event';
import { PhotoService, Photo } from '../../../../core/services/photo';

@Component({
  selector: 'sf-event-photos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './event-photos.html',
  styleUrl: './event-photos.scss',
})
export class EventPhotos implements OnInit {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);
  private photoService = inject(PhotoService);

  event = signal<AppEvent | null>(null);
  photos = signal<Photo[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.eventService.get(id).subscribe({
      next: (event) => this.event.set(event),
    });

    this.photoService.list(id).subscribe({
      next: (photos) => {
        this.photos.set(photos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
