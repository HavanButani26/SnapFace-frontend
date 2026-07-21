import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'sf-toast-container',
  standalone: true,
  template: `
    <div class="sf-toast-stack">
      @for (msg of toastService.messages(); track msg.id) {
        <div class="sf-toast" [class]="'sf-toast--' + msg.severity">
          <i
            class="pi"
            [class.pi-check-circle]="msg.severity === 'success'"
            [class.pi-times-circle]="msg.severity === 'error'"
            [class.pi-info-circle]="msg.severity === 'info'"
          ></i>
          <span>{{ msg.text }}</span>
          <button type="button" (click)="toastService.dismiss(msg.id)" aria-label="Dismiss">
            <i class="pi pi-times"></i>
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  toastService = inject(ToastService);
}
