import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Photo } from './photo';

export interface GuestEventInfo {
  name: string;
  event_date: string;
  venue: string;
  cover_photo: string;
  is_password_protected: boolean;
}

export interface GuestSearchResult {
  match_count: number;
  photos: Photo[];
}

export interface GuestPhotosByEvent {
  event_name: string;
  event_slug: string;
  photos: Photo[];
}

@Injectable({ providedIn: 'root' })
export class GuestService {
  private readonly apiUrl = `${environment.apiUrl}/guest`;

  constructor(private http: HttpClient) {}

  getEventInfo(slug: string): Observable<GuestEventInfo> {
    return this.http.get<GuestEventInfo>(`${this.apiUrl}/events/${slug}/`);
  }

  verifyPassword(slug: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/events/${slug}/verify-password/`, {
      password,
    });
  }

  /**
   * Auth is handled automatically by the existing HTTP interceptor
   * (attaches the guest's own Bearer token, since search now requires
   * login). `token` here is the SEPARATE event-password token, if that
   * event is also password-protected — an independent gate from login.
   */
  searchSelfie(
    slug: string,
    selfie: File,
    consent: boolean,
    token?: string,
  ): Observable<GuestSearchResult> {
    const formData = new FormData();
    formData.append('selfie', selfie);
    formData.append('consent', String(consent));
    if (token) formData.append('token', token);

    return this.http.post<GuestSearchResult>(`${this.apiUrl}/events/${slug}/search/`, formData);
  }

  downloadZip(slug: string, photoIds: number[], token?: string): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/events/${slug}/download-zip/`,
      { photo_ids: photoIds, token },
      { responseType: 'blob' },
    );
  }

  getMyPhotos(): Observable<{ events: GuestPhotosByEvent[] }> {
    return this.http.get<{ events: GuestPhotosByEvent[] }>(`${this.apiUrl}/my-photos/`);
  }

  // sessionStorage helpers for the EVENT PASSWORD token specifically —
  // separate concern from account login, which uses the normal
  // localStorage-based JWT session via AuthService.
  getStoredToken(slug: string): string | null {
    return sessionStorage.getItem(`sf_guest_token_${slug}`);
  }

  storeToken(slug: string, token: string): void {
    sessionStorage.setItem(`sf_guest_token_${slug}`, token);
  }
}
