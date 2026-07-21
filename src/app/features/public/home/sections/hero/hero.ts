import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface Stat {
  icon: string;
  value: string;
  label: string;
}

@Component({
  selector: 'sf-hero',
  standalone: true,
  imports: [NgClass, RouterLink, ButtonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  stats: Stat[] = [
    { icon: 'pi-users', value: '1000+', label: 'Events Covered' },
    { icon: 'pi-heart-fill', value: '500K+', label: 'Happy Guests' },
    { icon: 'pi-star-fill', value: '99%', label: 'Match Accuracy' },
  ];

  thumbPlaceholders = [1, 2, 3, 4];
}
