import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  SubscriptionService,
  AddOnInfo,
  UsageSnapshot,
} from '../../../../core/services/subscription';
import { ToastService } from '../../../../core/services/toast';

@Component({
  selector: 'sf-addons',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './addons.html',
  styleUrl: './addons.scss',
})
export class AddOns implements OnInit {
  private subscriptionService = inject(SubscriptionService);
  private toastService = inject(ToastService);

  addons = signal<AddOnInfo[]>([]);
  usage = signal<UsageSnapshot | null>(null);
  loading = signal(true);
  purchasingId = signal<number | null>(null);

  // Features already unlocked (via plan OR a previously purchased add-on)
  activeFeatures = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.subscriptionService.getAddOns().subscribe({
      next: (addons) => {
        this.addons.set(addons);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.refreshUsage();
  }

  private refreshUsage(): void {
    this.subscriptionService.getMyUsage().subscribe({
      next: (usage) => {
        this.usage.set(usage);
        this.activeFeatures.set(new Set(usage.features));
      },
    });
  }

  isFeatureAddonActive(addon: AddOnInfo): boolean {
    return !!addon.feature && this.activeFeatures().has(addon.feature);
  }

  purchase(addon: AddOnInfo): void {
    this.purchasingId.set(addon.id);
    this.subscriptionService.checkoutAddOn(addon.id).subscribe({
      next: (result) => {
        this.purchasingId.set(null);
        this.toastService.success(result.message);
        this.refreshUsage();
      },
      error: (err) => {
        this.purchasingId.set(null);
        this.toastService.error(err?.error?.error ?? 'Could not complete purchase.');
      },
    });
  }
}
