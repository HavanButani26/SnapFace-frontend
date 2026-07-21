import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UsageBucket {
  limit_type: string;
  used: number;
  limit: number;
  percent: number;
  warning_level: 'normal' | 'warning' | 'urgent' | 'blocked';
}

export interface UsageSnapshot {
  plan: { name: string; slug: string } | null;
  status: string | null;
  storage: UsageBucket;
  events: UsageBucket;
  ai_jobs: UsageBucket;
  reel_exports: UsageBucket;
  features: string[];
  trial_days_remaining: number | null;
}

export interface PlanLimitInfo {
  limit_type: string;
  limit_type_display: string;
  value: number;
}

export interface PlanFeatureInfo {
  feature: string;
  feature_display: string;
}

export interface PlanInfo {
  id: number;
  name: string;
  slug: string;
  description: string;
  monthly_price: string;
  limits: PlanLimitInfo[];
  plan_features: PlanFeatureInfo[];
}

export interface AddOnInfo {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  limit_type: string | null;
  limit_type_display: string | null;
  limit_boost_value: number | null;
  feature: string | null;
  feature_display: string | null;
}

export interface CheckoutResult {
  message: string;
  subscription_status?: string;
  transaction_id: number;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly apiUrl = `${environment.apiUrl}/subscriptions`;

  static readonly STORAGE_ESTIMATE_MULTIPLIER = 1.45;

  constructor(private http: HttpClient) {}

  getMyUsage(): Observable<UsageSnapshot> {
    return this.http.get<UsageSnapshot>(`${this.apiUrl}/my-usage/`);
  }

  getPlans(): Observable<PlanInfo[]> {
    return this.http.get<PlanInfo[]>(`${this.apiUrl}/plans/`);
  }

  getAddOns(): Observable<AddOnInfo[]> {
    return this.http.get<AddOnInfo[]>(`${this.apiUrl}/addons/`);
  }

  checkoutPlan(planId: number): Observable<CheckoutResult> {
    return this.http.post<CheckoutResult>(`${this.apiUrl}/checkout/plan/${planId}/`, {});
  }

  checkoutAddOn(addonId: number): Observable<CheckoutResult> {
    return this.http.post<CheckoutResult>(`${this.apiUrl}/checkout/addon/${addonId}/`, {});
  }
}
