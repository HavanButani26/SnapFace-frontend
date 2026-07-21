import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type EventStatus = 'draft' | 'active' | 'completed';

export interface Event {
  id: number;
  name: string;
  event_date: string; // 'YYYY-MM-DD'
  venue: string;
  client_name: string;
  expected_guest_count: number | null;
  description: string;
  cover_photo: string;
  status: EventStatus;
  slug: string;
  guest_link: string;
  is_password_protected: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventWritePayload {
  name: string;
  event_date: string;
  venue?: string;
  client_name?: string;
  expected_guest_count?: number | null;
  description?: string;
  cover_photo?: string;
  status?: EventStatus;
  guest_password?: string; // omit = untouched, '' = remove protection, string = set
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  list(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/`);
  }

  get(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}/`);
  }

  create(payload: EventWritePayload): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/`, payload);
  }

  update(id: number, payload: Partial<EventWritePayload>): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/`, payload);
  }
}
