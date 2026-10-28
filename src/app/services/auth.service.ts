import { hasExpiredJwt } from '../core/security/session';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, finalize, of, shareReplay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = `${environment.apiUrl}/auth`;
  // A short, per-session cache avoids a new approval-status request for every
  // click in the member menu. The API, not this cache, enforces permissions.
  private readonly flowStatusCacheMs = 12_000;
  private cachedFlow: { token: string; at: number; value: any } | null = null;
  private pendingFlow: { token: string; request: Observable<any> } | null = null;

  constructor(private http: HttpClient) {}

  register(data: any) {
    return this.http.post<any>(`${this.baseUrl}/register`, data);
  }
login(data: { mobile: string; dob: string }) {
  return this.http.post<any>(`${this.baseUrl}/login`, data);
}

getUserFlowStatus(forceRefresh = false): Observable<any> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('matrimony_token') || '' : '';
  if (!forceRefresh && this.cachedFlow?.token === token &&
      Date.now() - this.cachedFlow.at < this.flowStatusCacheMs) {
    return of(this.cachedFlow.value);
  }
  if (!forceRefresh && this.pendingFlow?.token === token) {
    return this.pendingFlow.request;
  }
  const request = this.http.get<any>(`${environment.apiUrl}/profile/flow-status`).pipe(
    tap(response => {
      if (response?.success && response?.data &&
          (typeof localStorage === 'undefined' || localStorage.getItem('matrimony_token') === token)) {
        this.cachedFlow = { token, at: Date.now(), value: response };
        if (typeof localStorage !== 'undefined' && response.data.profileStatus) {
          localStorage.setItem('profile_status', String(response.data.profileStatus));
        }
      }
    }),
    finalize(() => { if (this.pendingFlow?.request === request) this.pendingFlow = null; }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  this.pendingFlow = { token, request };
  return request;
}

invalidateFlowStatus(): void {
  this.cachedFlow = null;
  this.pendingFlow = null;
}

adminLogin(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.baseUrl}/admin-login`, data);
  }

  getProfile() {
    return this.http.get<any>(`${this.baseUrl}/profile`, {
      headers: this.getAuthHeaders()
    });
  }

getAuthHeaders(): HttpHeaders {
  const token = typeof window === 'undefined' ? '' : localStorage.getItem('matrimony_token') || '';

  return new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
}
getCurrentUserId(): string {
  const raw = typeof window === 'undefined' ? null : localStorage.getItem('matrimony_user');

  try {
    const user = raw ? JSON.parse(raw) : null;

    return (
      user?.user_id ||
      user?._id ||
      user?.id ||
      ''
    );
  } catch {
    return '';
  }
}
saveUserSession(data: any): void {
  this.invalidateFlowStatus();
  const userSession = {
    ...data.user,
    user_id: data.user?._id || data.user?.id || '',
    profile_id: data.profile?._id || '',
    profile_code: data.profile?.profileCode || '',

    fullName: data.profile?.basic?.fullName?.en || '',
    mobile: data.profile?.basic?.mobile || data.user?.mobile || '',
    dob: data.profile?.basic?.dob || data.user?.dob || '',
    email: data.profile?.basic?.email || '',
    gender: data.profile?.basic?.gender || '',
    age: data.profile?.basic?.age || '',
    religion: data.profile?.religion?.religion || '',
    location: data.profile?.address?.city || '',
    profileFor: data.profile?.basic?.profileFor || ''
  };

localStorage.setItem('matrimony_token', data.token);
localStorage.setItem('matrimony_user', JSON.stringify(userSession));
localStorage.setItem('matrimony_profile', JSON.stringify(data.profile || {}));
}
  saveAdminSession(data: any): void {
    localStorage.setItem('admin_token', data.token);
    localStorage.setItem('is_admin', 'true');
    localStorage.setItem('admin_name', data.admin?.name || 'Admin');
    localStorage.setItem('admin_email', data.admin?.email || '');
    localStorage.setItem('admin_id', data.admin?.id || data.admin?._id || '');
    localStorage.setItem('admin_role', data.admin?.role || 'admin');
  }

logout(): void {
  this.invalidateFlowStatus();
  localStorage.removeItem('matrimony_token');
  localStorage.removeItem('matrimony_user');
  localStorage.removeItem('matrimony_profile');
  localStorage.removeItem('matrimony_user_id');
  localStorage.removeItem('matrimony_profile_id');
  localStorage.removeItem('biodata_pending');
  localStorage.removeItem('profile_status');
  localStorage.removeItem('user_flow_state');
}

  adminLogout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('admin_id');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('isAdmin');
  }

isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('matrimony_token');
  return !!token && !hasExpiredJwt(token);
}

  isAdminLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      localStorage.getItem('is_admin') === 'true' &&
      !!localStorage.getItem('admin_token') &&
      !hasExpiredJwt(localStorage.getItem('admin_token') || '')
    );
  }
}