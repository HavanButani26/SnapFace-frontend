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

@Injectable({ providedIn: 'root' })
export class GuestService {
  private readonly apiUrl = `${environment.apiUrl}/guest/events`;

  constructor(private http: HttpClient) {}

  getEventInfo(slug: string): Observable<GuestEventInfo> {
    return this.http.get<GuestEventInfo>(`${this.apiUrl}/${slug}/`);
  }

  verifyPassword(slug: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/${slug}/verify-password/`, {
      password,
    });
  }

  searchSelfie(slug: string, selfie: File, token?: string): Observable<GuestSearchResult> {
    const formData = new FormData();
    formData.append('selfie', selfie);
    if (token) formData.append('token', token);

    return this.http.post<GuestSearchResult>(`${this.apiUrl}/${slug}/search/`, formData);
  }

  /**
   * Server-side ZIP — the browser only ever downloads one finished
   * archive; Django does the fetching-from-Cloudinary and zipping.
   */
  downloadZip(slug: string, photoIds: number[], token?: string): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/${slug}/download-zip/`,
      { photo_ids: photoIds, token },
      { responseType: 'blob' }
    );
  }

  getStoredToken(slug: string): string | null {
    return sessionStorage.getItem(`sf_guest_token_${slug}`);
  }

  storeToken(slug: string, token: string): void {
    sessionStorage.setItem(`sf_guest_token_${slug}`, token);
  }
}