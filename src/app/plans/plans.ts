import {
  Component,
  inject,
  PLATFORM_ID,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../core/services/language.service';
import { SnackbarService } from '../shared/snackbar.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
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

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plans.html',
  styleUrls: ['./plans.scss']
})
export class Plans implements OnInit {
  app = inject(LanguageService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  platformId = inject(PLATFORM_ID);
  isBrowser = isPlatformBrowser(this.platformId);

  fromPage = '';
  lockedProfileId = '';
  lockedProfileName = '';
  showProfileUnlockBanner = false;

  isSavingPlan = false;
  selectedPlanName = ''; // cosmetic selection only: never an entitlement
  isLoadingDbPlans = false;
  registrationFeePending = false;
registrationFeePlanAmount = 500;

  dbPlans: DbPlanRow[] = [];

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
        miniTitle: 'உங்களுக்கு பொருத்தமான உறுப்பினர் திட்டத்தை தேர்வு செய்யுங்கள்',
        title: 'ஒவ்வொரு திருமண பயணத்திற்கும் மலிவான மேட்ரிமோனி திட்டங்கள்',
        subtitle:
          'உறுப்பினர் திட்டங்களைப் பார்த்து சுயவிவரங்களைத் தொடரலாம். கூடுதல் விவரங்களுக்கு செயலில் உள்ள உறுப்பினர் திட்டம் தேவை.'
      },
      section: {
        title: 'எங்கள் உறுப்பினர் திட்டங்கள்',
        subtitle: 'உங்கள் திருமண பயணத்திற்கான சிறந்த திட்டத்தை தேர்வு செய்யுங்கள்'
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

plans: any[] = [];

  constructor(
  private snackbar: SnackbarService,
  private http: HttpClient
) {
    this.route.queryParamMap.subscribe(params => {
      this.fromPage = params.get('from') || '';
      this.lockedProfileId = params.get('profileId') || '';
      this.lockedProfileName = params.get('profileName') || '';
      this.showProfileUnlockBanner = this.fromPage === 'profiles';
    });
  }

async ngOnInit(): Promise<void> {
  if (!this.isBrowser) return;

  this.registrationFeePending =
    localStorage.getItem('registration_fee_pending') === 'true';

  await this.loadDbPlans();
}

  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  get tr() {
    return this.translations[this.currentLang];
  }

  getText(value: any): string {
    if (typeof value === 'string') return value;
    return value?.[this.currentLang] || value?.en || '';
  }

  getFeatures(features: any): string[] {
    return features?.[this.currentLang] || features?.en || [];
  }

private getLoggedInUserId(): string | null {
  if (!this.isBrowser) return null;

  try {
    const raw =
      localStorage.getItem('matrimony_user') ||
      localStorage.getItem('user') ||
      localStorage.getItem('loggedInUser');

    if (!raw) return localStorage.getItem('app_user_id');

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

async loadDbPlans(): Promise<void> {
  this.isLoadingDbPlans = true;
  this.plans = [];

  try {
    const res: any = await this.http
      .get(`${environment.apiUrl}/masters/plans`)
      .toPromise();

    this.dbPlans = res?.data || [];

    this.plans = this.dbPlans
      .filter((plan: any) => plan.isActive !== false)
      .map((plan: any) => {
        const price = Number(plan.price || 0);
        const durationDays = Number(plan.durationInDays || 0);
        const durationMonths = Math.round(durationDays / 30);

        return {
          code: plan._id,
          name: {
            en: plan.planNameEn,
            ta: plan.planNameTa
          },
          priceAmount: price,
          disabled: false, // Do not impose an unconfirmed registration fee.
          price: `₹${price}`,
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
          contactLimit: plan.contactLimit || 0,
          profileViewLimit: plan.profileViewLimit || 0,
          durationInDays: plan.durationInDays || 0
        };
      });

  } catch (err) {
    console.error('Load plans error:', err);
    this.snackbar.error('Failed to load plans');
  } finally {
    this.isLoadingDbPlans = false;
    this.cdr.detectChanges();
  }
}
  goBackToProfiles() {
    this.router.navigate(['/profiles']);
  }

  private normalize(value: string | null | undefined): string {
    return String(value || '').trim().toLowerCase();
  }

private getDbPlanByName(planName: string): DbPlanRow | undefined {
  const normalizedName = this.normalize(planName);

  return this.dbPlans.find((p) => {
    const dbNameEn = this.normalize(p.planNameEn);
    const dbNameTa = this.normalize(p.planNameTa);

    return dbNameEn === normalizedName || dbNameTa === normalizedName;
  });
}
getPlanLimit(planName: string): number {
  const dbPlan = this.getDbPlanByName(planName);

  return dbPlan?.contactLimit || 0;
}

getPlanDays(planName: string): number {
  const dbPlan = this.getDbPlanByName(planName);

  return dbPlan?.durationInDays || 0;
}

  private addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  async selectPlan(plan: any): Promise<void> {
    // Do not initiate payment or create a subscription from the browser.
    // The existing backend remains the only authority for premium access.
    if (plan.disabled || this.isSavingPlan) return;

    if (!this.isBrowser || !localStorage.getItem('matrimony_token')) {
      this.snackbar.error(this.currentLang === 'ta'
        ? 'முதலில் உள்நுழைக' : 'Please log in first');
      await this.router.navigate(['/login'], {
        queryParams: {
          from: this.fromPage || 'plans',
          profileId: this.lockedProfileId || ''
        }
      });
      return;
    }

    // Selection is informational. Existing admin activation remains the only path
    // to a real entitlement while there is no supported self-serve payment API.
    this.selectedPlanName = this.getText(plan.name);
    this.snackbar.success(this.currentLang === 'ta'
      ? 'திட்டம் தேர்வானது. செயலில் வர நிர்வாகி ஒப்புதல் தேவை.'
      : 'Plan selected. Please contact the administrator for activation.');
    this.cdr.detectChanges();
  }

  goToProfile() {
    // Plans are optional for viewing approved members' basic profiles.
    // Paid details must be retrieved through server-authorized access only.
    const code = String(this.lockedProfileId || '').trim();
    this.router.navigate(code ? ['/free-profile', code] : ['/free-search']);
  }
}