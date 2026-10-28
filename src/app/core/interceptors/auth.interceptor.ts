import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (typeof window === 'undefined') return next(request);
  const api = new URL(environment.apiUrl, window.location.origin);
  const target = new URL(request.url, window.location.origin);
  const prefix = api.pathname.replace(/\/$/, '');
  if (
    target.origin !== api.origin ||
    !(target.pathname === prefix || target.pathname.startsWith(`${prefix}/`))
  ) {
    return next(request);
  }
  // Explicit headers are retained for shared admin/customer screens.
  if (request.headers.has('Authorization')) return next(request);
  const path = target.pathname.slice(prefix.length);
  const adminRequest =
    path.startsWith('/admin/') ||
    window.location.pathname.startsWith('/admin/') ||
    (window.location.pathname.includes('biodata') &&
      (new URLSearchParams(window.location.search).get('adminCreate') === 'true' ||
        new URLSearchParams(window.location.search).has('id')));
  const token = localStorage.getItem(adminRequest ? 'admin_token' : 'matrimony_token');
  return next(
    token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request,
  );
};
