import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notification {
  id: number;
  notification_type: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  unread_count: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  list(): Observable<NotificationListResponse> {
    return this.http.get<NotificationListResponse>(`${this.apiUrl}/`);
  }

  markRead(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/mark-read/`, {});
  }

  markAllRead(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/mark-all-read/`, {});
  }
}