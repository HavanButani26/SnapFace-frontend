import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { EventService, Event } from '../../../core/services/event';

type ViewMode = 'grid' | 'table';

@Component({
  selector: 'sf-events',
  standalone: true,
  imports: [DatePipe, RouterLink, ButtonModule, TableModule],
  templateUrl: './events.html',
  styleUrl: './events.scss',
})
export class Events implements OnInit {
  private eventService = inject(EventService);
  private router = inject(Router);

  events = signal<Event[]>([]);
  loading = signal(true);
  viewMode = signal<ViewMode>('grid');

  ngOnInit(): void {
    this.eventService.list().subscribe({
      next: (events) => {
        this.events.set(events);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setView(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  statusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  editEvent(id: number, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.router.navigate(['/dashboard/events', id, 'edit']);
  }
}
