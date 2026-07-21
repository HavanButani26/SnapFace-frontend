import { Component } from '@angular/core';
import { Hero } from './sections/hero/hero';
import { Features } from './sections/features/features';
import { HowItWorks } from './sections/how-it-works/how-it-works';
import { AdvancedAi } from './sections/advanced-ai/advanced-ai';
import { TrustSecurity } from './sections/trust-security/trust-security';
import { Testimonials } from './sections/testimonials/testimonials';
import { FinalCta } from './sections/final-cta/final-cta';
import { BackToTop } from '../../../shared/back-to-top/back-to-top';

@Component({
  selector: 'sf-home',
  standalone: true,
  imports: [
    Hero,
    Features,
    HowItWorks,
    AdvancedAi,
    TrustSecurity,
    Testimonials,
    FinalCta,
    BackToTop,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
