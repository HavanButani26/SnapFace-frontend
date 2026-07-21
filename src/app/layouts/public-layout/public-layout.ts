import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../features/public/home/sections/navbar/navbar';
import { Footer } from '../../features/public/home/sections/footer/footer';

@Component({
  selector: 'sf-public-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer],
  template: `
    <sf-navbar />
    <main>
      <router-outlet />
    </main>
    <sf-footer />
  `,
})
export class PublicLayout {}
