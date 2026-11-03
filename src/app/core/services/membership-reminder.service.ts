
import { Injectable, inject } from '@angular/core';
import {
  Router,
  NavigationEnd
} from '@angular/router';
import { filter, firstValueFrom } from 'rxjs';

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

  start(): void {
    if (
      this.started ||
      typeof window === 'undefined'
    ) {
      return;
    }

    this.started = true;

    // Check when the user navigates to a new page.
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        )
      )
      .subscribe(event => {
        void this.checkNotification(event.urlAfterRedirects);
      });

    // Handle a root component initialized after navigation.
    if (this.router.navigated) {
      void this.checkNotification(this.router.url);
    }
  }

  private get currentLang(): 'en' | 'ta' {
    return this.language.currentLang;
  }

  private message(en: string, ta: string): string {
    return this.currentLang === 'ta' ? ta : en;
  }

  private async checkNotification(url: string): Promise<void> {
    const version = ++this.requestVersion;

    const path = url.split('?')[0].split('#')[0];

    // Never show member reminders on admin or login pages.
    if (
      path.startsWith('/admin') ||
      [
        '/login',
        '/register',
        '/forgot-password'
      ].includes(path)
    ) {
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.lastNotificationKey = '';
      return;
    }

    try {
      // Force a fresh server check on navigation.
      const response = await firstValueFrom(
        this.auth.getUserFlowStatus(true)
      );

      if (version !== this.requestVersion) {
        return;
      }

      if (!this.auth.isLoggedIn()) {
        return;
      }

      if (!response?.success || !response?.data) {
        return;
      }

      const flow = response.data;
      const status = String(
        flow.profileStatus || 'not_created'
      ).toLowerCase();

      let type: 'success' | 'error' = 'success';
      let notification = '';
      let notificationStatus = '';

      // 1. Biodata incomplete.
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

      // 2. Waiting for admin approval.
      else if (status === 'pending') {
        notificationStatus = 'pending';

        notification = this.message(
          'Your biodata has been submitted. Please wait for admin approval before subscribing.',
          'உங்கள் பயோடேட்டா சமர்ப்பிக்கப்பட்டுள்ளது. உறுப்பினர் திட்டத்தைப் பெறுவதற்கு முன் நிர்வாகியின் ஒப்புதலுக்காக காத்திருக்கவும்.'
        );
      }

      // 3. Rejected.
      else if (status === 'rejected') {
        notificationStatus = 'rejected';
        type = 'error';

        notification = this.message(
          'Your biodata needs corrections. Please update and resubmit it for admin approval.',
          'உங்கள் பயோடேட்டாவில் திருத்தங்கள் தேவை. திருத்தி நிர்வாகி ஒப்புதலுக்காக மீண்டும் சமர்ப்பிக்கவும்.'
        );
      }

      // 4. Approved member without active subscription.
      else if (
        flow.adminApproved === true &&
        flow.hasActivePlan === false
      ) {
        notificationStatus = 'subscribe';

        // This requires hasEverSubscribed from the backend
        // to distinguish an expired plan from no plan.
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

      // 5. Active plan: no reminder.
      else if (
        flow.adminApproved === true &&
        flow.hasActivePlan === true
      ) {
        this.lastNotificationKey = '';
        return;
      }

      if (!notification) {
        return;
      }

      // Avoid duplicate notifications for the same page,
      // status and language.
      const key = [
        path,
        notificationStatus,
        this.currentLang
      ].join('|');

      if (this.lastNotificationKey === key) {
        return;
      }

      this.lastNotificationKey = key;

      if (type === 'error') {
        this.snackbar.error(notification);
      } else {
        this.snackbar.success(notification);
      }

    } catch (error) {
      console.error(
        'Membership reminder check failed:',
        error
      );

      // Do not guess account status if the API fails.
    }
  }
}
