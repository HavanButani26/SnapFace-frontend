import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { SubscriptionService, PlanInfo, UsageSnapshot } from '../../../core/services/subscription';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'sf-pricing',
  standalone: true,
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class Pricing implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  plans = signal<PlanInfo[]>([]);
  loading = signal(true);
  currentUsage = signal<UsageSnapshot | null>(null);
  checkingOutPlanId = signal<number | null>(null);

  ngOnInit(): void {
    this.subscriptionService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    if (this.authService.isLoggedIn()) {
      this.subscriptionService.getMyUsage().subscribe({
        next: (usage) => this.currentUsage.set(usage),
      });
    }
  }

  isCurrentPlan(plan: PlanInfo): boolean {
    return this.currentUsage()?.plan?.slug === plan.slug;
  }

  choosePlan(plan: PlanInfo): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/register']);
      return;
    }

    if (this.isCurrentPlan(plan)) return;

    this.checkingOutPlanId.set(plan.id);
    this.subscriptionService.checkoutPlan(plan.id).subscribe({
      next: (result) => {
        this.checkingOutPlanId.set(null);
        this.toastService.success(result.message);
        this.subscriptionService.getMyUsage().subscribe({
          next: (usage) => this.currentUsage.set(usage),
        });
      },
      error: (err) => {
        this.checkingOutPlanId.set(null);
        this.toastService.error(err?.error?.error ?? 'Could not update your plan.');
      },
    });
  }

  getLimitValue(plan: PlanInfo, limitType: string): number | null {
    const row = plan.limits.find((l) => l.limit_type === limitType);
    return row ? row.value : null;
  }

  hasFeature(plan: PlanInfo, feature: string): boolean {
    return plan.plan_features.some((f) => f.feature === feature);
  }
}
