import { Component } from '@angular/core';

/**
 * Renders the real SnapFace navbar logo (icon + wordmark), inlined directly
 * in the template rather than via <img src>. This is required so our
 * component CSS can target .sf-logo__snap inside the SVG and swap its
 * color with the active theme — an <img>-referenced external SVG file
 * has no access to the page's CSS variables or classes.
 */
@Component({
  selector: 'sf-logo-navbar',
  standalone: true,
  templateUrl: './logo-navbar.html',
  styleUrl: './logo-navbar.scss'
})
export class LogoNavbar {}