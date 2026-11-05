
import {
  Component,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  firstValueFrom,
  timeout
} from 'rxjs';

import { AuthService } from '../services/auth.service';

type Language = 'en' | 'ta';

type StageStatus =
  | 'completed'
  | 'current'
  | 'upcoming';

type StageIcon =
  | 'file'
  | 'approval'
  | 'crown'
  | 'eye'
  | 'heart'
  | 'users'
  | 'bell'
  | 'renew';

interface StageDefinition {
  icon: StageIcon;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
}

interface DisplayStage {
  number: number;
  icon: StageIcon;
  title: string;
  description: string;
  state: StageStatus;
}

@Component({
  selector: 'app-account-status',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './account-status.html',
  styleUrls: [
    './account-status.scss',
    './account-status.responsive.scss'
  ]
})
export class AccountStatus implements OnInit, OnDestroy {

  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  private refreshTimer?: ReturnType<typeof setInterval>;

  readonly routeRejected =
    this.route.snapshot.routeConfig?.path ===
    'profile-rejected';

  lang: Language = 'en';

  memberName = '';

  loading = true;
  errorMessage = '';

  biodataCompleted = false;
  adminApproved = false;
  profilePublished = false;
  planActive = false;
  profileStatus = '';

  // Current stage is derived from server status.
  currentStage = 1;

  // These require separate verified subscription data.
  daysUntilExpiry: number | null = null;

  readonly definitions: StageDefinition[] = [
    {
      icon: 'file',
      titleEn: 'Biodata Completed',
      titleTa: 'சுயவிவரம் நிறைவு',
      descriptionEn:
        'Your profile details have been submitted successfully.',
      descriptionTa:
        'உங்கள் சுயவிவர விவரங்கள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டுள்ளன.'
    },
    {
      icon: 'approval',
      titleEn: 'Admin Approval',
      titleTa: 'நிர்வாக ஒப்புதல்',
      descriptionEn:
        'Our team reviews your profile before it becomes visible.',
      descriptionTa:
        'உங்கள் சுயவிவரம் வெளியிடப்படுவதற்கு முன் நிர்வாகக் குழு சரிபார்க்கும்.'
    },
    {
      icon: 'crown',
      titleEn: 'Subscription Required',
      titleTa: 'சந்தா தேவை',
      descriptionEn:
        'Choose a suitable plan after approval to unlock access.',
      descriptionTa:
        'ஒப்புதலுக்குப் பிறகு பொருத்தமான சந்தா திட்டத்தைத் தேர்ந்தெடுக்கவும்.'
    },
    {
      icon: 'eye',
      titleEn: 'View Profiles',
      titleTa: 'சுயவிவரங்களைப் பார்க்க',
      descriptionEn:
        'Browse eligible profiles once your subscription is active.',
      descriptionTa:
        'சந்தா செயல்பாட்டிற்கு வந்ததும் தகுதியான சுயவிவரங்களைப் பார்க்கலாம்.'
    },
    {
      icon: 'heart',
      titleEn: 'Send Interest',
      titleTa: 'விருப்பம் அனுப்புதல்',
      descriptionEn:
        'Express interest in the suitable profiles you like.',
      descriptionTa:
        'நீங்கள் விரும்பும் பொருத்தமான வரன்களுக்கு விருப்பத்தை அனுப்பலாம்.'
    },
    {
      icon: 'users',
      titleEn: 'Accept / Reject Interest',
      titleTa: 'விருப்பத்தை ஏற்க / நிராகரிக்க',
      descriptionEn:
        'Members can accept or reject interests they receive.',
      descriptionTa:
        'உறுப்பினர்கள் பெற்ற விருப்பங்களை ஏற்கலாம் அல்லது நிராகரிக்கலாம்.'
    },
    {
      icon: 'bell',
      titleEn: 'Plan Expiry Alerts',
      titleTa: 'சந்தா காலாவதி அறிவிப்பு',
      descriptionEn:
        'Reminder stages: 2 days and 1 day before plan expiry.',
      descriptionTa:
        'சந்தா முடிவதற்கு 2 நாட்கள் மற்றும் 1 நாள் முன்பு நினைவூட்டல் நிலைகள்.'
    },
    {
      icon: 'renew',
      titleEn: 'Renewal Required',
      titleTa: 'சந்தா புதுப்பித்தல்',
      descriptionEn:
        'After expiry, renew your plan to continue eligible access.',
      descriptionTa:
        'காலாவதியானதும் சேவைகளைத் தொடர சந்தாவைப் புதுப்பிக்கவும்.'
    }
  ];

  async ngOnInit(): Promise<void> {
    this.loadLanguage();
    this.loadMemberName();

    await this.loadJourney();

    // Refresh when the member revisits the tab.
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'focus',
        this.handleWindowFocus
      );
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'focus',
        this.handleWindowFocus
      );
    }

    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  private readonly handleWindowFocus = (): void => {
    void this.loadJourney();
  };

  /* =====================================
     LANGUAGE
  ===================================== */

  private loadLanguage(): void {
    if (typeof window === 'undefined') return;

    // Page-local preference.
    const saved = localStorage.getItem(
      'astro_journey_language'
    );

    if (saved === 'en' || saved === 'ta') {
      this.lang = saved;
      return;
    }

    // Use document language if the application sets it.
    const documentLanguage =
      document.documentElement.lang.toLowerCase();

    if (documentLanguage.startsWith('ta')) {
      this.lang = 'ta';
    }
  }

  changeLanguage(language: Language): void {
    this.lang = language;

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'astro_journey_language',
        language
      );
    }
  }

  tr(english: string, tamil: string): string {
    return this.lang === 'ta'
      ? tamil
      : english;
  }

  /* =====================================
     MEMBER NAME
  ===================================== */

  private extractName(source: any): string {
    if (!source || typeof source !== 'object') {
      return '';
    }

    const values = [
      source.name,
      source.fullName,
      source.full_name,
      source.memberName,
      source.member_name,
      source.profile?.name,
      source.biodata?.name,
      source.user?.name,
      source.data?.name
    ];

    const result = values.find(
      value =>
        typeof value === 'string' &&
        value.trim().length > 0
    );

    return result?.trim() || '';
  }

  private loadMemberName(): void {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(
        'matrimony_user'
      );

      if (!raw) return;

      const user = JSON.parse(raw);
      this.memberName = this.extractName(user);

    } catch (error) {
      console.warn(
        'Unable to read saved member name',
        error
      );
    }
  }

  get firstName(): string {
    return this.memberName
      .trim()
      .split(/\s+/)[0] || '';
  }

  get greeting(): string {
    if (!this.firstName) {
      return this.tr(
        'Welcome!',
        'வணக்கம்!'
      );
    }

    return this.lang === 'ta'
      ? `வணக்கம் ${this.firstName}!`
      : `Hi ${this.firstName},`;
  }

  /* =====================================
     REAL USER FLOW
  ===================================== */

  async loadJourney(): Promise<void> {
    // No authenticated status request during SSR.
    if (typeof window === 'undefined') {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const response: any = await firstValueFrom(
        this.auth.getUserFlowStatus().pipe(
          timeout({ first: 8000 })
        )
      );

      const flow = response?.data;

      if (!response?.success || !flow) {
        throw new Error(
          'Missing server flow status'
        );
      }

      this.biodataCompleted =
        flow.biodataCompleted === true;

      this.profileStatus = String(
        flow.profileStatus || ''
      ).toLowerCase();

      this.adminApproved =
        flow.adminApproved === true;

      // Match the security/navigation guard.
      this.profilePublished =
        this.profileStatus === 'approved' &&
        flow.isPublished === true;

      const fullyApproved =
        this.adminApproved &&
        this.profilePublished;

      this.planActive =
        fullyApproved &&
        flow.hasActivePlan === true;

      // Read the name only if the server returns one.
      const serverName = this.extractName(flow);

      if (serverName) {
        this.memberName = serverName;
      }

      this.calculateCurrentStage();

    } catch (error) {
      console.error(
        'Journey status loading failed',
        error
      );

      this.errorMessage = this.tr(
        'Unable to load your current status. Please try again.',
        'உங்கள் தற்போதைய நிலையை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
      );

      // Do not present cached status as verified.
      this.currentStage = 0;

    } finally {
      this.loading = false;
    }
  }

  /* =====================================
     STAGE CALCULATION
  ===================================== */

  private calculateCurrentStage(): void {

    if (!this.biodataCompleted) {
      this.currentStage = 1;
      return;
    }

    if (this.isRejected) {
      this.currentStage = 2;
      return;
    }

    if (!this.adminApproved ||
        !this.profilePublished) {
      this.currentStage = 2;
      return;
    }

    if (!this.planActive) {
      this.currentStage = 3;
      return;
    }

    // Real active plan.
    // Interest activity and expiry require their
    // respective APIs, so they stay informational.
    this.currentStage = 4;
  }

  get isRejected(): boolean {
    return this.routeRejected ||
      this.profileStatus === 'rejected';
  }

  get stages(): DisplayStage[] {

    return this.definitions.map(
      (item, index) => {

        const number = index + 1;

        let state: StageStatus = 'upcoming';

        if (this.currentStage > 0 &&
            !this.isRejected) {

          if (number < this.currentStage) {
            state = 'completed';
          } else if (number === this.currentStage) {
            state = 'current';
          }

        }

        return {
          number,
          icon: item.icon,
          title: this.lang === 'ta'
            ? item.titleTa
            : item.titleEn,
          description: this.lang === 'ta'
            ? item.descriptionTa
            : item.descriptionEn,
          state
        };
      }
    );
  }

  /* =====================================
     CURRENT STATUS
  ===================================== */

  get statusTitle(): string {

    if (this.isRejected) {
      return this.tr(
        'Profile needs changes',
        'சுயவிவரத்தில் திருத்தம் தேவை'
      );
    }

    if (!this.biodataCompleted) {
      return this.tr(
        'Complete your biodata',
        'சுயவிவரத்தை நிறைவு செய்யவும்'
      );
    }

    if (!this.adminApproved ||
        !this.profilePublished) {
      return this.tr(
        'Profile under review',
        'சுயவிவரம் பரிசீலனையில் உள்ளது'
      );
    }

    if (!this.planActive) {
      return this.tr(
        'Profile approved',
        'சுயவிவரம் அங்கீகரிக்கப்பட்டது'
      );
    }

    return this.tr(
      'Membership active',
      'சந்தா செயல்பாட்டில் உள்ளது'
    );
  }

  get statusDescription(): string {

    if (this.isRejected) {
      return this.tr(
        'Please review your biodata and contact support for details before resubmitting.',
        'மீண்டும் சமர்ப்பிக்கும் முன் உங்கள் சுயவிவரத்தை சரிபார்த்து உதவிக் குழுவைத் தொடர்புகொள்ளவும்.'
      );
    }

    if (!this.biodataCompleted) {
      return this.tr(
        'Complete and submit your biodata to begin the approval process.',
        'ஒப்புதல் செயல்முறையைத் தொடங்க உங்கள் சுயவிவரத்தை நிறைவு செய்து சமர்ப்பிக்கவும்.'
      );
    }

    if (!this.adminApproved) {
      return this.tr(
        'Your biodata has been submitted. Our team is reviewing your profile.',
        'உங்கள் சுயவிவரம் சமர்ப்பிக்கப்பட்டுள்ளது. நிர்வாகக் குழு அதைப் பரிசீலித்து வருகிறது.'
      );
    }

    if (!this.profilePublished) {
      return this.tr(
        'Your profile has been approved and is awaiting publication.',
        'உங்கள் சுயவிவரம் அங்கீகரிக்கப்பட்டுள்ளது. வெளியீட்டிற்காகக் காத்திருக்கிறது.'
      );
    }

    if (!this.planActive) {
      return this.tr(
        'Your profile is approved and published. Choose a subscription plan to continue.',
        'உங்கள் சுயவிவரம் அங்கீகரிக்கப்பட்டு வெளியிடப்பட்டுள்ளது. தொடர சந்தா திட்டத்தைத் தேர்ந்தெடுக்கவும்.'
      );
    }

    return this.tr(
      'Your membership is active. You can explore eligible profiles and use features available under your plan.',
      'உங்கள் சந்தா செயல்பாட்டில் உள்ளது. தகுதியான வரன்களையும் உங்கள் திட்டத்தில் உள்ள வசதிகளையும் பயன்படுத்தலாம்.'
    );
  }

  get actionRoute(): string {

    if (this.isRejected ||
        !this.biodataCompleted) {
      return '/biodata';
    }

    if (!this.adminApproved ||
        !this.profilePublished) {
      return '/free-search';
    }

    if (!this.planActive) {
      return '/plans';
    }

    return '/profiles';
  }

  get actionLabel(): string {

    if (this.isRejected ||
        !this.biodataCompleted) {
      return this.tr(
        'Continue Biodata',
        'சுயவிவரத்தைத் தொடரவும்'
      );
    }

    if (!this.adminApproved ||
        !this.profilePublished) {
      return this.tr(
        'Explore Free Search',
        'இலவச தேடல்'
      );
    }

    if (!this.planActive) {
      return this.tr(
        'View Membership Plans',
        'சந்தா திட்டங்களைப் பார்க்க'
      );
    }

    return this.tr(
      'Explore Matches',
      'பொருத்தமான வரன்களைப் பார்க்க'
    );
  }

  get currentStageLabel(): string {
    if (this.isRejected) {
      return this.tr(
        'Changes Required',
        'திருத்தம் தேவை'
      );
    }

    if (this.currentStage === 1) {
      return this.tr(
        'Biodata Required',
        'சுயவிவரம் தேவை'
      );
    }

    if (this.currentStage === 2) {
      return this.tr(
        'In Progress',
        'பரிசீலனையில்'
      );
    }

    if (this.currentStage === 3) {
      return this.tr(
        'Choose a Plan',
        'திட்டத்தைத் தேர்வு செய்க'
      );
    }

    return this.tr(
      'Active',
      'செயல்பாட்டில்'
    );
  }

  get expiryMessage(): string {

    if (this.daysUntilExpiry === null) {
      return '';
    }

    if (this.daysUntilExpiry < 0) {
      return this.tr(
        'Your plan has expired. Please renew.',
        'உங்கள் சந்தா காலாவதியானது. புதுப்பிக்கவும்.'
      );
    }

    if (this.daysUntilExpiry === 0) {
      return this.tr(
        'Your plan expires today.',
        'உங்கள் சந்தா இன்றுடன் முடிவடைகிறது.'
      );
    }

    if (this.daysUntilExpiry === 1) {
      return this.tr(
        'Your plan expires tomorrow.',
        'உங்கள் சந்தா நாளை முடிவடைகிறது.'
      );
    }

    if (this.daysUntilExpiry === 2) {
      return this.tr(
        'Your plan expires in 2 days.',
        'உங்கள் சந்தா இன்னும் 2 நாட்களில் முடிவடைகிறது.'
      );
    }

    return '';
  }
}
