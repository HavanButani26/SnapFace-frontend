import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme';
import { ToastContainer } from './shared/toast-container/toast-container';
import { ConfirmDialog } from './shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainer, ConfirmDialog],
  template: `
    <router-outlet />
    <sf-toast-container />
    <sf-confirm-dialog />
  `,
})
export class App {
  private themeService = inject(ThemeService); // instantiated eagerly so theme applies before first paint
}
