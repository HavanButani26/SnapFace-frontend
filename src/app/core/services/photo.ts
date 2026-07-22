import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Photo {
  id: number;
  event: number;
  image_url: string;
  optimized_url: string;
  thumbnail_url: string;
  original_filename: string;
  width: number | null;
  height: number | null;
  file_size: number | null;
  status: string;
  taken_at: string | null;
  camera_make: string;
  camera_model: string;
  gps_latitude: number | null;
  gps_longitude: number | null;
  tags: { label: string; confidence: number }[];
  created_at: string;
}

export interface UploadUrlResponse {
  upload_url: string;
  object_key: string;
}

export interface PhotoMetadata {
  object_key: string;
  original_filename: string;
  file_size: number;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly apiUrl = `${environment.apiUrl}/photos`;

  constructor(private http: HttpClient) {}

  list(eventId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}/event/${eventId}/`);
  }

  getUploadUrl(
    eventId: number,
    filename: string,
    contentType: string,
    fileSize: number,
  ): Observable<UploadUrlResponse> {
    return this.http.post<UploadUrlResponse>(`${this.apiUrl}/event/${eventId}/upload-url/`, {
      filename,
      content_type: contentType,
      file_size: fileSize,
    });
  }

  saveMetadata(eventId: number, metadata: PhotoMetadata): Observable<Photo> {
    return this.http.post<Photo>(`${this.apiUrl}/event/${eventId}/create/`, metadata);
  }

  /**
   * Uploads directly to R2 using a presigned PUT URL. Unlike the old
   * Cloudinary flow, this sends the RAW FILE as the request body, not
   * FormData/multipart. Still uses XMLHttpRequest rather than
   * HttpClient — avoids our auth interceptor attaching a Bearer token
   * to a third-party request, and gives real upload progress events
   * (fetch still doesn't expose these).
   */
  uploadDirectToR2(
    file: File,
    uploadUrl: string,
    onProgress: (percent: number) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type || 'image/jpeg');

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((100 * e.loaded) / e.total));
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed (status ${xhr.status}). Please try again.`));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed — check your connection.'));
      xhr.send(file);
    });
  }
}
