import { Component } from '@angular/core';

/**
 * The larger SnapFace lockup (icon + wordmark + tagline). Same inlining
 * approach as LogoNavbar — needed for the theme-aware fill to work.
 */
@Component({
  selector: 'sf-logo-full',
  standalone: true,
  templateUrl: './logo-full.html',
  styleUrl: './logo-full.scss'
})
export class LogoFull {}