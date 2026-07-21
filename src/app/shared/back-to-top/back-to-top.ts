import { Component, signal, HostListener } from '@angular/core';

@Component({
  selector: 'sf-back-to-top',
  standalone: true,
  templateUrl: './back-to-top.html',
  styleUrl: './back-to-top.scss',
})
export class BackToTop {
  visible = signal(false);

  private readonly showAfterPx = 400;

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible.set(window.scrollY > this.showAfterPx);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
