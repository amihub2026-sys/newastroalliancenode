import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { environment } from '../../../environments/environment';
describe('API credential boundaries', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()] });
    localStorage.setItem('matrimony_token', 'customer-token');
    localStorage.setItem('admin_token', 'admin-token');
  });
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); localStorage.clear(); });
  it('sends customer credentials to payment verification', () => {
    TestBed.inject(HttpClient).post(`${environment.apiUrl}/payments/verify`, {}).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/payments/verify`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer customer-token');
    request.flush({});
  });
  it('never sends account tokens to an external origin', () => {
    TestBed.inject(HttpClient).get('https://example.org/admin/profiles').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('https://example.org/admin/profiles');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
  it('selects the admin credential for admin endpoints', () => {
    TestBed.inject(HttpClient).get(`${environment.apiUrl}/admin/accounts`).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/admin/accounts`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer admin-token');
    request.flush({});
  });
});
