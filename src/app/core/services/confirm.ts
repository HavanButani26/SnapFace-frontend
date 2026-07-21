import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
  onConfirm: () => void;
}

type ConfirmOptions = Partial<Pick<ConfirmRequest, 'confirmLabel' | 'cancelLabel' | 'danger'>> & {
  title: string;
  message: string;
  onConfirm: () => void;
};

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  request = signal<ConfirmRequest | null>(null);

  ask(options: ConfirmOptions): void {
    this.request.set({
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      danger: false,
      ...options,
    });
  }

  confirm(): void {
    this.request()?.onConfirm();
    this.request.set(null);
  }

  cancel(): void {
    this.request.set(null);
  }
}
