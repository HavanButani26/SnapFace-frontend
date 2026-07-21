import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface FooterColumn {
  title: string;
  links: { label: string; path: string }[];
}

@Component({
  selector: 'sf-footer',
  standalone: true,
  imports: [RouterLink, FormsModule, ButtonModule, InputTextModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  currentYear = new Date().getFullYear();
  newsletterEmail = '';

  columns: FooterColumn[] = [
    {
      title: 'Product',
      links: [
        { label: 'Features', path: '/features' },
        { label: 'How It Works', path: '/how-it-works' },
        { label: 'For Photographers', path: '/for-photographers' },
        { label: 'For Guests', path: '/for-guests' },
        { label: 'Pricing', path: '/pricing' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Careers', path: '/careers' },
        { label: 'Blog', path: '/blog' },
        { label: 'Contact Us', path: '/contact' },
        { label: 'Press Kit', path: '/press' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Help Center', path: '/help' },
        { label: 'Guides', path: '/guides' },
        { label: 'API Docs', path: '/docs' },
        { label: 'Status', path: '/status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Cookie Policy', path: '/cookies' },
      ],
    },
  ];

  socialLinks = [
    { icon: 'pi-instagram', url: 'https://instagram.com' },
    { icon: 'pi-facebook', url: 'https://facebook.com' },
    { icon: 'pi-youtube', url: 'https://youtube.com' },
    { icon: 'pi-linkedin', url: 'https://linkedin.com' },
  ];

  submitNewsletter(): void {
    if (!this.newsletterEmail) return;
    // Wire to a real /api/newsletter/ endpoint later
    console.log('Newsletter signup:', this.newsletterEmail);
    this.newsletterEmail = '';
  }
}
