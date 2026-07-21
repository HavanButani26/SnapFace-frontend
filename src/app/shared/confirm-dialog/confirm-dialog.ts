import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../core/services/confirm';

@Component({
  selector: 'sf-confirm-dialog',
  standalone: true,
  template: `
    @if (confirmService.request(); as req) {
      <div class="sf-confirm-backdrop" (click)="confirmService.cancel()"></div>
      <div class="sf-confirm-dialog" role="alertdialog" aria-modal="true">
        <h3 class="sf-confirm-dialog__title">{{ req.title }}</h3>
        <p class="sf-confirm-dialog__message">{{ req.message }}</p>
        <div class="sf-confirm-dialog__actions">
          <button
            type="button"
            class="sf-confirm-dialog__btn sf-confirm-dialog__btn--cancel"
            (click)="confirmService.cancel()"
          >
            {{ req.cancelLabel }}
          </button>
          <button
            type="button"
            class="sf-confirm-dialog__btn"
            [class.sf-confirm-dialog__btn--danger]="req.danger"
            [class.sf-confirm-dialog__btn--primary]="!req.danger"
            (click)="confirmService.confirm()"
          >
            {{ req.confirmLabel }}
          </button>
        </div>
      </div>
    }
  `,
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  confirmService = inject(ConfirmService);
}
