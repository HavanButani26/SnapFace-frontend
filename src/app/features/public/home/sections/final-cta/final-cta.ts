import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'sf-final-cta',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './final-cta.html',
  styleUrl: './final-cta.scss',
})
export class FinalCta {
  trustPoints = ['No credit card required', 'Setup in 2 minutes'];
}
