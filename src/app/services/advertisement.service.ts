
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// ==========================================
// ADVERTISEMENT MODEL
// ==========================================

export interface Advertisement {
  _id: string;

  // ENGLISH ADVERTISEMENT TITLE
  title: string;

  // TAMIL ADVERTISEMENT TITLE
  // Optional for older advertisements
  titleTamil?: string;

  imageUrl: string;
  destinationUrl: string;

  placement:
    | 'home-banner'
    | 'between-profiles'
    | 'home-bottom';

  device:
    | 'all'
    | 'desktop'
    | 'mobile';

  startDate: string | null;
  endDate: string | null;

  published: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// CREATE / UPDATE PAYLOAD
// ==========================================

export interface AdvertisementPayload {

  // ENGLISH TITLE
  title: string;

  // TAMIL TITLE
  titleTamil: string;

  imageUrl: string;
  destinationUrl: string;

  placement: Advertisement['placement'];
  device: Advertisement['device'];

  startDate: string | null;
  endDate: string | null;

  published: boolean;
}

// ==========================================
// API RESPONSE
// ==========================================

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ==========================================
// ADVERTISEMENT SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class AdvertisementService {

  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly baseUrl =
    `${environment.apiUrl}/advertisements`;

  // ========================================
  // ADMIN — GET ALL ADVERTISEMENTS
  // ========================================

  getAll(): Observable<ApiResponse<Advertisement[]>> {

    return this.http.get<ApiResponse<Advertisement[]>>(
      this.baseUrl,
      {
        headers: this.auth.getAdminAuthHeaders()
      }
    );
  }

  // ========================================
  // PUBLIC — GET PUBLISHED ADVERTISEMENTS
  // ========================================

  getPublished(
    placement?: Advertisement['placement'],
    device?: 'desktop' | 'mobile'
  ): Observable<ApiResponse<Advertisement[]>> {

    const params: Record<string, string> = {};

    if (placement) {
      params['placement'] = placement;
    }

    if (device) {
      params['device'] = device;
    }

    return this.http.get<ApiResponse<Advertisement[]>>(
      `${this.baseUrl}/public`,
      {
        params
      }
    );
  }

  // ========================================
  // ADMIN — CREATE ADVERTISEMENT
  // ========================================

  create(
    data: AdvertisementPayload
  ): Observable<ApiResponse<Advertisement>> {

    return this.http.post<ApiResponse<Advertisement>>(
      this.baseUrl,
      data,
      {
        headers: this.auth.getAdminAuthHeaders()
      }
    );
  }

  // ========================================
  // ADMIN — UPDATE ADVERTISEMENT
  // ========================================

  update(
    id: string,
    data: Partial<AdvertisementPayload>
  ): Observable<ApiResponse<Advertisement>> {

    return this.http.put<ApiResponse<Advertisement>>(
      `${this.baseUrl}/${encodeURIComponent(id)}`,
      data,
      {
        headers: this.auth.getAdminAuthHeaders()
      }
    );
  }

  // ========================================
  // ADMIN — DELETE ADVERTISEMENT
  // ========================================

  delete(id: string): Observable<ApiResponse<null>> {

    return this.http.delete<ApiResponse<null>>(
      `${this.baseUrl}/${encodeURIComponent(id)}`,
      {
        headers: this.auth.getAdminAuthHeaders()
      }
    );
  }

  // ========================================
  // ADMIN — SECURE BANNER UPLOAD TO R2
  // ========================================

  uploadBanner(file: File): Observable<{
    success: boolean;
    url: string;
    message?: string;
  }> {

    const formData = new FormData();

    formData.append('file', file);

    return this.http.post<{
      success: boolean;
      url: string;
      message?: string;
    }>(
      `${this.baseUrl}/upload`,
      formData,
      {
        headers: this.auth.getAdminAuthHeaders()
      }
    );
  }
}
