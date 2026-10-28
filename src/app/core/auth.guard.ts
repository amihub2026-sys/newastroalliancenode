import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom, timeout } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { hasExpiredJwt } from './security/session';

/**
 * This guard is a navigation convenience only. Back-end routes MUST check
 * ownership, approval, subscription and onboarding token scope separately.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  if (typeof window === 'undefined') return true; // SSR routes aren't authenticated here

  const token = localStorage.getItem('matrimony_token');
  const user = localStorage.getItem('matrimony_user');
  if (!token || !user || hasExpiredJwt(token)) {
    return router.createUrlTree(['/login']);
  }

  const path = state.url.split('?')[0];
  // Own Biodata is a special case: permit the page shell immediately for any
  // authenticated applicant. GET /profile/me MUST validate token + ownership.
  // This allows pending applicants to view their own submitted details.
  if (path === '/my-biodata') return true;

  // Never rely on cached localStorage flags to grant access after registration.
  // A network failure fails closed rather than using stale approval status.
  let flow: any;
  try {
    const response = await firstValueFrom(auth.getUserFlowStatus().pipe(timeout({ first: 8000 })));
    flow = response?.data;
    if (!response?.success || !flow) throw new Error('Missing server flow status');
  } catch (error: any) {
    // A slow/offline API is not the same thing as an expired login.
    if (error?.status === 401) return router.createUrlTree(['/login']);
    return router.createUrlTree(['/connection-error'], { queryParams: { returnUrl: path } });
  }

  const status = String(flow.profileStatus || '').toLowerCase();
  const approved = status === 'approved' && flow.isPublished === true;
  const awaitingPublication = status === 'approved' && !approved;

  if (path === '/biodata') {
    return approved || ['draft', 'not_created', 'rejected'].includes(status)
      ? true : router.createUrlTree(['/approval-pending']);
  }
  if (path === '/approval-pending') {
    return status === 'pending' || awaitingPublication ? true
      : router.createUrlTree([approved ? '/dashboard' : status === 'rejected' ? '/profile-rejected' : '/biodata']);
  }
  if (path === '/profile-rejected') {
    return status === 'rejected' ? true
      : router.createUrlTree([approved ? '/dashboard' : status === 'pending' || awaitingPublication ? '/approval-pending' : '/biodata']);
  }
  if (path === '/my-biodata') {
    // A member may view their own saved Biodata before publication or payment.
    // The backend must still check that this is the authenticated user's record.
    return approved || ['pending', 'rejected'].includes(status)
      ? true : router.createUrlTree(['/biodata']);
  }
  if (approved) return true; // Basic approved member access; payment guards full details server-side.
  if (status === 'pending' || awaitingPublication) return router.createUrlTree(['/approval-pending']);
  if (status === 'rejected') return router.createUrlTree(['/profile-rejected']);
  return router.createUrlTree(['/biodata']);
};
