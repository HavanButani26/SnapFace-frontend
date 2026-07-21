import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  text: string;
  severity: ToastSeverity;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  messages = signal<ToastMessage[]>([]);

  show(text: string, severity: ToastSeverity = 'info', duration = 3500): void {
    const id = this.nextId++;
    this.messages.update((list) => [...list, { id, text, severity }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(text: string, duration?: number): void {
    this.show(text, 'success', duration);
  }

  error(text: string, duration?: number): void {
    this.show(text, 'error', duration);
  }

  dismiss(id: number): void {
    this.messages.update((list) => list.filter((m) => m.id !== id));
  }
}
