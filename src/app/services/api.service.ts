import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    if (typeof window === 'undefined') return new HttpHeaders();
    const adminMode = window.location.pathname.startsWith('/admin/') ||
      new URLSearchParams(window.location.search).get('adminCreate') === 'true' ||
      new URLSearchParams(window.location.search).has('id');
    const token = localStorage.getItem(adminMode ? 'admin_token' : 'matrimony_token') || '';
    if (!token) return new HttpHeaders();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getMyProfile() {
    return this.http.get<any>(
      `${this.baseUrl}/profile/me`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateBiodata(data: any) {
    return this.http.put<any>(
      `${this.baseUrl}/profile/biodata`,
      data,
      { headers: this.getAuthHeaders() }
    );
  }
  checkAdminProfileExists(mobile: string, dob: string) {
  return this.http.post<any>(
    `${this.baseUrl}/admin/profiles/check-existing`,
    {
      mobile,
      dob
    },
    { headers: this.getAuthHeaders() }
  );
}
createBiodataByAdmin(data: any) {
  return this.http.post<any>(
    `${this.baseUrl}/admin/profiles/create`,
    data,
    { headers: this.getAuthHeaders() }
  );
}

updateBiodataByAdmin(profileId: string, data: any) {
  return this.http.put<any>(
    `${this.baseUrl}/admin/profiles/${profileId}`,
    data,
    { headers: this.getAuthHeaders() }
  );
}
getAdminProfileById(profileId: string) {
  return this.http.get<any>(
    `${this.baseUrl}/admin/profiles/${profileId}`,
    { headers: this.getAuthHeaders() }
  );
}
uploadFile(formData: FormData) {
  return this.http.post<any>(
    `${this.baseUrl}/upload`,
    formData,
    { headers: this.getAuthHeaders() }
  );
}
}