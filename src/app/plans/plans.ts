
import {
  Component,
  inject,
  PLATFORM_ID,
  OnInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { LanguageService } from '../core/services/language.service';
import { SnackbarService } from '../shared/snackbar.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

// ==========================================
// DATABASE PLAN INTERFACE
// ==========================================

interface DbPlanRow {
  _id?: string;
  planNameEn: string;
  planNameTa: string;
  price: number;
  durationInDays: number;
  featuresEn: string[];
  featuresTa: string[];
  profileViewLimit: number;
  contactLimit: number;
  isActive: boolean;
}

// ==========================================
// ACTIVE SUBSCRIPTION RESPONSE
// ==========================================

interface ActiveSubscriptionResponse {
  success: boolean;
  data: {
    plan_id: string;
    plan_name: string;
    plan_name_ta?: string;
    is_active: boolean;
  } | null;
}

// ==========================================
// DEVELOPMENT ACTIVATION RESPONSE
// ==========================================

interface DevActivationResponse {
  success: boolean;
  message: string;
  data?: {
    plan_id: string;
    plan_name: string;
    is_active: boolean;
    subscription_status_id: string;
    end_date: string;
  };
}

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plans.html',
  styleUrls: ['./plans.scss']
})
export class Plans implements OnInit {

  // ==========================================
  // SERVICES
  // ==========================================

  app = inject(LanguageService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  private readonly ngZone = inject(NgZone);
  private readonly auth = inject(AuthService);

  private readonly snackbar = inject(SnackbarService);
  private readonly http = inject(HttpClient);

  platformId = inject(PLATFORM_ID);

  isBrowser = isPlatformBrowser(this.platformId);

  // ==========================================
  // PAGE STATE
  // ==========================================

  fromPage = '';
  lockedProfileId = '';
  lockedProfileName = '';

  showProfileUnlockBanner = false;

  // ==========================================
  // MEMBERSHIP STATE
  // ==========================================

  activePlanId: string | null = null;
  activePlanName = '';

  isSavingPlan = false;
  activatingPlanId: string | null = null;

  selectedPlanName = '';
  isLoadingDbPlans = false;

  registrationFeePending = false;
  registrationFeePlanAmount = 500;

  dbPlans: DbPlanRow[] = [];
  plans: any[] = [];

  // ==========================================
  // TRANSLATIONS
  // ==========================================

  translations = {
    en: {
      hero: {
        miniTitle: 'CHOOSE YOUR PERFECT MEMBERSHIP',
        title: 'Affordable Matrimony Plans for Every Journey',
        subtitle:
          'Review available membership plans and continue viewing profiles. Premium details require an active membership.'
      },

      section: {
        title: 'Our Membership Plans',
        subtitle: 'Choose the best plan for your matrimony journey'
      },

      labels: {
        mostPopular: 'Most Popular',
        choosePlan: 'Choose Plan',

        unlockTitle: 'Unlock Full Profile Access',

        unlockText:
          'You can open this profile now. Full details require an existing active membership or an admin-assigned plan. Online payments are not connected yet.',

        selectedProfile: 'Selected Profile',
        profileId: 'Profile ID',
        backToProfiles: 'Back to Profiles',

        activatedTitle: 'Plan selected',

        activatedText:
          'You can now continue to view the full profile and access premium details.',

        viewProfile: 'View Profile'
      }
    },

    ta: {
      hero: {
        miniTitle:
          'உங்களுக்கு பொருத்தமான உறுப்பினர் திட்டத்தை தேர்வு செய்யுங்கள்',

        title:
          'ஒவ்வொரு திருமண பயணத்திற்கும் மலிவான மேட்ரிமோனி திட்டங்கள்',

        subtitle:
          'உறுப்பினர் திட்டங்களைப் பார்த்து சுயவிவரங்களைத் தொடரலாம். கூடுதல் விவரங்களுக்கு செயலில் உள்ள உறுப்பினர் திட்டம் தேவை.'
      },

      section: {
        title: 'எங்கள் உறுப்பினர் திட்டங்கள்',

        subtitle:
          'உங்கள் திருமண பயணத்திற்கான சிறந்த திட்டத்தை தேர்வு செய்யுங்கள்'
      },

      labels: {
        mostPopular: 'பிரபலமானது',

        choosePlan: 'திட்டத்தை தேர்வு செய்க',

        unlockTitle: 'முழு சுயவிவர அணுகலை திறக்கவும்',

        unlockText:
          'இந்தச் சுயவிவரத்தை இப்போதே திறக்கலாம். முழு விவரங்களுக்கு செயலில் உள்ள உறுப்பினர் திட்டம் அல்லது நிர்வாகி வழங்கிய அனுமதி தேவை. ஆன்லைன் கட்டணம் இன்னும் இணைக்கப்படவில்லை.',

        selectedProfile: 'தேர்ந்தெடுத்த சுயவிவரம்',

        profileId: 'சுயவிவர எண்',

        backToProfiles: 'சுயவிவரங்களுக்கு திரும்பு',

        activatedTitle: 'திட்டம் தேர்ந்தெடுக்கப்பட்டது',

        activatedText:
          'கட்டணம் சரிபார்க்கப்பட்ட அல்லது நிர்வாகி செயல்படுத்திய பின்னரே திட்டம் நடைமுறைக்கு வரும்.',

        viewProfile: 'சுயவிவரம் பார்க்க'
      }
    }
  };

  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor() {
    this.route.queryParamMap.subscribe(params => {

      this.fromPage =
        params.get('from') || '';

      this.lockedProfileId =
        params.get('profileId') || '';

      this.lockedProfileName =
        params.get('profileName') || '';

      this.showProfileUnlockBanner =
        this.fromPage === 'profiles';

    });
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  async ngOnInit(): Promise<void> {

    if (!this.isBrowser) {
      return;
    }

    this.registrationFeePending =
      localStorage.getItem('registration_fee_pending') === 'true';

    await this.loadDbPlans();

    await this.loadCurrentPlan();
  }

  // ==========================================
  // LANGUAGE
  // ==========================================

  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  get tr() {
    return this.translations[this.currentLang];
  }

  getText(value: any): string {

    if (typeof value === 'string') {
      return value;
    }

    return value?.[this.currentLang] ||
      value?.en ||
      '';
  }

  getFeatures(features: any): string[] {

    return features?.[this.currentLang] ||
      features?.en ||
      [];
  }

  // ==========================================
  // LOGGED-IN USER
  // ==========================================

  private getLoggedInUserId(): string | null {

    if (!this.isBrowser) {
      return null;
    }

    try {

      const raw =
        localStorage.getItem('matrimony_user') ||
        localStorage.getItem('user') ||
        localStorage.getItem('loggedInUser');

      if (!raw) {
        return localStorage.getItem('app_user_id');
      }

      const parsed = JSON.parse(raw);

      return String(
        parsed.user_id ||
        parsed._id ||
        parsed.id ||
        parsed.userId ||
        parsed.data?._id ||
        parsed.data?.id ||
        parsed.data?.user_id ||
        ''
      ) || null;

    } catch {
      return localStorage.getItem('app_user_id');
    }
  }

  // ==========================================
  // LOAD CURRENT ACTIVE PLAN
  // ==========================================

  async loadCurrentPlan(): Promise<void> {

    if (!this.isBrowser) {
      return;
    }

    const token =
      localStorage.getItem('matrimony_token');

    if (!token) {
      this.activePlanId = null;
      this.activePlanName = '';
      return;
    }

    try {

      const response = await firstValueFrom(
        this.http.get<ActiveSubscriptionResponse>(
          `${environment.apiUrl}/subscription/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      );

      this.ngZone.run(() => {

        this.activePlanId =
          response.success &&
          response.data?.is_active
            ? String(response.data.plan_id)
            : null;

        this.activePlanName =
          response.data?.plan_name || '';

        this.cdr.detectChanges();
      });

    } catch (error) {

      console.error(
        'Unable to load active plan:',
        error
      );

      this.snackbar.error(
        this.currentLang === 'ta'
          ? 'தற்போதைய உறுப்பினர் திட்டத்தை சரிபார்க்க முடியவில்லை.'
          : 'Could not verify your current membership.'
      );
    }
  }

  // ==========================================
  // LOAD MEMBERSHIP PLANS FROM MONGODB
  // ==========================================

  async loadDbPlans(): Promise<void> {

    this.isLoadingDbPlans = true;

    try {

      const res: any = await firstValueFrom(
        this.http.get<any>(
          `${environment.apiUrl}/masters/plans`
        )
      );

      const rows: DbPlanRow[] =
        Array.isArray(res?.data)
          ? res.data
          : [];

      this.ngZone.run(() => {

        this.dbPlans = rows;

        this.plans = rows
          .filter(plan => plan.isActive !== false)
          .map(plan => {

            const price =
              Number(plan.price || 0);

            const durationDays =
              Number(plan.durationInDays || 0);

            const durationMonths =
              Math.round(durationDays / 30);

            return {
              code: plan._id,

              name: {
                en: plan.planNameEn,
                ta: plan.planNameTa
              },

              priceAmount: price,

              price: `₹${price}`,

              disabled: false,

              duration: {
                en: `/ ${durationMonths} Months`,
                ta: `/ ${durationMonths} மாதங்கள்`
              },

              validity: {
                en: `Validity: ${durationMonths} Months`,
                ta: `செல்லுபடியாகும் காலம்: ${durationMonths} மாதங்கள்`
              },

              popular: price === 500,

              features: {
                en: plan.featuresEn?.length
                  ? plan.featuresEn
                  : [
                      `Profile Views - ${plan.profileViewLimit || 0}`,
                      `Contacts Taken - ${plan.contactLimit || 0}`
                    ],

                ta: plan.featuresTa?.length
                  ? plan.featuresTa
                  : [
                      `ப்ரொபைல் பார்வை - ${plan.profileViewLimit || 0}`,
                      `தொடர்புகள் - ${plan.contactLimit || 0}`
                    ]
              },

              contactLimit:
                plan.contactLimit || 0,

              profileViewLimit:
                plan.profileViewLimit || 0,

              durationInDays:
                durationDays
            };
          });

        this.isLoadingDbPlans = false;

        this.cdr.detectChanges();
      });

    } catch (error) {

      console.error(
        'Load plans error:',
        error
      );

      this.ngZone.run(() => {

        this.dbPlans = [];
        this.plans = [];

        this.isLoadingDbPlans = false;

        this.cdr.detectChanges();
      });

      this.snackbar.error(
        this.currentLang === 'ta'
          ? 'உறுப்பினர் திட்டங்களை ஏற்ற முடியவில்லை.'
          : 'Failed to load membership plans.'
      );
    }
  }

  // ==========================================
  // RETURN TO PROFILES
  // ==========================================

  goBackToProfiles(): void {
    void this.router.navigate(['/profiles']);
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private normalize(
    value: string | null | undefined
  ): string {

    return String(value || '')
      .trim()
      .toLowerCase();
  }

  private getDbPlanByName(
    planName: string
  ): DbPlanRow | undefined {

    const normalizedName =
      this.normalize(planName);

    return this.dbPlans.find(p => {

      const nameEn =
        this.normalize(p.planNameEn);

      const nameTa =
        this.normalize(p.planNameTa);

      return nameEn === normalizedName ||
        nameTa === normalizedName;
    });
  }

  getPlanLimit(planName: string): number {

    const plan =
      this.getDbPlanByName(planName);

    return plan?.contactLimit || 0;
  }

  getPlanDays(planName: string): number {

    const plan =
      this.getDbPlanByName(planName);

    return plan?.durationInDays || 0;
  }

  private addDays(
    dateStr: string,
    days: number
  ): string {

    const date = new Date(dateStr);

    date.setDate(
      date.getDate() + days
    );

    return date.toISOString().slice(0, 10);
  }

  // ==========================================
  // SELECT / ACTIVATE MEMBERSHIP PLAN
  // ==========================================

  async selectPlan(plan: any): Promise<void> {

    // ------------------------------------------
    // PREVENT DUPLICATE ACTIVATION
    // ------------------------------------------

    if (
      plan.disabled ||
      this.isSavingPlan ||
      this.activePlanId === String(plan.code)
    ) {
      return;
    }

    if (!this.isBrowser) {
      return;
    }

    // ------------------------------------------
    // CHECK MEMBER LOGIN
    // ------------------------------------------

    const token =
      localStorage.getItem('matrimony_token');

    if (!token) {

      this.snackbar.error(
        this.currentLang === 'ta'
          ? 'முதலில் உள்நுழையவும்'
          : 'Please log in first'
      );

      await this.router.navigate(
        ['/login'],
        {
          queryParams: {
            from: this.fromPage || 'plans',
            profileId: this.lockedProfileId || ''
          }
        }
      );

      return;
    }

    // ------------------------------------------
    // VALIDATE PLAN
    // ------------------------------------------

    if (!plan.code) {

      this.snackbar.error(
        this.currentLang === 'ta'
          ? 'தவறான உறுப்பினர் திட்டம்'
          : 'Invalid membership plan'
      );

      return;
    }

    // ==========================================
    // FIX: LOCAL DEVELOPMENT CHECK
    // ==========================================
    //
    // This must stay INSIDE selectPlan().
    //
    // The backend intentionally disables
    // /subscription/dev-activate in production.
    //
    // Do not use development activation to
    // bypass real membership payments.
    // ==========================================

   

    // ==========================================
    // LOADING STATE
    // ==========================================

    this.ngZone.run(() => {

      this.isSavingPlan = true;

      this.activatingPlanId =
        String(plan.code);

      this.cdr.detectChanges();
    });

    try {

      // ========================================
      // DEVELOPMENT-ONLY ACTIVATION
      // ========================================

      const response = await firstValueFrom(
        this.http.post<DevActivationResponse>(
          `${environment.apiUrl}/subscription/free-activate`,
          {
            planId: plan.code
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      );

      const activated = response.data;

      // ========================================
      // VERIFY ACTIVATION RESPONSE
      // ========================================

      if (
        !response.success ||
        !activated?.is_active ||
        activated.subscription_status_id !== 'ACTIVE' ||
        String(activated.plan_id) !== String(plan.code)
      ) {

        throw new Error(
          response.message ||
          'Activation was not confirmed'
        );
      }

      // ========================================
      // UPDATE ACTIVE PLAN
      // ========================================

      this.ngZone.run(() => {

        this.selectedPlanName =
          this.getText(plan.name);

        this.activePlanId =
          String(activated.plan_id);

        this.activePlanName =
          String(activated.plan_name || '');

        // Clear cached membership / approval status.
        this.auth.invalidateFlowStatus();

        this.cdr.detectChanges();
      });

      // ========================================
      // SUCCESS MESSAGE
      // ========================================

      this.snackbar.success(
  this.currentLang === 'ta'
    ? 'உறுப்பினர் திட்டம் வெற்றிகரமாக செயல்படுத்தப்பட்டது'
    : 'Membership activated successfully'
);

      // Remain on the plans page.
      // Backend controls profile permissions.

    } catch (error: any) {

      console.error(
        'Plan activation failed:',
        error
      );

      const status = error?.status;

   const localizedMessage =
  status === 403
    ? (
        this.currentLang === 'ta'
          ? 'இலவச உறுப்பினர் திட்ட செயல்பாடு அனுமதிக்கப்படவில்லை.'
          : 'Free membership activation is disabled. Please contact the administrator.'
      )
    : status === 409
      ? (
          this.currentLang === 'ta'
            ? 'ஏற்கனவே செயலில் உள்ள உறுப்பினர் திட்டம் உள்ளது.'
            : 'You already have an active membership. Contact admin to change it.'
        )
      : (
          this.currentLang === 'ta'
            ? 'உறுப்பினர் திட்டத்தை செயல்படுத்த முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
            : 'Unable to activate membership. Please try again.'
        );
      this.snackbar.error(localizedMessage);

    } finally {

      // ========================================
      // RESET LOADING STATE
      // ========================================

      this.ngZone.run(() => {

        this.isSavingPlan = false;

        this.activatingPlanId = null;

        this.cdr.detectChanges();
      });
    }
  }

  // ==========================================
  // OPEN SELECTED PROFILE
  // ==========================================

  goToProfile(): void {

    // Basic profiles remain publicly accessible.
    // Premium details require backend authorization.

    const code =
      String(this.lockedProfileId || '').trim();

    void this.router.navigate(
      code
        ? ['/free-profile', code]
        : ['/free-search']
    );
  }
}
