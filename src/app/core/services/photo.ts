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
  created_at: string;
}

interface UploadSignature {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
  original_filename: string;
}

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly apiUrl = `${environment.apiUrl}/photos`;

  constructor(private http: HttpClient) {}

  list(eventId: number): Observable<Photo[]> {
    return this.http.get<Photo[]>(`${this.apiUrl}/event/${eventId}/`);
  }

  getUploadSignature(eventId: number, fileSize: number): Observable<UploadSignature> {
    return this.http.post<UploadSignature>(`${this.apiUrl}/event/${eventId}/upload-signature/`, {
      file_size: fileSize,
    });
  }

  saveMetadata(eventId: number, result: CloudinaryUploadResult): Observable<Photo> {
    return this.http.post<Photo>(`${this.apiUrl}/event/${eventId}/create/`, result);
  }

  /**
   * Uploads a file DIRECTLY to Cloudinary from the browser — our Django
   * server never sees the file bytes at all. Deliberately uses
   * XMLHttpRequest instead of Angular's HttpClient for two reasons:
   * 1. HttpClient would run our auth interceptor and attach our own
   *    Bearer token to a third-party request, which is wrong here.
   * 2. The fetch API still doesn't expose upload progress events;
   *    XHR does, which is what powers the per-file progress bars.
   */
  uploadDirectToCloudinary(
    file: File,
    sig: UploadSignature,
    onProgress: (percent: number) => void,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.api_key);
      formData.append('timestamp', String(sig.timestamp));
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((100 * e.loaded) / e.total));
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            original_filename: file.name,
          });
        } else {
          // Surface Cloudinary's actual message (e.g. "File size too
          // large. Got 10489521. Maximum is 10485760.") instead of a
          // generic failure — much more useful for the user to see why.
          let message = 'Cloudinary upload failed.';
          try {
            const errorBody = JSON.parse(xhr.responseText);
            message = errorBody?.error?.message || message;
          } catch {
            // response wasn't JSON — keep the generic message
          }
          reject(new Error(message));
        }
      };

      xhr.onerror = () => reject(new Error('Cloudinary upload failed — check your connection.'));
      xhr.send(formData);
    });
  }
}
