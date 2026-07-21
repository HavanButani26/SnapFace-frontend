import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { EventService, EventStatus } from '../../../../core/services/event';
import { ToastService } from '../../../../core/services/toast';

@Component({
  selector: 'sf-event-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    SelectModule,
    InputNumberModule,
    PasswordModule,
  ],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
})
export class EventForm implements OnInit {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  eventId = signal<number | null>(null);
  isEditMode = signal(false);
  loading = signal(false);
  saving = signal(false);

  statusOptions: { label: string; value: EventStatus }[] = [
    { label: 'Draft', value: 'draft' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  protectWithPassword = signal(false);
  currentlyProtected = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    event_date: [null as Date | null, [Validators.required]],
    venue: [''],
    client_name: [''],
    expected_guest_count: [null as number | null],
    description: [''],
    status: ['draft' as EventStatus],
    guest_password: [''],
  });

  get name() {
    return this.form.controls.name;
  }
  get event_date() {
    return this.form.controls.event_date;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.eventId.set(id);
      this.isEditMode.set(true);
      this.loading.set(true);

      this.eventService.get(id).subscribe({
        next: (event) => {
          this.currentlyProtected.set(event.is_password_protected);
          this.form.patchValue({
            name: event.name,
            event_date: new Date(event.event_date + 'T00:00:00'),
            venue: event.venue,
            client_name: event.client_name,
            expected_guest_count: event.expected_guest_count,
            description: event.description,
            status: event.status,
          });
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.toastService.error('Could not load this event.');
          this.router.navigate(['/dashboard/events']);
        },
      });
    }
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const raw = this.form.getRawValue();

    const payload: any = {
      name: raw.name,
      event_date: this.formatDate(raw.event_date as Date),
      venue: raw.venue,
      client_name: raw.client_name,
      expected_guest_count: raw.expected_guest_count,
      description: raw.description,
      status: raw.status,
    };

    if (this.isEditMode()) {
      if (this.protectWithPassword() && raw.guest_password) {
        payload.guest_password = raw.guest_password;
      } else if (!this.protectWithPassword() && this.currentlyProtected()) {
        payload.guest_password = '';
      }
    } else if (this.protectWithPassword() && raw.guest_password) {
      payload.guest_password = raw.guest_password;
    }

    const request$ = this.isEditMode()
      ? this.eventService.update(this.eventId()!, payload)
      : this.eventService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success(this.isEditMode() ? 'Event updated.' : 'Event created.');
        this.router.navigate(['/dashboard/events']);
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.error(err?.error?.error ?? 'Something went wrong. Please try again.');
      },
    });
  }
}
