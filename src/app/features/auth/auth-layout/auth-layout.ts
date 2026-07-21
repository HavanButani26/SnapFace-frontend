import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Highlight {
  icon: string;
  text: string;
}

@Component({
  selector: 'sf-auth-layout',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  currentYear = new Date().getFullYear();

  highlights: Highlight[] = [
    { icon: 'pi-bolt', text: 'AI finds every face in seconds' },
    { icon: 'pi-shield', text: 'Enterprise-grade security & privacy' },
    { icon: 'pi-chart-line', text: 'Powerful analytics for your events' },
  ];
}
