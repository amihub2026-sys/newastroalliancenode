
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

// ==========================================
// TESTIMONIAL MODEL
// ==========================================

export interface Testimonial {
  _id: string;

  coupleNameEnglish: string;
  coupleNameTamil: string;

  reviewEnglish: string;
  reviewTamil: string;

  photoUrl: string;

  rating: number;

  weddingDate: string | null;

  published: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// TESTIMONIAL PAYLOAD
// ==========================================

export interface TestimonialPayload {
  coupleNameEnglish: string;
  coupleNameTamil: string;

  reviewEnglish: string;
  reviewTamil: string;

  photoUrl: string;

  rating: number;

  weddingDate: string | null;

  published: boolean;
}

// ==========================================
// API RESPONSE
// ==========================================

export interface TestimonialApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface TestimonialUploadResponse {
  success: boolean;
  message: string;
  url: string;
}

// ==========================================
// TESTIMONIAL SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {

  private readonly baseUrl =
    `${environment.apiUrl}/testimonials`;

  constructor(
    private http: HttpClient
  ) {}

  // ========================================
  // ADMIN AUTHENTICATION
  // ========================================

  private getAdminAuthHeaders(): HttpHeaders {

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('admin_token') || ''
        : '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ========================================
  // PUBLIC — GET PUBLISHED TESTIMONIALS
  // ========================================

  getPublished(): Observable<
    TestimonialApiResponse<Testimonial[]>
  > {

    return this.http.get<
      TestimonialApiResponse<Testimonial[]>
    >(
      `${this.baseUrl}/public`
    );
  }

  // ========================================
  // ADMIN — GET ALL TESTIMONIALS
  // ========================================

  getAll(): Observable<
    TestimonialApiResponse<Testimonial[]>
  > {

    return this.http.get<
      TestimonialApiResponse<Testimonial[]>
    >(
      this.baseUrl,
      {
        headers: this.getAdminAuthHeaders()
      }
    );
  }

  // ========================================
  // ADMIN — CREATE TESTIMONIAL
  // ========================================

  create(
    data: TestimonialPayload
  ): Observable<
    TestimonialApiResponse<Testimonial>
  > {

    return this.http.post<
      TestimonialApiResponse<Testimonial>
    >(
      this.baseUrl,
      data,
      {
        headers: this.getAdminAuthHeaders()
      }
    );
  }

  // ========================================
  // ADMIN — UPDATE TESTIMONIAL
  // ========================================

  update(
    id: string,
    data: Partial<TestimonialPayload>
  ): Observable<
    TestimonialApiResponse<Testimonial>
  > {

    return this.http.put<
      TestimonialApiResponse<Testimonial>
    >(
      `${this.baseUrl}/${encodeURIComponent(id)}`,
      data,
      {
        headers: this.getAdminAuthHeaders()
      }
    );
  }

  // ========================================
  // ADMIN — DELETE TESTIMONIAL
  // ========================================

  delete(
    id: string
  ): Observable<
    TestimonialApiResponse<null>
  > {

    return this.http.delete<
      TestimonialApiResponse<null>
    >(
      `${this.baseUrl}/${encodeURIComponent(id)}`,
      {
        headers: this.getAdminAuthHeaders()
      }
    );
  }

  // ========================================
  // ADMIN — UPLOAD COUPLE PHOTO TO R2
  // ========================================

  uploadPhoto(
    file: File
  ): Observable<TestimonialUploadResponse> {

    const formData = new FormData();

    formData.append(
      'file',
      file,
      file.name
    );

    return this.http.post<TestimonialUploadResponse>(
      `${this.baseUrl}/upload`,
      formData,
      {
        headers: this.getAdminAuthHeaders()
      }
    );
  }

}
