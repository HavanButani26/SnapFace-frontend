import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

interface TrustItem {
  icon: string;
  label: string;
}

@Component({
  selector: 'sf-trust-security',
  standalone: true,
  imports: [NgClass],
  templateUrl: './trust-security.html',
  styleUrl: './trust-security.scss',
})
export class TrustSecurity {
  items: TrustItem[] = [
    { icon: 'pi-lock', label: 'End-to-End Encryption' },
    { icon: 'pi-shield', label: 'Private AI Processing' },
    { icon: 'pi-verified', label: 'GDPR Compliant' },
    { icon: 'pi-cloud', label: 'Secure Cloud Storage' },
    { icon: 'pi-search', label: 'Regular Security Audits' },
  ];
}
