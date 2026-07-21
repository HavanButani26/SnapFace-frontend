import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { SubscriptionService, UsageSnapshot } from '../../../core/services/subscription';
import { UsageBar } from '../../../shared/usage-bar/usage-bar';

@Component({
  selector: 'sf-dashboard',
  standalone: true,
  imports: [RouterLink, UsageBar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);

  loading = signal(true);
  usage = signal<UsageSnapshot | null>(null);

  // The single worst offender across all tracked limits, used to decide
  // whether/how loudly to show the top banner.
  worstWarningLevel = computed(() => {
    const u = this.usage();
    if (!u) return 'normal';
    const levels = [u.storage.warning_level, u.events.warning_level];
    if (levels.includes('blocked')) return 'blocked';
    if (levels.includes('urgent')) return 'urgent';
    if (levels.includes('warning')) return 'warning';
    return 'normal';
  });

  ngOnInit(): void {
    this.subscriptionService.getMyUsage().subscribe({
      next: (usage) => {
        this.usage.set(usage);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
