import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AnalyticsOverview {
  total_events: number;
  total_photos: number;
  total_faces: number;
  total_storage_mb: number;
  events_by_status: Record<string, number>;
  photos_by_status: Record<string, number>;
  photos_over_time: { date: string; count: number }[];
  top_events: { id: number; name: string; photo_count: number }[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getOverview(): Observable<AnalyticsOverview> {
    return this.http.get<AnalyticsOverview>(`${this.apiUrl}/overview/`);
  }
}
