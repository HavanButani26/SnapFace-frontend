import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  colorClass: string;
}

@Component({
  selector: 'sf-features',
  standalone: true,
  imports: [NgClass],
  templateUrl: './features.html',
  styleUrl: './features.scss',
})
export class Features {
  features: FeatureCard[] = [
    {
      icon: 'pi-cloud-upload',
      title: 'One-Time Upload',
      description: 'Upload all event photos once and we handle the rest.',
      colorClass: 'sf-feature-icon--blue',
    },
    {
      icon: 'pi-user-edit',
      title: 'AI Face Recognition',
      description: 'Advanced AI finds every face with 99% accuracy instantly.',
      colorClass: 'sf-feature-icon--purple',
    },
    {
      icon: 'pi-mobile',
      title: 'Selfie Search',
      description: 'Guests upload a selfie and get their photos in seconds.',
      colorClass: 'sf-feature-icon--pink',
    },
    {
      icon: 'pi-images',
      title: 'Original Quality',
      description: 'Download photos in original quality. No compression.',
      colorClass: 'sf-feature-icon--orange',
    },
    {
      icon: 'pi-shield',
      title: 'Secure & Private',
      description: 'Your photos are safe with enterprise-grade security.',
      colorClass: 'sf-feature-icon--green',
    },
    {
      icon: 'pi-chart-line',
      title: 'Smart Analytics',
      description: 'Powerful insights and dashboards for your events.',
      colorClass: 'sf-feature-icon--cyan',
    },
  ];
}
