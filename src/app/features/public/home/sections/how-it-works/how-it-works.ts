import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

interface Step {
  number: number;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'sf-how-it-works',
  standalone: true,
  imports: [NgClass],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss',
})
export class HowItWorks {
  steps: Step[] = [
    {
      number: 1,
      icon: 'pi-cloud-upload',
      title: 'Upload Event Photos',
      description: 'Photographers upload all event photos securely.',
    },
    {
      number: 2,
      icon: 'pi-sitemap',
      title: 'AI Processes Every Face',
      description: 'Our AI scans and creates unique profiles for every person.',
    },
    {
      number: 3,
      icon: 'pi-mobile',
      title: 'Guest Uploads Selfie',
      description: 'Guests upload a selfie and our AI finds matching photos instantly.',
    },
    {
      number: 4,
      icon: 'pi-images',
      title: 'Get Your Photos',
      description: 'View and download all your photos in original quality.',
    },
  ];
}
