
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
// RAZORPAY RESPONSES
// ==========================================

interface RazorpayOrderResponse {
  success: boolean;
  data?: {
    keyId: string;
    orderId: string;
    amount: number;
    currency: string;
    plan: {
      planId: string;
    };
  };
}

interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  data?: {
    subscriptionId: string;
    paymentStatus: string;
  };
}

// ==========================================
// COMPONENT
// ==========================================

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
        miniTitle:
          'CHOOSE YOUR PERFECT MEMBERSHIP',

        title:
          'Affordable Matrimony Plans for Every Journey',

        subtitle:
          'Review available membership plans and continue viewing profiles. Premium details require an active membership.'
      },

      section: {
        title: 'Our Membership Plans',

        subtitle:
          'Choose the best plan for your matrimony journey'
      },

      labels: {
        mostPopular: 'Most Popular',

        choosePlan: 'Choose Plan',

        unlockTitle:
          'Unlock Full Profile Access',

        unlockText:
          'Choose a membership plan and complete payment to access eligible premium profile details.',

        selectedProfile: 'Selected Profile',

        profileId: 'Profile ID',

        backToProfiles: 'Back to Profiles',

        activatedTitle: 'Membership activated',

        activatedText:
          'Your verified membership gives you access to eligible premium details. Contact credits still apply.',

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

        unlockTitle:
          'முழு சுயவிவர அணுகலை திறக்கவும்',

        unlockText:
          'உறுப்பினர் திட்டத்தைத் தேர்வு செய்து கட்டணம் செலுத்திய பிறகு அனுமதிக்கப்பட்ட கூடுதல் சுயவிவர விவரங்களைப் பார்க்கலாம்.',

        selectedProfile:
          'தேர்ந்தெடுத்த சுயவிவரம்',

        profileId: 'சுயவிவர எண்',

        backToProfiles:
          'சுயவிவரங்களுக்கு திரும்பு',

        activatedTitle:
          'உறுப்பினர் திட்டம் செயல்படுத்தப்பட்டது',

        activatedText:
          'உறுதிப்படுத்தப்பட்ட உறுப்பினர் திட்டத்தின் மூலம் அனுமதிக்கப்பட்ட கூடுதல் விவரங்களைப் பார்க்கலாம். தொடர்பு எண்ணுக்கான கிரெடிட்கள் பொருந்தும்.',

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
      localStorage.getItem(
        'registration_fee_pending'
      ) === 'true';

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

    return (
      value?.[this.currentLang] ||
      value?.en ||
      ''
    );

  }

  getFeatures(features: any): string[] {

    return (
      features?.[this.currentLang] ||
      features?.en ||
      []
    );

  }

  // ==========================================
  // LOAD RAZORPAY CHECKOUT SCRIPT
  // ==========================================

  private loadRazorpayScript(): Promise<boolean> {

    if (!this.isBrowser) {
      return Promise.resolve(false);
    }

    if ((window as any).Razorpay) {
      return Promise.resolve(true);
    }

    return new Promise(resolve => {

      const script =
        document.createElement('script');

      let settled = false;

      const finish = (ok: boolean) => {

        if (settled) {
          return;
        }

        settled = true;

        window.clearTimeout(timeoutId);

        script.onload = null;
        script.onerror = null;

        if (!ok) {
          script.remove();
        }

        resolve(ok);

      };

      const timeoutId = window.setTimeout(
        () => finish(false),
        20000
      );

      script.src =
        'https://checkout.razorpay.com/v1/checkout.js';

      script.async = true;

      script.onload = () => {

        finish(
          !!(window as any).Razorpay
        );

      };

      script.onerror = () => {

        finish(false);

      };

      document.body.appendChild(script);

    });

  }

  // ==========================================
  // LOAD CURRENT ACTIVE MEMBERSHIP
  // ==========================================

  async loadCurrentPlan(): Promise<boolean> {

    if (!this.isBrowser) {
      return false;
    }

    const token =
      localStorage.getItem('matrimony_token');

    if (!token) {

      this.activePlanId = null;
      this.activePlanName = '';

      return false;

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

      // PREVENT UPDATING A DIFFERENT USER SESSION

      if (
        localStorage.getItem('matrimony_token') !== token
      ) {
        return false;
      }

      if (!response?.success) {

        throw new Error(
          'Membership status unavailable'
        );

      }

      this.ngZone.run(() => {

        this.activePlanId =
          response.data?.is_active
            ? String(response.data.plan_id)
            : null;

        this.activePlanName = (

          this.currentLang === 'ta'

            ? response.data?.plan_name_ta ||
              response.data?.plan_name

            : response.data?.plan_name

        ) || '';

        this.cdr.detectChanges();

      });

      return true;

    } catch (error) {

      console.error(
        'Unable to load active plan:',
        error
      );

      this.ngZone.run(() => {

        this.snackbar.error(

          this.currentLang === 'ta'

            ? 'தற்போதைய உறுப்பினர் திட்டத்தை சரிபார்க்க முடியவில்லை.'

            : 'Could not verify your current membership.'

        );

      });

      return false;

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

          .filter(
            plan => plan.isActive !== false
          )

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
  // PLAN HELPERS
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

      return (
        nameEn === normalizedName ||
        nameTa === normalizedName
      );

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

  // ==========================================
  // REFRESH VERIFIED OR RECOVERED MEMBERSHIP
  // ==========================================

  private async refreshVerifiedMembership(

    expectedPlanId: string,

    recovered: boolean,

    token: string

  ): Promise<void> {

    if (
      localStorage.getItem('matrimony_token') !== token
    ) {
      return;
    }

    // CLEAR OLD MEMBERSHIP STATUS CACHE

    this.ngZone.run(() => {

      this.auth.invalidateFlowStatus();

    });

    // LOAD CURRENT MEMBERSHIP FROM BACKEND

    const refreshed =
      await this.loadCurrentPlan();

    if (
      localStorage.getItem('matrimony_token') !== token
    ) {
      return;
    }

    this.ngZone.run(() => {

      if (
        refreshed &&
        this.activePlanId === expectedPlanId
      ) {

        const active = this.plans.find(
          p => String(p.code) === expectedPlanId
        );

        this.selectedPlanName =

          this.getText(active?.name) ||

          this.activePlanName;

        // ======================================
        // PAYMENT SUCCESS MESSAGE
        // ======================================

        this.snackbar.success(

          this.currentLang === 'ta'

            ? (

                recovered

                  ? 'முந்தைய கட்டணம் மீட்டெடுக்கப்பட்டது. உறுப்பினர் திட்டம் செயல்பாட்டில் உள்ளது.'

                  : 'கட்டணம் வெற்றி! உறுப்பினர் திட்டம் செயல்பாட்டில் உள்ளது.'

              )

            : (

                recovered

                  ? 'Previous payment recovered. Your membership is active.'

                  : 'Payment successful! Your membership is now active.'

              )

        );

      } else {

        this.selectedPlanName = '';

        this.snackbar.error(

          this.currentLang === 'ta'

            ? 'கட்டணம் உறுதிப்படுத்தப்பட்டது. உறுப்பினர் நிலையைச் சரிபார்க்கவும். மீண்டும் பணம் செலுத்த வேண்டாம்.'

            : 'Payment verified. Membership status needs confirmation. Do not pay again; contact support.'

        );

      }

      this.cdr.detectChanges();

    });

  }

  // ==========================================
  // REAL RAZORPAY CHECKOUT
  // ==========================================

  async selectPlan(plan: any): Promise<void> {

    // ==========================================
    // PREVENT DUPLICATE BUTTON CLICK
    // ==========================================

    if (

      !this.isBrowser ||

      !plan ||

      plan.disabled ||

      this.isSavingPlan

    ) {

      return;

    }

    // ==========================================
    // CHECK MEMBER LOGIN
    // ==========================================

    const token =
      localStorage.getItem('matrimony_token');

    const ta = () =>
      this.currentLang === 'ta';

    if (!token) {

      this.snackbar.error(

        ta()

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

    // ==========================================
    // VALIDATE SELECTED MEMBERSHIP PLAN
    // ==========================================

    const planId =
      String(plan.code || '');

    const amount =
      Math.round(Number(plan.priceAmount) * 100);

    if (

      !/^[a-fA-F0-9]{24}$/.test(planId) ||

      !Number.isSafeInteger(amount) ||

      amount < 100

    ) {

      this.snackbar.error(

        ta()

          ? 'தவறான உறுப்பினர் திட்டம்'

          : 'Invalid membership plan'

      );

      return;

    }

    // PREVENT PURCHASING SAME ACTIVE PLAN

    if (this.activePlanId === planId) {
      return;
    }

    // ==========================================
    // PAYMENT LOADING STATE
    // ==========================================

    this.ngZone.run(() => {

      this.isSavingPlan = true;

      this.activatingPlanId = planId;

      this.selectedPlanName = '';

      this.cdr.detectChanges();

    });

    const headers = {

      Authorization: `Bearer ${token}`

    };

    let checkoutStarted = false;

    let verifyingPayment = false;

    try {

      // ========================================
      // REFRESH CURRENT ACTIVE MEMBERSHIP
      // ========================================

      if (!await this.loadCurrentPlan()) {
        return;
      }

      if (
        localStorage.getItem('matrimony_token') !== token
      ) {
        return;
      }

      if (this.activePlanId === planId) {

        this.auth.invalidateFlowStatus();

        this.snackbar.success(

          ta()

            ? 'இந்தத் திட்டம் ஏற்கனவே செயல்பாட்டில் உள்ளது.'

            : 'This plan is already active.'

        );

        return;

      }

      // ========================================
      // CONFIRM EXISTING MEMBERSHIP REPLACEMENT
      // ========================================

      if (

        this.activePlanId &&

        !window.confirm(

          ta()

            ? 'புதிய திட்டம் தற்போதைய திட்டத்தையும் மீதமுள்ள கிரெடிட்களையும் மாற்றும். தொடரவா?'

            : 'The new plan will replace your current membership and remaining credits. Continue?'

        )

      ) {

        return;

      }

      // ========================================
      // LOAD RAZORPAY SCRIPT
      // ========================================

      const razorpayLoaded =
        await this.loadRazorpayScript();

      if (!razorpayLoaded) {

        throw new Error(
          'Unable to load Razorpay'
        );

      }

      if (
        localStorage.getItem('matrimony_token') !== token
      ) {
        return;
      }

      // ========================================
      // CREATE OR REUSE RAZORPAY ORDER
      // ========================================

      const response = await firstValueFrom(

        this.http.post<RazorpayOrderResponse>(

          `${environment.apiUrl}/payment/create-order`,

          {

            planId

          },

          {

            headers

          }

        )

      );

      const order = response?.data;

      // ========================================
      // VALIDATE SERVER ORDER
      // ========================================

      if (

        !response?.success ||

        !order ||

        !order.keyId ||

        typeof order.orderId !== 'string' ||

        !order.orderId.startsWith('order_') ||

        !Number.isSafeInteger(order.amount) ||

        order.amount < 100 ||

        order.currency !== 'INR' ||

        String(order.plan?.planId) !== planId

      ) {

        throw new Error(
          'Invalid server order'
        );

      }

      if (
        localStorage.getItem('matrimony_token') !== token
      ) {
        return;
      }

      // ========================================
      // CHECK IF PLAN PRICE HAS CHANGED
      // ========================================

      if (order.amount !== amount) {

        this.snackbar.error(

          ta()

            ? 'திட்டத்தின் விலை மாறியுள்ளது. மீண்டும் சரிபார்க்கவும்.'

            : 'The plan price has changed. Review the updated price before paying.'

        );

        await this.loadDbPlans();

        return;

      }

      // ========================================
      // OPEN RAZORPAY CHECKOUT
      // ========================================

      const result = await new Promise<
        RazorpayPaymentResult | null
      >((resolve, reject) => {

        const Razorpay =
          (window as any).Razorpay;

        const checkout = new Razorpay({

          key: order.keyId,

          order_id: order.orderId,

          amount: order.amount,

          currency: order.currency,

          name: 'Astro Alliance Matrimony',

          description:
            this.getText(plan.name),

          image: new URL(

            'assets/malogo.png',

            document.baseURI

          ).href,

          // ====================================
          // RAZORPAY SUCCESS CALLBACK
          // ====================================

          handler: (
            payment: RazorpayPaymentResult
          ) => {

            if (

              !payment ||

              payment.razorpay_order_id !==
                order.orderId ||

              !payment.razorpay_payment_id ||

              !payment.razorpay_signature

            ) {

              reject(
                new Error(
                  'Incomplete checkout response'
                )
              );

              return;

            }

            resolve(payment);

          },

          // ====================================
          // CHECKOUT WINDOW CLOSED
          // ====================================

          modal: {

            confirm_close: true,

            ondismiss: () => {

              resolve(null);

            }

          },

          // ENABLE PAYMENT RETRY

          retry: {

            enabled: true

          },

          // ASTRO ALLIANCE BRAND COLOR

          theme: {

            color: '#800020'

          }

        });

        checkoutStarted = true;

        checkout.open();

      });

      // ========================================
      // CHECKOUT CANCELLED
      // ========================================

      if (!result) {

        this.ngZone.run(() => {

          this.snackbar.error(

            ta()

              ? 'கட்டண சாளரம் மூடப்பட்டது. பணம் பிடித்திருந்தால் மீண்டும் செலுத்த வேண்டாம்.'

              : 'Checkout closed. If money was deducted, do not pay again; contact support.'

          );

        });

        return;

      }

      // ========================================
      // VERIFY RAZORPAY PAYMENT ON BACKEND
      // ========================================

      verifyingPayment = true;

      if (
        localStorage.getItem('matrimony_token') !== token
      ) {

        throw new Error(
          'Session changed'
        );

      }

      const verified = await firstValueFrom(

        this.http.post<VerifyPaymentResponse>(

          `${environment.apiUrl}/payment/verify-payment`,

          result,

          {

            headers

          }

        )

      );

      // ========================================
      // CHECK PAYMENT VERIFICATION RESPONSE
      // ========================================

      if (

        !verified?.success ||

        verified.data?.paymentStatus !== 'paid' ||

        !verified.data.subscriptionId

      ) {

        throw new Error(
          'Payment verification pending'
        );

      }

      // ========================================
      // REFRESH VERIFIED MEMBERSHIP
      // ========================================

      await this.refreshVerifiedMembership(

        planId,

        false,

        token

      );

    } catch (error: any) {

      console.error(

        'Payment flow error:',

        error?.status || error?.message

      );

      const body = error?.error;

      if (
        localStorage.getItem('matrimony_token') !== token
      ) {
        return;
      }

      // ========================================
      // RECOVER PREVIOUSLY CAPTURED PAYMENT
      // ========================================

      if (

        !checkoutStarted &&

        error?.status === 409 &&

        body?.code === 'PAYMENT_RECOVERED' &&

        body?.data?.paymentStatus === 'paid' &&

        body.data.subscriptionId &&

        typeof body.data.planId === 'string'

      ) {

        await this.refreshVerifiedMembership(

          body.data.planId,

          true,

          token

        );

        return;

      }

      // ========================================
      // PAYMENT VERIFICATION PENDING
      // ========================================

      if (

        verifyingPayment ||

        checkoutStarted

      ) {

        this.ngZone.run(() => {

          this.snackbar.error(

            ta()

              ? 'கட்டணத்தை உறுதிப்படுத்த முடியவில்லை. மீண்டும் பணம் செலுத்தாமல் நிர்வாகியை தொடர்பு கொள்ளவும்.'

              : 'Payment status is uncertain. Do not pay again; contact support.'

          );

        });

        return;

      }

      // ========================================
      // REFRESH MEMBERSHIP ON PAYMENT CONFLICT
      // ========================================

      if (error?.status === 409) {

        this.auth.invalidateFlowStatus();

        await this.loadCurrentPlan();

      }

      let message: string;

      // ========================================
      // PROFILE APPROVAL REQUIRED
      // ========================================

      if (
        body?.code === 'PROFILE_NOT_APPROVED'
      ) {

        message = ta()

          ? 'உறுப்பினர் திட்டத்தை வாங்க உங்கள் சுயவிவரம் ஒப்புதல் பெற வேண்டும்.'

          : 'Your profile must be approved before purchasing a membership.';

      }

      // ========================================
      // PENDING OR DUPLICATE PAYMENT
      // ========================================

      else if (error?.status === 409) {

        message = ta()

          ? 'முந்தைய கட்டணம் அல்லது உறுப்பினர் நிலையை சரிபார்க்கவும். தேவைப்பட்டால் நிர்வாகியை தொடர்பு கொள்ளவும்.'

          : (

              typeof body?.message === 'string'

                ? body.message

                : 'Check your previous payment or contact support before paying again.'

            );

      }

      // ========================================
      // AUTHENTICATION ERROR
      // ========================================

      else if (

        error?.status === 401 ||

        error?.status === 403

      ) {

        message = ta()

          ? 'உறுப்பினர் அனுமதியை சரிபார்க்கவும்.'

          : 'Please check your member login and eligibility.';

      }

      // ========================================
      // GENERAL PAYMENT ERROR
      // ========================================

      else {

        message = ta()

          ? 'கட்டணத்தை தொடங்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'

          : 'Unable to start payment. Please try again.';

      }

      this.ngZone.run(() => {

        this.snackbar.error(message);

      });

    } finally {

      // ========================================
      // RESET PAYMENT LOADING STATE
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

    const code = String(

      this.lockedProfileId || ''

    ).trim();

    void this.router.navigate(

      code

        ? ['/free-profile', code]

        : ['/free-search']

    );

  }

}
