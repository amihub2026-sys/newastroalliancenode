import { hasExpiredJwt } from './security/session';
import { inject } from '@angular/core';
import {
  CanActivateFn,
  CanActivateChildFn,
  Router
} from '@angular/router';

export const adminGuard: CanActivateFn & CanActivateChildFn = () => {
  const router = inject(Router);

  if (typeof window === 'undefined') return true;

  const isAdmin = localStorage.getItem('is_admin') === 'true';
  const token = localStorage.getItem('admin_token');

  if (isAdmin && token && !hasExpiredJwt(token)) return true;

  return router.createUrlTree(['/admin-login']);
};