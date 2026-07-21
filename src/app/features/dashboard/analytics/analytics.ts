import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { AnalyticsService, AnalyticsOverview } from '../../../core/services/analytics';

@Component({
  selector: 'sf-analytics',
  standalone: true,
  imports: [RouterLink, ChartModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics implements OnInit {
  private analyticsService = inject(AnalyticsService);

  loading = signal(true);
  data = signal<AnalyticsOverview | null>(null);

  photosOverTimeChart: any;
  eventsByStatusChart: any;
  lineChartOptions: any;
  doughnutChartOptions: any;

  ngOnInit(): void {
    this.analyticsService.getOverview().subscribe({
      next: (data) => {
        this.data.set(data);
        this.buildCharts(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private buildCharts(data: AnalyticsOverview): void {
    const style = getComputedStyle(document.documentElement);
    const textColor = style.getPropertyValue('--sf-text').trim() || '#e2e8f0';
    const gridColor = 'rgba(148, 163, 184, 0.15)';
    const cyan = '#00D4FF';
    const purple = '#7B3FF2';

    this.photosOverTimeChart = {
      labels: data.photos_over_time.map((p) => this.formatShortDate(p.date)),
      datasets: [
        {
          label: 'Photos Uploaded',
          data: data.photos_over_time.map((p) => p.count),
          fill: true,
          borderColor: cyan,
          backgroundColor: 'rgba(0, 212, 255, 0.15)',
          tension: 0.35,
          pointBackgroundColor: cyan,
        },
      ],
    };

    const statusLabels = Object.keys(data.events_by_status);
    const statusColors: Record<string, string> = {
      draft: '#64748b',
      active: '#22c55e',
      completed: purple,
    };

    this.eventsByStatusChart = {
      labels: statusLabels.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [
        {
          data: statusLabels.map((s) => data.events_by_status[s]),
          backgroundColor: statusLabels.map((s) => statusColors[s] ?? cyan),
          borderWidth: 0,
        },
      ],
    };

    this.lineChartOptions = {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true },
      },
    };

    this.doughnutChartOptions = {
      plugins: { legend: { position: 'bottom', labels: { color: textColor } } },
      cutout: '65%',
    };
  }

  private formatShortDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
}
