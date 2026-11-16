
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
      miniTitle: 'FIND YOUR PERFECT MATCH',

      title: 'Choose Your Membership Plan',

      subtitle:
        'Browse profiles for free. Choose a membership plan to access additional profile details and membership benefits.'
    },

    section: {
      title: 'Our Membership Plans',

      subtitle:
        'Choose a membership plan that suits your needs.'
    },

    labels: {
      mostPopular: 'Most Popular',

      choosePlan: 'Choose Plan',

      unlockTitle: 'Unlock Additional Profile Details',

      unlockText:
        'Choose a membership plan and complete your payment. Contact numbers and addresses require contact credits.',

      selectedProfile: 'Selected Profile',

      profileId: 'Profile ID',

      backToProfiles: 'Back to Profiles',

      activatedTitle: 'Membership Activated Successfully!',

      activatedText:
        'Your membership is active. You can now view eligible additional profile details. Use your contact credits to unlock mobile numbers and addresses.',

      viewProfile: 'View Profile'
    }
  },

  ta: {
    hero: {
      miniTitle: 'உங்களுக்கு பொருத்தமான வரனை தேடுங்கள்',

      title: 'மெம்பர்ஷிப் பிளானை தேர்வு செய்யுங்கள்',

      subtitle:
        'இலவசமாக வரன்களை பார்க்கலாம். கூடுதல் பயோடேட்டா விவரங்களை பார்க்க மெம்பர்ஷிப் பிளானை தேர்வு செய்யுங்கள்.'
    },

    section: {
      title: 'எங்கள் மெம்பர்ஷிப் பிளான்கள்',

      subtitle:
        'உங்களுக்கு ஏற்ற மெம்பர்ஷிப் பிளானை தேர்வு செய்யுங்கள்.'
    },

    labels: {
      mostPopular: 'அதிகம் தேர்வு செய்யப்படும் பிளான்',

      choosePlan: 'பிளானை தேர்வு செய்யுங்கள்',

      unlockTitle: 'கூடுதல் பயோடேட்டா விவரங்களை பார்க்க',

      unlockText:
        'மெம்பர்ஷிப் பிளானை தேர்வு செய்து பேமெண்ட் செய்யுங்கள். மொபைல் நம்பர் மற்றும் முகவரியை பார்க்க காண்டாக்ட் கிரெடிட்ஸ் தேவை.',

      selectedProfile: 'தேர்வு செய்த பயோடேட்டா',

      profileId: 'பயோடேட்டா எண்',

      backToProfiles: 'மற்ற வரன்களை பார்க்க',

      activatedTitle: 'மெம்பர்ஷிப் ஆக்டிவாகிவிட்டது!',

      activatedText:
        'உங்கள் மெம்பர்ஷிப் ஆக்டிவாக உள்ளது. இனி கூடுதல் பயோடேட்டா விவரங்களை பார்க்கலாம். மொபைல் நம்பர் மற்றும் முகவரியை பார்க்க காண்டாக்ட் கிரெடிட்ஸை பயன்படுத்துங்கள்.',

      viewProfile: 'பயோடேட்டாவை பார்க்க'
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
      ? 'உங்கள் தற்போதைய மெம்பர்ஷிப் விவரங்களை சரிபார்க்க முடியவில்லை. புதிய பிளான் வாங்குவதற்கு முன் மீண்டும் முயற்சி செய்யுங்கள்.'

      : 'Unable to verify your current membership. Please try again before purchasing a new plan.',

    this.currentLang === 'ta'
      ? 'மெம்பர்ஷிப்பை சரிபார்க்க முடியவில்லை'
      : 'Unable to verify membership'
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
    ? 'தற்போது மெம்பர்ஷிப் பிளான்களை பார்க்க முடியவில்லை. இந்த பக்கத்தை ரெஃப்ரெஷ் செய்து மீண்டும் முயற்சி செய்யுங்கள்.'
    : 'Unable to load membership plans at the moment. Please refresh this page and try again.',

  this.currentLang === 'ta'
    ? 'மெம்பர்ஷிப் பிளான்களை பார்க்க முடியவில்லை'
    : 'Unable to load membership plans'
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
          ? 'உங்கள் முந்தைய பேமெண்ட் சரிபார்க்கப்பட்டது. உங்கள் மெம்பர்ஷிப் ஆக்டிவாக உள்ளது. மீண்டும் பேமெண்ட் செய்ய தேவையில்லை.'
          : 'உங்கள் பேமெண்ட் வெற்றிகரமாக முடிந்தது. மெம்பர்ஷிப் ஆக்டிவாகிவிட்டது. இனி உங்களுக்கு பொருத்தமான வரன்களின் கூடுதல் விவரங்களை பார்க்கலாம். மொபைல் நம்பர் மற்றும் முகவரியை பார்க்க காண்டாக்ட் கிரெடிட்ஸ் தேவை.'
      )
    : (
        recovered
          ? 'Your previous payment has been verified. Your membership is active. You do not need to pay again.'
          : 'Your payment is successful and your membership is now active. You can view eligible additional profile details. Contact credits are required to unlock mobile numbers and addresses.'
      ),

  this.currentLang === 'ta'
    ? (
        recovered
          ? 'முந்தைய பேமெண்ட் உறுதி செய்யப்பட்டது!'
          : 'பேமெண்ட் வெற்றிகரமாக முடிந்தது!'
      )
    : (
        recovered
          ? 'Previous payment verified!'
          : 'Payment successful!'
      )
);

      } else {

        this.selectedPlanName = '';

  this.snackbar.warning(
  this.currentLang === 'ta'
    ? 'உங்கள் பேமெண்ட் உறுதி செய்யப்பட்டுள்ளது. ஆனால் மெம்பர்ஷிப் ஆக்டிவானதா என்பதை இன்னும் உறுதி செய்ய முடியவில்லை. மீண்டும் பேமெண்ட் செய்ய வேண்டாம். எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
    : 'Your payment has been verified, but membership activation could not be confirmed. Please do not pay again. Contact our support team for assistance.',

  this.currentLang === 'ta'
    ? 'பேமெண்ட் உறுதி செய்யப்பட்டுள்ளது'
    : 'Membership confirmation pending'
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

this.snackbar.info(
  ta()
    ? 'மெம்பர்ஷிப் பிளானை வாங்க முதலில் உங்கள் மொபைல் நம்பர் மற்றும் பிறந்த தேதியை பயன்படுத்தி லாகின் செய்யுங்கள்.'
    : 'To purchase a membership plan, please log in using your registered mobile number and date of birth.',

  ta()
    ? 'லாகின் செய்யுங்கள்'
    : 'Login required'
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

this.snackbar.warning(
  ta()
    ? 'நீங்கள் தேர்வு செய்த மெம்பர்ஷிப் பிளானை தற்போது வாங்க முடியவில்லை. இந்த பக்கத்தை ரெஃப்ரெஷ் செய்து மீண்டும் பிளானை தேர்வு செய்யுங்கள்.'
    : 'The selected membership plan is currently unavailable for purchase. Please refresh this page and select a plan again.',

  ta()
    ? 'மெம்பர்ஷிப் பிளான் கிடைக்கவில்லை'
    : 'Membership plan unavailable'
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

  this.snackbar.info(
  ta()
    ? 'நீங்கள் தேர்வு செய்த மெம்பர்ஷிப் பிளான் ஏற்கனவே ஆக்டிவாக உள்ளது. மீண்டும் பேமெண்ட் செய்ய தேவையில்லை. இந்த பிளானில் உள்ள வசதிகளை தொடர்ந்து பயன்படுத்தலாம்.'
    : 'Your selected membership plan is already active. You do not need to pay again. You can continue using your existing membership benefits.',

  ta()
    ? 'மெம்பர்ஷிப் ஏற்கனவே ஆக்டிவாக உள்ளது'
    : 'Membership already active'
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
    ? 'உங்களிடம் ஏற்கனவே ஒரு மெம்பர்ஷிப் பிளான் ஆக்டிவாக உள்ளது. புதிய பிளானை வாங்கினால் பழைய பிளானும் அதில் மீதமுள்ள கிரெடிட்ஸும் நீக்கப்படும். புதிய பிளானை வாங்க விரும்புகிறீர்களா?'
    : 'You already have an active membership plan. Purchasing a new plan will replace your existing plan and its remaining credits. Do you want to continue?'
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

this.snackbar.warning(
  ta()
    ? 'நீங்கள் தேர்வு செய்த மெம்பர்ஷிப் பிளானின் விலை மாறியுள்ளது. புதிய விலையை சரிபார்த்து, மீண்டும் பிளானை தேர்வு செய்து பேமெண்ட் செய்யுங்கள்.'
    : 'The price of your selected membership plan has changed. Please review the updated price and select the plan again before making payment.',

  ta()
    ? 'மெம்பர்ஷிப் பிளான் விலை மாற்றம்'
    : 'Membership plan price updated'
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

       this.snackbar.warning(
  ta()
    ? 'பேமெண்ட் விண்டோ மூடப்பட்டுள்ளது. உங்கள் வங்கி கணக்கிலிருந்து பணம் எடுக்கப்பட்டிருந்தால் மீண்டும் பேமெண்ட் செய்ய வேண்டாம். எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
    : 'The payment window was closed. If money has been deducted from your bank account, please do not pay again. Contact our support team for assistance.',

  ta()
    ? 'பேமெண்ட் விண்டோ மூடப்பட்டது'
    : 'Payment window closed'
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

this.snackbar.warning(
  ta()
    ? 'உங்கள் பேமெண்ட் நிலையை இன்னும் உறுதி செய்ய முடியவில்லை. மீண்டும் பேமெண்ட் செய்ய வேண்டாம். உங்கள் பேமெண்ட் விவரங்களுடன் எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
    : 'We are unable to confirm your payment status at the moment. Please do not pay again. Contact our support team with your payment details.',

  ta()
    ? 'பேமெண்ட் உறுதிப்படுத்தப்படவில்லை'
    : 'Payment confirmation pending'
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
    ? 'உங்கள் பயோடேட்டாவிற்கு அட்மின் அப்ரூவல் கிடைத்த பிறகுதான் மெம்பர்ஷிப் பிளானை வாங்க முடியும். அதுவரை இலவசமாக வரன்களை பார்க்கலாம்.'
    : 'You can purchase a membership plan only after your biodata receives admin approval. Until then, you can continue browsing profiles through Free Search.';

}

// ========================================
// PENDING OR DUPLICATE PAYMENT
// ========================================

else if (error?.status === 409) {

  message = ta()
    ? 'உங்கள் முந்தைய பேமெண்ட் அல்லது மெம்பர்ஷிப் நிலையை சரிபார்க்க வேண்டியுள்ளது. மீண்டும் பேமெண்ட் செய்வதற்கு முன் எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
    : (
        typeof body?.message === 'string'
          ? body.message
          : 'Your previous payment or membership status needs to be checked. Please contact our support team before making another payment.'
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
    ? 'உங்கள் அக்கவுண்ட்டில் பேமெண்ட் செய்ய அனுமதி கிடைக்கவில்லை. மீண்டும் லாகின் செய்து முயற்சி செய்யுங்கள். தொடர்ந்து இந்த பிரச்சனை இருந்தால் எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
    : 'Your account is currently not authorized to make this payment. Please log in again and try. If the issue continues, contact our support team.';

}
// ========================================
// GENERAL PAYMENT ERROR
// ========================================

else {

  message = ta()
    ? 'தற்போது பேமெண்ட்டை தொடங்க முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சி செய்யுங்கள். தொடர்ந்து இந்த பிரச்சனை இருந்தால் எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
    : 'Unable to start your payment at the moment. Please try again after some time. If the issue continues, contact our support team.';

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
