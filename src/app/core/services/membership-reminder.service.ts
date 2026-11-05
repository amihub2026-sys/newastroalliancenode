
import { Injectable, inject } from '@angular/core';

import {
  Router,
  NavigationEnd
} from '@angular/router';

import {
  filter,
  firstValueFrom
} from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { LanguageService } from './language.service';
import { SnackbarService } from '../../shared/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class MembershipReminderService {

  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  private readonly snackbar = inject(SnackbarService);

  private started = false;
  private requestVersion = 0;
  private lastNotificationKey = '';

  // ==========================================
  // START MEMBERSHIP NOTIFICATIONS
  // ==========================================

  start(): void {

    if (
      this.started ||
      typeof window === 'undefined'
    ) {
      return;
    }

    this.started = true;

    // Check whenever navigation completes.
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(event => {

        const url = event.urlAfterRedirects;

        // Invalidate any earlier pending request
        // before checking the new route.
        ++this.requestVersion;

        if (this.isExcludedRoute(url)) {
          return;
        }

        void this.checkNotification(url);
      });

    // Handle the initial route if navigation
    // completed before this service started.
    if (this.router.navigated) {

      const url = this.router.url;

      if (!this.isExcludedRoute(url)) {
        void this.checkNotification(url);
      }
    }
  }

  // ==========================================
  // LANGUAGE
  // ==========================================

  private get currentLang(): 'en' | 'ta' {
    return this.language.currentLang;
  }

  private message(
    en: string,
    ta: string
  ): string {

    return this.currentLang === 'ta'
      ? ta
      : en;
  }

  // ==========================================
  // NORMALIZE URL
  // ==========================================

  private getPath(url: string): string {

    return (url || '/')
      .split('?')[0]
      .split('#')[0]
      .replace(/\/+$/, '') || '/';
  }

  // ==========================================
  // ROUTES THAT MUST NEVER SHOW
  // MEMBERSHIP NOTIFICATIONS
  // ==========================================

  private isExcludedRoute(url: string): boolean {

    const path = this.getPath(url);

    // Entire admin workspace is excluded:
    // /admin
    // /admin/profiles
    // /admin/plans
    // /admin/subscriptions
    // /admin/profile/...
    // /admin-login
    if (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      path === '/admin-login'
    ) {
      return true;
    }

    // Authentication pages.
    if (
      [
        '/login',
        '/register',
        '/forgot-password'
      ].includes(path)
    ) {
      return true;
    }

    return false;
  }

  // ==========================================
  // ENSURE MEMBER NOTIFICATION
  // IS STILL ALLOWED
  // ==========================================

  private canShowNotification(
    version: number
  ): boolean {

    // Ignore outdated asynchronous responses.
    if (version !== this.requestVersion) {
      return false;
    }

    // Important:
    // Recheck the ACTUAL current route.
    // A member request could finish after
    // navigating to the admin dashboard.
    if (this.isExcludedRoute(this.router.url)) {
      return false;
    }

    // Never show without an active member session.
    if (!this.auth.isLoggedIn()) {
      return false;
    }

    return true;
  }

  // ==========================================
  // CHECK MEMBER STATUS
  // ==========================================

  private async checkNotification(
    url: string
  ): Promise<void> {

    const version = ++this.requestVersion;

    const path = this.getPath(url);

    // 1. Never run on excluded pages.
    if (this.isExcludedRoute(url)) {
      return;
    }

    // 2. Ignore the request if navigation
    // has already moved to another page.
    if (this.getPath(this.router.url) !== path) {
      return;
    }

    // 3. Member login required.
    if (!this.auth.isLoggedIn()) {
      this.lastNotificationKey = '';
      return;
    }

    try {

      // Existing backend endpoint.
      // Force a fresh check on navigation.
      const response = await firstValueFrom(
        this.auth.getUserFlowStatus(true)
      );

      // 4. Check again AFTER awaiting API.
      // This is the important admin-page fix.
      if (!this.canShowNotification(version)) {
        return;
      }

      if (this.getPath(this.router.url) !== path) {
        return;
      }

      if (
        !response?.success ||
        !response?.data
      ) {
        return;
      }

      const flow = response.data;

      const status = String(
        flow.profileStatus || 'not_created'
      ).toLowerCase();

      let type: 'success' | 'error' = 'success';

      let notification = '';
      let notificationStatus = '';

      // ======================================
      // 1. BIODATA INCOMPLETE
      // ======================================

      if (
        flow.hasProfile !== true ||
        status === 'not_created' ||
        status === 'draft'
      ) {

        notificationStatus = 'incomplete';

        notification = this.message(
          'Complete your biodata to become eligible for membership and find your life partner.',
          'உறுப்பினர் திட்டத்தைப் பெறவும், உங்கள் வாழ்க்கைத்துணையை கண்டறியவும் உங்கள் பயோடேட்டாவை பூர்த்தி செய்யுங்கள்.'
        );
      }

      // ======================================
      // 2. WAITING FOR ADMIN APPROVAL
      // ======================================

      else if (status === 'pending') {

        notificationStatus = 'pending';

        notification = this.message(
          'Your biodata has been submitted. Please wait for admin approval before subscribing.',
          'உங்கள் பயோடேட்டா சமர்ப்பிக்கப்பட்டுள்ளது. உறுப்பினர் திட்டத்தைப் பெறுவதற்கு முன் நிர்வாகியின் ஒப்புதலுக்காக காத்திருக்கவும்.'
        );
      }

      // ======================================
      // 3. BIODATA REJECTED
      // ======================================

      else if (status === 'rejected') {

        notificationStatus = 'rejected';

        type = 'error';

        notification = this.message(
          'Your biodata needs corrections. Please update and resubmit it for admin approval.',
          'உங்கள் பயோடேட்டாவில் திருத்தங்கள் தேவை. திருத்தி நிர்வாகி ஒப்புதலுக்காக மீண்டும் சமர்ப்பிக்கவும்.'
        );
      }

      // ======================================
      // 4. APPROVED — NO ACTIVE MEMBERSHIP
      // ======================================

      else if (
        flow.adminApproved === true &&
        flow.hasActivePlan === false
      ) {

        notificationStatus = 'subscribe';

        // Preserve existing expired-plan behavior.
        // Requires the backend to return
        // hasEverSubscribed === true.
        if (flow.hasEverSubscribed === true) {

          notificationStatus = 'expired';

          notification = this.message(
            'Your membership has expired. Renew to view full biodata, send interests and access accepted contacts.',
            'உங்கள் உறுப்பினர் திட்டம் காலாவதியானது. முழு பயோடேட்டாவைப் பார்க்கவும், விருப்பக் கோரிக்கைகளை அனுப்பவும், ஏற்றுக்கொள்ளப்பட்ட தொடர்புகளை அணுகவும் புதுப்பிக்கவும்.'
          );

        } else {

          notification = this.message(
            'Subscribe to view full biodata, send interests and connect with your future partner.',
            'முழு பயோடேட்டாவைப் பார்க்கவும், விருப்பக் கோரிக்கைகளை அனுப்பவும், உங்கள் வாழ்க்கைத்துணையுடன் இணையவும் உறுப்பினர் திட்டத்தைப் பெறுங்கள்.'
          );
        }
      }

      // ======================================
      // 5. ACTIVE MEMBERSHIP
      // NO NOTIFICATION
      // ======================================

      else if (
        flow.adminApproved === true &&
        flow.hasActivePlan === true
      ) {

        this.lastNotificationKey = '';
        return;
      }

      // No relevant reminder.
      if (!notification) {
        return;
      }

      // ======================================
      // DUPLICATE NOTIFICATION PROTECTION
      // ======================================

      const key = [
        path,
        notificationStatus,
        this.currentLang
      ].join('|');

      if (this.lastNotificationKey === key) {
        return;
      }

      // ======================================
      // FINAL SECURITY / NAVIGATION CHECK
      // ======================================

      // Do not display any notification if
      // an admin navigation happened while
      // processing the membership result.
      if (!this.canShowNotification(version)) {
        return;
      }

      if (this.getPath(this.router.url) !== path) {
        return;
      }

      this.lastNotificationKey = key;

      // ======================================
      // DISPLAY BILINGUAL SNACKBAR
      // ======================================

      if (type === 'error') {

        this.snackbar.error(notification);

      } else {

        this.snackbar.success(notification);
      }

    } catch (error) {

      // Avoid surfacing unnecessary errors
      // after leaving the page.
      if (!this.canShowNotification(version)) {
        return;
      }

      console.error(
        'Membership reminder check failed:',
        error
      );

      // Do not guess account status if
      // the backend request fails.
    }
  }
}
