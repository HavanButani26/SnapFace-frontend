import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface Capability {
  icon: string;
  label: string;
}

interface Point {
  x: number;
  y: number;
  r: number;
}

interface Node {
  icon: string;
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  colorClass: string;
}

interface PanelItem {
  text: string;
}

/** Deterministic PRNG so the dot scatter looks the same on every load (mulberry32). */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

@Component({
  selector: 'sf-advanced-ai',
  standalone: true,
  imports: [NgClass, RouterLink, ButtonModule],
  templateUrl: './advanced-ai.html',
  styleUrl: './advanced-ai.scss',
})
export class AdvancedAi implements OnInit {
  capabilities: Capability[] = [
    { icon: 'pi-users', label: 'Multi-Face Detection' },
    { icon: 'pi-eye', label: 'Expression Recognition' },
    { icon: 'pi-sitemap', label: 'Smart Clustering' },
    { icon: 'pi-image', label: 'Scene Understanding' },
    { icon: 'pi-bolt', label: 'Lightning Fast' },
  ];

  photographerItems: PanelItem[] = [
    { text: 'Upload once & save hours' },
    { text: 'Powerful analytics & insights' },
    { text: 'Grow your photography business' },
    { text: 'Delight your clients' },
  ];

  guestItems: PanelItem[] = [
    { text: 'Find yourself instantly' },
    { text: 'No more asking photographers' },
    { text: 'Download in original quality' },
    { text: 'Share memories with friends' },
  ];

  // ViewBox for the constellation graphic — nodes/edges map to this space
  readonly vbWidth = 420;
  readonly vbHeight = 420;

  starPoints: Point[] = [];
  edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  nodes: Node[] = [];

  ngOnInit(): void {
    const rand = mulberry32(7);
    const cx = this.vbWidth / 2;
    const cy = this.vbHeight / 2;

    // Background "star field" — small dots scattered within a soft circular
    // boundary (simple radius check, no fragile polygon math involved).
    this.starPoints = this.generateStarField(rand, cx, cy, 90);

    // Satellite nodes arranged in a loose ring around the center, with
    // jitter so it reads as organic rather than a perfect circle.
    const ringCount = 9;
    const satellites: Point[] = [];
    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2 + rand() * 0.3;
      const radius = 95 + rand() * 45;
      satellites.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        r: 2.5 + rand() * 1.5,
      });
    }

    // Edges: hub-to-satellite, plus a few satellite-to-satellite links
    this.edges = satellites.map((s) => ({ x1: cx, y1: cy, x2: s.x, y2: s.y }));
    for (let i = 0; i < satellites.length; i++) {
      const next = satellites[(i + 2) % satellites.length];
      this.edges.push({ x1: satellites[i].x, y1: satellites[i].y, x2: next.x, y2: next.y });
    }

    // Promote 4 of the satellite positions to icon "feature" nodes
    const iconSet: { icon: string; colorClass: string }[] = [
      { icon: 'pi-user', colorClass: 'sf-ai-node--cyan' },
      { icon: 'pi-heart-fill', colorClass: 'sf-ai-node--purple' },
      { icon: 'pi-users', colorClass: 'sf-ai-node--purple' },
      { icon: 'pi-image', colorClass: 'sf-ai-node--cyan' },
    ];
    this.nodes = iconSet.map((set, i) => {
      const pos = satellites[Math.floor((i / iconSet.length) * ringCount)];
      return { ...set, x: pos.x, y: pos.y, anchorX: cx, anchorY: cy };
    });

    // Remaining satellites (not promoted) render as plain small dots
    this.starPoints.push(...satellites);
  }

  private generateStarField(rand: () => number, cx: number, cy: number, count: number): Point[] {
    const results: Point[] = [];
    const maxRadius = 165;
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2;
      // sqrt spacing keeps density even across the disc instead of clumping at center
      const radius = Math.sqrt(rand()) * maxRadius;
      results.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        r: 1 + rand() * 1.3,
      });
    }
    return results;
  }
}
