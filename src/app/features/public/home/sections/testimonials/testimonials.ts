import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

@Component({
  selector: 'sf-testimonials',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials {
  testimonials: Testimonial[] = [
    {
      quote:
        'SnapFace completely transformed how I deliver photos to my clients. My guests love the selfie search feature. It\u2019s a game-changer!',
      name: 'Rahul Patel',
      role: 'Wedding Photographer',
      initials: 'RP',
    },
    {
      quote: 'Found all my photos from the event in seconds! The AI is seriously amazing.',
      name: 'Priya Sharma',
      role: 'Guest',
      initials: 'PS',
    },
    {
      quote:
        'The analytics dashboard alone is worth it. I finally understand which moments resonate with my clients most.',
      name: 'Amit Verma',
      role: 'Event Photographer',
      initials: 'AV',
    },
  ];

  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 1, numScroll: 1 },
    { breakpoint: '768px', numVisible: 1, numScroll: 1 },
  ];
}
