
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Router,
  RouterLink,
  ActivatedRoute
} from '@angular/router';

import { firstValueFrom, timeout } from 'rxjs';
import { AuthService } from '../services/auth.service';

type Language = 'en' | 'ta';
type StageStatus = 'completed' | 'current' | 'upcoming';

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
  route: string;
}

interface DisplayStage {
  number: number;
  icon: StageIcon;
  title: string;
  description: string;
  state: StageStatus;
  route: string;
}

@Component({
  selector: 'app-account-status',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account-status.html',
  styleUrls: [
    './account-status.scss',
    './account-status.responsive.scss'
  ]
})
export class AccountStatus implements OnInit, OnDestroy {

  // ==========================================
  // SERVICES
  // ==========================================

  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // ==========================================
  // INTERNAL STATE
  // ==========================================

  private refreshTimer?: ReturnType<typeof setInterval>;
  private destroyed = false;
  private checking = false;
  private statusInitialized = false;

  private previousApproved = false;
  private previousPlanActive = false;

  readonly routeRejected =
    this.route.snapshot.routeConfig?.path ===
    'profile-rejected';

  // ==========================================
  // PAGE STATE
  // ==========================================

  lang: Language = 'en';
  memberName = '';

  loading = true;
  errorMessage = '';

  biodataCompleted = false;
  adminApproved = false;
  profilePublished = false;
  planActive = false;
  profileStatus = '';

  currentStage = 1;

  daysUntilExpiry: number | null = null;

  // ==========================================
  // ALL EIGHT MATRIMONY JOURNEY STAGES
  // ==========================================

  readonly definitions: StageDefinition[] = [
    {
      icon: 'file',
      titleEn: 'Biodata Completed',
      titleTa: 'சுயவிவரம் நிறைவு',
      descriptionEn:
        'Your profile details have been submitted successfully.',
      descriptionTa:
        'உங்கள் சுயவிவர விவரங்கள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டுள்ளன.',
      route: '/my-biodata'
    },
    {
      icon: 'approval',
      titleEn: 'Admin Approval',
      titleTa: 'நிர்வாக ஒப்புதல்',
      descriptionEn:
        'Our team reviews your profile before it becomes visible.',
      descriptionTa:
        'உங்கள் சுயவிவரம் வெளியிடப்படுவதற்கு முன் நிர்வாகக் குழு சரிபார்க்கும்.',
      route: '/approval-pending'
    },
    {
      icon: 'crown',
      titleEn: 'Subscription Required',
      titleTa: 'சந்தா தேவை',
      descriptionEn:
        'Choose a suitable plan after approval to unlock access.',
      descriptionTa:
        'ஒப்புதலுக்குப் பிறகு பொருத்தமான சந்தா திட்டத்தைத் தேர்ந்தெடுக்கவும்.',
      route: '/plans'
    },
    {
      icon: 'eye',
      titleEn: 'View Profiles',
      titleTa: 'சுயவிவரங்களைப் பார்க்க',
      descriptionEn:
        'Browse eligible profiles once your subscription is active.',
      descriptionTa:
        'சந்தா செயல்பாட்டிற்கு வந்ததும் தகுதியான சுயவிவரங்களைப் பார்க்கலாம்.',
      route: '/free-search'
    },
    {
      icon: 'heart',
      titleEn: 'Send Interest',
      titleTa: 'விருப்பம் அனுப்புதல்',
      descriptionEn:
        'Express interest in suitable profiles you like.',
      descriptionTa:
        'நீங்கள் விரும்பும் பொருத்தமான வரன்களுக்கு விருப்பத்தை அனுப்பலாம்.',
      route: '/free-search'
    },
    {
      icon: 'users',
      titleEn: 'Accept / Reject Interest',
      titleTa: 'விருப்பத்தை ஏற்க / நிராகரிக்க',
      descriptionEn:
        'Members can accept or reject interests they receive.',
      descriptionTa:
        'உறுப்பினர்கள் பெற்ற விருப்பங்களை ஏற்கலாம் அல்லது நிராகரிக்கலாம்.',
      route: '/received-interests'
    },
    {
      icon: 'bell',
      titleEn: 'Plan Expiry Alerts',
      titleTa: 'சந்தா காலாவதி அறிவிப்பு',
      descriptionEn:
        'Reminder stages: 2 days and 1 day before plan expiry.',
      descriptionTa:
        'சந்தா முடிவதற்கு 2 நாட்கள் மற்றும் 1 நாள் முன்பு நினைவூட்டல் நிலைகள்.',
      route: '/dashboard'
    },
    {
      icon: 'renew',
      titleEn: 'Renewal Required',
      titleTa: 'சந்தா புதுப்பித்தல்',
      descriptionEn:
        'After expiry, renew your plan to continue eligible access.',
      descriptionTa:
        'காலாவதியானதும் சேவைகளைத் தொடர சந்தாவைப் புதுப்பிக்கவும்.',
      route: '/plans'
    }
  ];

  // ==========================================
  // INITIALIZATION
  // ==========================================

  async ngOnInit(): Promise<void> {
    this.loadLanguage();
    this.loadMemberName();

    await this.loadJourney();

    if (this.destroyed) return;

    if (typeof window !== 'undefined') {
      window.addEventListener(
        'focus',
        this.handleWindowFocus
      );

      // Check the current approval and plan status
      // every 30 seconds while this page is open.
      this.refreshTimer = setInterval(() => {
        if (!document.hidden) {
          void this.loadJourney(true);
        }
      }, 30000);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;

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
    void this.loadJourney(true);
  };

  // ==========================================
  // LANGUAGE
  // ==========================================

  private loadLanguage(): void {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(
      'astro_journey_language'
    );

    if (saved === 'en' || saved === 'ta') {
      this.lang = saved;
      return;
    }

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
    return this.lang === 'ta' ? tamil : english;
  }

  // ==========================================
  // MEMBER NAME
  // ==========================================

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

    const found = values.find(
      value =>
        typeof value === 'string' &&
        value.trim().length > 0
    );

    return found?.trim() || '';
  }

  private loadMemberName(): void {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(
        'matrimony_user'
      );

      if (!raw) return;

      this.memberName = this.extractName(
        JSON.parse(raw)
      );

    } catch (error) {
      console.warn(
        'Unable to read member name',
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

  // ==========================================
  // CLICK ANY JOURNEY STEP
  // ==========================================

  openJourneyStep(index: number): void {
    const stage = this.definitions[index];

    if (!stage) return;

    let target = stage.route;

    // If biodata has not been submitted,
    // open the biodata form.
    if (index === 0 && !this.biodataCompleted) {
      target = '/biodata';
    }

    // Active members use the authenticated
    // profile search for viewing and interests.
    if (
      (index === 3 || index === 4) &&
      this.planActive
    ) {
      target = '/profiles';
    }

    void this.router.navigateByUrl(target);
  }

  // ==========================================
  // REAL BACKEND FLOW STATUS
  // ==========================================

  async loadJourney(silent = false): Promise<void> {

    // Do not make authenticated API calls
    // during server-side rendering.
    if (typeof window === 'undefined') {
      this.loading = false;
      return;
    }

    // Prevent duplicate simultaneous requests.
    if (this.checking || this.destroyed) {
      return;
    }

    this.checking = true;

    if (!silent) {
      this.loading = true;
      this.errorMessage = '';
      this.cdr.detectChanges();
    }

    try {

      // ========================================
      // FETCH SERVER FLOW
      // ========================================

      const response: any = await firstValueFrom(
        this.auth.getUserFlowStatus().pipe(
          timeout({ first: 8000 })
        )
      );

      if (this.destroyed) return;

      const flow = response?.data;

      if (!response?.success || !flow) {
        throw new Error(
          'Missing server flow status'
        );
      }

      // ========================================
      // PROFILE STATUS
      // ========================================

      const completed =
        flow.biodataCompleted === true;

      const status = String(
        flow.profileStatus || ''
      ).toLowerCase();

      const approved =
        flow.adminApproved === true;

      const published =
        status === 'approved' &&
        flow.isPublished === true;

      const fullyApproved =
        approved && published;

      const active =
        fullyApproved &&
        flow.hasActivePlan === true;

      // ========================================
      // DETECT ACTUAL STATUS TRANSITIONS
      // ========================================

      const approvalJustCompleted =
        this.statusInitialized &&
        !this.previousApproved &&
        fullyApproved;

      const planJustActivated =
        this.statusInitialized &&
        !this.previousPlanActive &&
        active;

      // ========================================
      // UPDATE COMPONENT STATE
      // ========================================

      this.biodataCompleted = completed;
      this.profileStatus = status;
      this.adminApproved = approved;
      this.profilePublished = published;
      this.planActive = active;

      // Update name if the backend provides it.
      const serverName = this.extractName(flow);

      if (serverName) {
        this.memberName = serverName;
      }

      // Calculate the current journey step.
      this.calculateCurrentStage();

      // Store verified status for next comparison.
      this.previousApproved = fullyApproved;
      this.previousPlanActive = active;
      this.statusInitialized = true;

      this.errorMessage = '';

      // ========================================
      // AUTOMATIC NAVIGATION
      // ========================================

      // If a subscription becomes active
      // while this page is open.
      if (planJustActivated) {
        void this.router.navigateByUrl(
          '/free-search'
        );
        return;
      }

      // If admin approval and publication
      // become complete while this page is open.
      if (
        approvalJustCompleted &&
        !active
      ) {
        void this.router.navigateByUrl(
          '/plans'
        );
      }

    } catch (error) {

      if (this.destroyed) return;

      console.error(
        'Journey status loading failed',
        error
      );

      if (!silent) {
        this.errorMessage = this.tr(
          'Unable to load your current status. Please try again.',
          'உங்கள் தற்போதைய நிலையை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
        );

        this.currentStage = 0;
      }

    } finally {

      this.checking = false;

      if (!this.destroyed) {

        // Critical loading spinner fix.
        this.loading = false;

        // Immediately render new backend status.
        this.cdr.detectChanges();
      }

    }

  }

  // ==========================================
  // CURRENT JOURNEY PROGRESS
  // ==========================================

  private calculateCurrentStage(): void {

    if (!this.biodataCompleted) {
      this.currentStage = 1;
      return;
    }

    if (
      this.isRejected ||
      !this.adminApproved ||
      !this.profilePublished
    ) {
      this.currentStage = 2;
      return;
    }

    if (!this.planActive) {
      this.currentStage = 3;
      return;
    }

    // Interest and expiry stages require
    // additional verified API information.
    this.currentStage = 4;
  }

  get isRejected(): boolean {
    return this.routeRejected ||
      this.profileStatus === 'rejected';
  }

  // ==========================================
  // JOURNEY STAGE DISPLAY
  // ==========================================

  get stages(): DisplayStage[] {
    return this.definitions.map(
      (item, index) => {

        const number = index + 1;
        let state: StageStatus = 'upcoming';

        if (
          this.currentStage > 0 &&
          !this.isRejected
        ) {
          if (number < this.currentStage) {
            state = 'completed';
          } else if (number === this.currentStage) {
            state = 'current';
          }
        }

        return {
          number,
          icon: item.icon,

          title:
            this.lang === 'ta'
              ? item.titleTa
              : item.titleEn,

          description:
            this.lang === 'ta'
              ? item.descriptionTa
              : item.descriptionEn,

          state,
          route: item.route
        };

      }
    );
  }

  // ==========================================
  // STATUS TITLE
  // ==========================================

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

    if (
      !this.adminApproved ||
      !this.profilePublished
    ) {
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

  // ==========================================
  // STATUS DESCRIPTION
  // ==========================================

  get statusDescription(): string {

    if (this.isRejected) {
      return this.tr(
        'Please review your biodata and contact support before resubmitting.',
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
        'Your profile is approved and awaiting publication.',
        'உங்கள் சுயவிவரம் அங்கீகரிக்கப்பட்டுள்ளது. வெளியீட்டிற்காகக் காத்திருக்கிறது.'
      );
    }

    if (!this.planActive) {
      return this.tr(
        'Your profile is approved and published. Choose a subscription plan.',
        'உங்கள் சுயவிவரம் அங்கீகரிக்கப்பட்டு வெளியிடப்பட்டுள்ளது. சந்தா திட்டத்தைத் தேர்ந்தெடுக்கவும்.'
      );
    }

    return this.tr(
      'Your membership is active. Explore eligible profiles and available features.',
      'உங்கள் சந்தா செயல்பாட்டில் உள்ளது. தகுதியான வரன்களைப் பார்க்கலாம்.'
    );
  }

  // ==========================================
  // NEXT ACTION ROUTE
  // ==========================================

  get actionRoute(): string {

    if (
      this.isRejected ||
      !this.biodataCompleted
    ) {
      return '/biodata';
    }

    if (
      !this.adminApproved ||
      !this.profilePublished
    ) {
      return '/free-search';
    }

    if (!this.planActive) {
      return '/plans';
    }

    return '/profiles';
  }

  // ==========================================
  // NEXT ACTION LABEL
  // ==========================================

  get actionLabel(): string {

    if (
      this.isRejected ||
      !this.biodataCompleted
    ) {
      return this.tr(
        'Continue Biodata',
        'சுயவிவரத்தைத் தொடரவும்'
      );
    }

    if (
      !this.adminApproved ||
      !this.profilePublished
    ) {
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

  // ==========================================
  // CURRENT STAGE LABEL
  // ==========================================

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

  // ==========================================
  // PLAN EXPIRY INFORMATION
  // ==========================================

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
