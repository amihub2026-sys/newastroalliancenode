
import {
  Component,
  ChangeDetectorRef,
  DestroyRef,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import {
  Subscription,
  catchError,
  distinctUntilChanged,
  firstValueFrom,
  map,
  throwError,
  timeout
} from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { environment } from '../../environments/environment';
import { LanguageService } from '../core/services/language.service';
import { AuthService } from '../services/auth.service';
import { SnackbarService } from '../shared/snackbar.service';

import {
  PublicProfile,
  toPublicProfile
} from '../free-search/models/search.models';

import { PhotoLightbox } from '../shared/photo-lightbox/photo-lightbox';
import { PublicProfileValuePipe } from '../shared/public-profile-value.pipe';
import { ProfilePrivacyDirective } from '../shared/profile-privacy/profile-privacy.directive';
type ProfileTab = 'basic' | 'family' | 'horoscope' | 'contact';

type PremiumField = {
  en: string;
  ta: string;
  value: string;
};

@Component({
  selector: 'app-public-profile',
  standalone: true,
imports: [
  CommonModule,
  PublicProfileValuePipe,
  PhotoLightbox,
  ProfilePrivacyDirective
],
  templateUrl: './public-profile.html',
  styleUrls: [
    './public-profile.scss',
    './public-profile.responsive.scss'
  ]
})
export class PublicProfilePreview implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly language = inject(LanguageService);
  private readonly auth = inject(AuthService);
  private readonly snackbar = inject(SnackbarService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  private request?: Subscription;

  private requestVersion = 0;
  private membershipRequestVersion = 0;

  readonly origin = environment.apiUrl.replace(/\/api\/?$/, '');

  profileCode = '';
  profile: PublicProfile | null = null;

  activeTab: ProfileTab = 'basic';

  premiumProfile: any = null;

  hasActiveMembership = false;
  membershipApproved = false;
  checkingMembership = false;

  loadingPremium = false;
  premiumError = false;

  loading = true;
  error = false;

  errorKind: 'timeout' | 'network' | 'server' = 'server';

  photoFailed = false;
  lightboxOpen = false;

  interestStatus = '';
  checkingInterest = false;
  sendingInterest = false;

  contactUnlocked = false;

  shortlistBusy = false;
  alreadyShortlisted = false;

  // ======================================
  // LANGUAGE
  // ======================================

  get lang(): 'en' | 'ta' {
    return this.language.currentLang;
  }

  get loggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  t(en: string, ta: string): string {
    return this.lang === 'ta' ? ta : en;
  }

  // ======================================
  // NAVIGATION
  // ======================================

  get returnState(): string {
    return this.route.snapshot.queryParamMap.get('s') || '';
  }

  get backRoute(): string {
    return this.route.snapshot.queryParamMap.get('source') === 'profiles'
      && this.loggedIn
      ? '/profiles'
      : '/free-search';
  }

  // ======================================
  // PUBLIC PROFILE
  // ======================================

  get displayName(): string {
    return (
      this.lang === 'ta'
        ? this.profile?.nameTa || this.profile?.name
        : this.profile?.name || this.profile?.nameTa
    ) || this.t('Name not available', 'பெயர் இல்லை');
  }

  
/* ==========================================
   DEFAULT AVATAR — SAME AS FREE SEARCH CARD
========================================== */

get avatar(): string {

  const gender = String(this.profile?.gender || '')
    .trim()
    .toLowerCase();

  // Female profile
  if (
    [
      'female',
      'woman',
      'bride',
      'பெண்',
      'மணமகள்'
    ].includes(gender)
  ) {
    return '/assets/women%20avathar.avif';
  }

  // Male profile
  if (
    [
      'male',
      'man',
      'groom',
      'ஆண்',
      'மணமகன்'
    ].includes(gender)
  ) {
    return '/assets/men%20avathar.avif';
  }

  // Unknown gender
  return '/assets/avatars/person.svg';
}


  get publicPhotos(): string[] {
    return [
      this.photoFailed
        ? this.avatar
        : this.profile?.image || this.avatar
    ];
  }

  get isPremiumTab(): boolean {
    return this.activeTab !== 'basic';
  }

  get hasSentInterest(): boolean {
    return !!this.interestStatus;
  }

  // ======================================
  // PREMIUM PERSONAL DETAILS
  // ======================================

  get extraBasicFields(): PremiumField[] {
    const p = this.premiumProfile;

    if (!p) return [];

    return this.fields([
      [
        'Date of Birth',
        'பிறந்த தேதி',
        p.basic?.dob ?? p.dob
      ],
      [
        'Height',
        'உயரம்',
        p.personal?.height ?? p.height_text
      ],
      [
        'Weight',
        'எடை',
        p.personal?.weight ?? p.weight_text
      ],
      [
        'Sub Caste',
        'உப ஜாதி',
        p.religion?.subCaste ?? p.sub_caste
      ],
      [
        'Education',
        'கல்வி',
        p.educationCareer?.education ?? p.education_text
      ],
      [
        'Occupation',
        'தொழில்',
        p.educationCareer?.job ?? p.occupation_text
      ],
      [
        'Company',
        'நிறுவனம்',
        p.educationCareer?.company ?? p.company_name
      ],
      [
        'Work Place',
        'பணியிடம்',
        p.educationCareer?.workPlace ?? p.work_place
      ],
      [
        'Salary',
        'சம்பளம்',
        p.educationCareer?.salary ?? p.salary_text
      ],
      [
        'About',
        'என்னைப் பற்றி',
        p.extras?.aboutMe ?? p.about_me
      ],
      [
        'Partner Expectation',
        'எதிர்பார்க்கும் வாழ்க்கைத்துணை',
        p.extras?.partnerExpectation ?? p.partner_expectation
      ]
    ]);
  }

  // ======================================
  // FAMILY DETAILS
  // ======================================

  get familyFields(): PremiumField[] {
    const p = this.premiumProfile;

    if (!p) return [];

    return this.fields([
      [
        'Father Name',
        'தந்தை பெயர்',
        p.family?.fatherName ?? p.father_name
      ],
      [
        'Mother Name',
        'தாய் பெயர்',
        p.family?.motherName ?? p.mother_name
      ],
      [
        'Father Occupation',
        'தந்தை தொழில்',
        p.family?.fatherOccupation ?? p.father_occupation
      ],
      [
        'Mother Occupation',
        'தாய் தொழில்',
        p.family?.motherOccupation ?? p.mother_occupation
      ],
      [
        'Married Brothers',
        'திருமணமான சகோதரர்கள்',
        p.family?.marriedBrothers ?? p.married_brothers
      ],
      [
        'Unmarried Brothers',
        'திருமணமாகாத சகோதரர்கள்',
        p.family?.unmarriedBrothers ?? p.unmarried_brothers
      ],
      [
        'Married Sisters',
        'திருமணமான சகோதரிகள்',
        p.family?.marriedSisters ?? p.married_sisters
      ],
      [
        'Unmarried Sisters',
        'திருமணமாகாத சகோதரிகள்',
        p.family?.unmarriedSisters ?? p.unmarried_sisters
      ],
      [
        'Family Status',
        'குடும்ப நிலை',
        p.family?.kudumbaNilai ?? p.kudumba_nilai
      ],
      [
        'Ancestral Place',
        'பூர்வீகம்',
        p.family?.poorvegam ?? p.poorvegam
      ],
      [
        'Residence',
        'இருப்பிடம்',
        p.family?.iruppidam ?? p.iruppidam
      ],
      [
        'Family Deity',
        'குலதெய்வம்',
        p.family?.kuladeivam ?? p.kuladeivam
      ]
    ]);
  }

  // ======================================
  // HOROSCOPE DETAILS
  // ======================================

  get horoscopeFields(): PremiumField[] {
    const p = this.premiumProfile;

    if (!p) return [];

    return this.fields([
      [
        'Rasi',
        'ராசி',
        p.astrology?.rasiId ??
        p.astrology?.rasi ??
        p.rasi_text
      ],
      [
        'Nakshatra',
        'நட்சத்திரம்',
        p.astrology?.nakshatraId ??
        p.astrology?.nakshatra ??
        p.nakshatra_text
      ],
      [
        'Lagnam',
        'லக்னம்',
        p.astrology?.lagnamId ??
        p.astrology?.lagnam ??
        p.lagnam_text
      ],
      [
        'Dhosham',
        'தோஷம்',
        p.astrology?.dhoshamId ??
        p.astrology?.dhosham ??
        p.dhosham_text
      ],
      [
        'Gothram',
        'கோத்திரம்',
        p.religion?.gothram ?? p.gothram
      ],
      [
        'Birth Time',
        'பிறந்த நேரம்',
        p.basic?.birthTime ??
        p.astrology?.birthTime ??
        p.birth_time
      ],
      [
        'Birth Place',
        'பிறந்த இடம்',
        p.astrology?.birthPlace ?? p.birth_place
      ],
      [
        'Thisai Iruppu',
        'திசை இருப்பு',
        p.astrology?.thisaiIruppuId ??
        p.astrology?.thisaiIruppu ??
        p.thisai_iruppu
      ],
      [
        'Paatham',
        'பாதம்',
        p.astrology?.paatham ?? p.paatham
      ]
    ]);
  }

  // ======================================
  // CONTACT DETAILS
  // ======================================

  get contactFields(): PremiumField[] {
    if (!this.contactUnlocked || !this.premiumProfile) {
      return [];
    }

    const p = this.premiumProfile;

    return this.fields([
      [
        'Mobile',
        'கைபேசி எண்',
        p.basic?.mobile ?? p.mobile
      ],
      [
        'Additional Mobile',
        'கூடுதல் கைபேசி',
        p.basic?.additionalMobile ?? p.additional_mobile
      ],
      [
        'Email',
        'மின்னஞ்சல்',
        p.basic?.email ?? p.email
      ],
      [
        'Full Address',
        'முழு முகவரி',
        p.address?.address ?? p.address_line
      ]
    ]);
  }

  // ======================================
  // INITIALIZATION
  // ======================================

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('code')?.trim() || ''),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(code => {
      this.loadProfile(code);
    });
  }

  ngOnDestroy(): void {
    this.requestVersion++;
    this.membershipRequestVersion++;
    this.request?.unsubscribe();
  }

  retry(): void {
    this.loadProfile(this.profileCode);
  }

  openPhoto(): void {
    this.lightboxOpen = true;
    this.cdr.markForCheck();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    this.photoFailed = true;
    img.onerror = null;
    img.src = this.avatar;

    this.cdr.markForCheck();
  }

  // ======================================
  // VALUE HELPERS
  // ======================================

  private textValue(value: any): string {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '';
    }

    if (typeof value === 'boolean') {
      return value
        ? this.t('Yes', 'ஆம்')
        : this.t('No', 'இல்லை');
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number'
    ) {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value
        .map(item => this.textValue(item))
        .filter(Boolean)
        .join(', ');
    }

    if (typeof value === 'object') {
      return this.textValue(
        value[this.lang] ??
        value.en ??
        value.ta ??
        value.nameEn ??
        value.nameTa ??
        ''
      );
    }

    return '';
  }

  private fields(
    rows: Array<[string, string, any]>
  ): PremiumField[] {
    return rows
      .map(([en, ta, value]) => ({
        en,
        ta,
        value: this.textValue(value)
      }))
      .filter(field => field.value !== '');
  }

  // ======================================
  // LOAD PUBLIC PROFILE
  // ======================================

  private loadProfile(code: string): void {
    this.request?.unsubscribe();

    const version = ++this.requestVersion;
    this.membershipRequestVersion++;

    this.profileCode = code;
    this.profile = null;
    this.premiumProfile = null;

    this.hasActiveMembership = false;
    this.membershipApproved = false;
    this.checkingMembership = false;
    this.loadingPremium = false;
    this.premiumError = false;

    this.contactUnlocked = false;
    this.activeTab = 'basic';
    this.interestStatus = '';
    this.photoFailed = false;
    this.error = false;
    this.loading = !!code;

    this.cdr.markForCheck();

    if (!code) {
      return;
    }

    this.request = this.http.get<{ data?: unknown }>(
      `${environment.apiUrl}/profile/public/${encodeURIComponent(code)}`
    ).pipe(
      timeout(12000),

      map(response =>
        toPublicProfile(response?.data, this.origin)
      ),

      catchError((error: unknown) => {
        if (
          !(
            error instanceof HttpErrorResponse &&
            error.status === 404
          )
        ) {
          return throwError(() => error);
        }

        return this.http.get<{
          data?: unknown;
          profiles?: unknown;
        }>(`${environment.apiUrl}/profile`).pipe(
          timeout(12000),

          map(response => {
            const records = Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response?.profiles)
                ? response.profiles
                : [];

            return records
              .map(row => toPublicProfile(row, this.origin))
              .find(
                (item): item is PublicProfile =>
                  !!item &&
                  item.code.toLowerCase() === code.toLowerCase()
              ) ?? null;
          })
        );
      })
    ).subscribe({
      next: (profile: PublicProfile | null) => {
        if (version !== this.requestVersion) return;

        this.profile = profile;
        this.loading = false;
        this.error = false;

        this.checkingMembership =
          !!profile && this.loggedIn;

        this.cdr.detectChanges();

        if (profile && this.loggedIn) {
          void this.refreshMembership(version);
        }
      },

      error: (error: unknown) => {
        if (version !== this.requestVersion) return;

        console.error('Public profile load failed:', error);

        this.profile = null;
        this.loading = false;
        this.error = true;
        this.checkingMembership = false;

        this.errorKind =
          (error as any)?.name === 'TimeoutError'
            ? 'timeout'
            : error instanceof HttpErrorResponse &&
              error.status === 0
              ? 'network'
              : 'server';

        this.cdr.detectChanges();
      }
    });
  }

  // ======================================
  // MEMBERSHIP VERIFICATION
  // ======================================

  private async refreshMembership(
    version = this.requestVersion
  ): Promise<void> {

    const checkVersion = ++this.membershipRequestVersion;

    this.hasActiveMembership = false;
    this.membershipApproved = false;
    this.premiumProfile = null;
    this.contactUnlocked = false;
    this.premiumError = false;
    this.loadingPremium = false;

    if (!this.loggedIn) {
      this.checkingMembership = false;
      this.cdr.markForCheck();
      return;
    }

    this.checkingMembership = true;
    this.cdr.markForCheck();

    try {
      const response: any = await firstValueFrom(
        this.auth.getUserFlowStatus(true).pipe(
          timeout(10000)
        )
      );

      if (
        version !== this.requestVersion ||
        checkVersion !== this.membershipRequestVersion
      ) {
        return;
      }

      this.membershipApproved =
        response?.data?.adminApproved === true;

      this.hasActiveMembership =
        this.membershipApproved &&
        response?.data?.hasActivePlan === true;

      this.cdr.markForCheck();

   

    } catch (error) {
      if (
        version === this.requestVersion &&
        checkVersion === this.membershipRequestVersion
      ) {
        console.error('Membership check failed:', error);

        this.hasActiveMembership = false;
        this.premiumError = true;
      }

    } finally {
      if (
        version === this.requestVersion &&
        checkVersion === this.membershipRequestVersion
      ) {
        this.checkingMembership = false;
        this.cdr.detectChanges();
      }
    }
  }

  // ======================================
  // SELECT PROFILE TAB
  // ======================================

  async selectTab(tab: ProfileTab): Promise<void> {
    this.activeTab = tab;
    this.cdr.markForCheck();

    if (tab === 'basic') {
      return;
    }

if (!this.loggedIn) {

  this.snackbar.info(
    this.t(
      'To view additional biodata details, please register or log in to your account.',
      'கூடுதல் பயோடேட்டா விவரங்களை பார்க்க முதலில் ரெஜிஸ்டர் செய்யுங்கள் அல்லது உங்கள் அக்கவுண்ட்டில் லாகின் செய்யுங்கள்.'
    ),
    this.t(
      'Login required',
      'லாகின் செய்யுங்கள்'
    )
  );

  return;
}

    await this.refreshMembership();

if (!this.hasActiveMembership) {

  this.snackbar.info(
    this.membershipApproved
      ? this.t(
          'To view additional biodata details, please purchase or renew your membership plan.',
          'கூடுதல் பயோடேட்டா விவரங்களை பார்க்க மெம்பர்ஷிப் பிளானை வாங்குங்கள் அல்லது புதுப்பிக்கவும்.'
        )
      : this.t(
          'Complete your biodata and wait for admin approval. Once approved, you can purchase a membership plan.',
          'உங்கள் பயோடேட்டாவை முழுமையாக நிரப்பி அட்மின் அப்ரூவலுக்கு அனுப்புங்கள். அப்ரூவல் கிடைத்த பிறகு மெம்பர்ஷிப் பிளானை வாங்கலாம்.'
        ),

    this.membershipApproved
      ? this.t(
          'Membership required',
          'மெம்பர்ஷிப் தேவை'
        )
      : this.t(
          'Admin approval required',
          'அட்மின் அப்ரூவல் தேவை'
        )
  );

  return;
}

    if (tab === 'contact') {
      await this.refreshInterest();
    }
  }

  // ======================================
  // LOAD PREMIUM PROFILE
  // ======================================

  private async loadPremiumDetails(
    version: number,
    checkVersion: number
  ): Promise<void> {

    if (
      !this.loggedIn ||
      !this.hasActiveMembership ||
      !this.profileCode
    ) {
      return;
    }

    this.loadingPremium = true;
    this.premiumError = false;
    this.cdr.markForCheck();

    try {
      const response: any = await firstValueFrom(
        this.http.get<any>(
          `${environment.apiUrl}/profile/view/${encodeURIComponent(this.profileCode)}`,
          {
            headers: this.auth.getAuthHeaders()
          }
        ).pipe(
          timeout(10000)
        )
      );

      if (
        version !== this.requestVersion ||
        checkVersion !== this.membershipRequestVersion
      ) {
        return;
      }

      // Only use the profile when the server
      // explicitly authorizes premium access.
      if (
        response?.success !== true ||
        response?.profileUnlocked !== true ||
        !response?.profile
      ) {
        throw new Error(
          'Premium profile access was not authorized'
        );
      }

      this.premiumProfile = response.profile;

      this.contactUnlocked =
        response?.contactUnlocked === true &&
        response?.profile?.contact_unlocked === true;

      this.cdr.markForCheck();

    } catch (error: any) {
      if (
        version !== this.requestVersion ||
        checkVersion !== this.membershipRequestVersion
      ) {
        return;
      }

      console.error('Premium profile load failed:', error);

      this.premiumProfile = null;
      this.contactUnlocked = false;
      this.premiumError = true;

      if (
        error?.status === 401 ||
        error?.status === 403
      ) {
        this.hasActiveMembership = false;
      }

 this.snackbar.warning(
  this.t(
    'Unable to view additional biodata details at the moment. Please check your membership status and try again. If the issue continues, contact our support team.',
    'தற்போது கூடுதல் பயோடேட்டா விவரங்களை பார்க்க முடியவில்லை. உங்கள் மெம்பர்ஷிப் ஆக்டிவாக உள்ளதா என்பதை சரிபார்த்து மீண்டும் முயற்சி செய்யுங்கள். தொடர்ந்து இந்த பிரச்சனை இருந்தால் எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
  ),
  this.t(
    'Unable to view biodata details',
    'பயோடேட்டா விவரங்களை பார்க்க முடியவில்லை'
  )
);
      

    } finally {
      if (
        version === this.requestVersion &&
        checkVersion === this.membershipRequestVersion
      ) {
        this.loadingPremium = false;
        this.cdr.detectChanges();
      }
    }
  }

  // ======================================
  // CHECK INTEREST STATUS
  // ======================================

  async refreshInterest(): Promise<void> {
    if (
      !this.hasActiveMembership ||
      !this.profileCode ||
      !this.loggedIn
    ) {
      return;
    }

    this.checkingInterest = true;
    this.cdr.markForCheck();

    try {
      const response: any = await firstValueFrom(
        this.http.get<any>(
          `${environment.apiUrl}/interests/check`,
          {
            headers: this.auth.getAuthHeaders(),
            params: {
              toProfileId: this.profileCode
            }
          }
        ).pipe(
          timeout(10000)
        )
      );

      this.interestStatus = response?.status || '';

    } catch (error) {
      console.error(
        'Interest status check failed:',
        error
      );

    } finally {
      this.checkingInterest = false;
      this.cdr.markForCheck();
    }
  }

  // ======================================
  // SEND INTEREST
  // ======================================

  async sendInterest(): Promise<void> {
    if (this.sendingInterest) return;

    if (!this.hasActiveMembership) {
      await this.selectTab('contact');
      return;
    }

if (this.hasSentInterest) {

  this.snackbar.info(
    this.t(
      'You have already sent an interest request to this profile. There is no need to send another request.',
      'இந்த வரனுக்கு ஏற்கனவே இன்ட்ரஸ்ட் அனுப்பியுள்ளீர்கள். மீண்டும் இன்ட்ரஸ்ட் அனுப்ப தேவையில்லை.'
    ),
    this.t(
      'Interest already sent',
      'ஏற்கனவே இன்ட்ரஸ்ட் அனுப்பப்பட்டுள்ளது'
    )
  );

  return;
}
    this.sendingInterest = true;
    this.cdr.markForCheck();

    try {
      const response: any = await firstValueFrom(
        this.http.post<any>(
          `${environment.apiUrl}/interests`,
          {
            toProfileId: this.profileCode
          },
          {
            headers: this.auth.getAuthHeaders()
          }
        ).pipe(
          timeout(10000)
        )
      );

      if (response?.success !== true) {
        throw new Error('Interest not confirmed');
      }

      this.interestStatus = 'pending';

  this.snackbar.success(
  this.t(
    'Your interest request has been sent successfully. One interest credit has been deducted. Please wait for their response.',
    'உங்கள் இன்ட்ரஸ்ட் வெற்றிகரமாக அனுப்பப்பட்டுள்ளது. உங்கள் அக்கவுண்ட்டிலிருந்து 1 இன்ட்ரஸ்ட் கிரெடிட் கழிக்கப்பட்டுள்ளது. அவர்களின் பதிலுக்காக காத்திருக்கவும்.'
  ),
  this.t(
    'Interest sent successfully!',
    'இன்ட்ரஸ்ட் அனுப்பப்பட்டது!'
  )
);
      this.auth.invalidateFlowStatus();

    } catch (error: any) {
      if (error?.error?.code === 'ALREADY_SENT') {
        this.interestStatus = 'pending';
      }

  this.snackbar.warning(
  this.t(
    error?.error?.code === 'INTEREST_LIMIT_REACHED'
      ? 'You have used all your available interest credits. Please check your membership plan or contact our support team.'
      : 'Unable to send your interest request at the moment. Please check your sent interests before trying again.',

    error?.error?.code === 'INTEREST_LIMIT_REACHED'
      ? 'உங்கள் இன்ட்ரஸ்ட் கிரெடிட்ஸ் அனைத்தும் முடிந்துவிட்டது. உங்கள் மெம்பர்ஷிப் பிளானை சரிபார்க்கவும் அல்லது எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
      : 'தற்போது இன்ட்ரஸ்ட் அனுப்ப முடியவில்லை. மீண்டும் அனுப்புவதற்கு முன் ஏற்கனவே இன்ட்ரஸ்ட் அனுப்பப்பட்டுள்ளதா என்பதை சரிபார்க்கவும்.'
  ),

  this.t(
    error?.error?.code === 'INTEREST_LIMIT_REACHED'
      ? 'Interest credits exhausted'
      : 'Unable to send interest',

    error?.error?.code === 'INTEREST_LIMIT_REACHED'
      ? 'இன்ட்ரஸ்ட் கிரெடிட்ஸ் முடிந்துவிட்டது'
      : 'இன்ட்ரஸ்ட் அனுப்ப முடியவில்லை'
  )
);

    } finally {
      this.sendingInterest = false;
      this.cdr.markForCheck();
    }
  }

  // ======================================
  // VERIFY ACCEPTED CONTACT
  // ======================================
async verifyContact(): Promise<void> {

  await this.selectTab('contact');

  if (
    this.hasActiveMembership &&
    !this.contactUnlocked
  ) {

    this.snackbar.info(
      this.t(
        'The mobile number and address are currently locked. Contact details will be available once your interest request is accepted.',
        'மொபைல் நம்பர் மற்றும் முகவரி தற்போது லாக் செய்யப்பட்டுள்ளது. நீங்கள் அனுப்பிய இன்ட்ரஸ்ட்டை அவர்கள் ஏற்றுக்கொண்ட பிறகு தொடர்பு விவரங்களை பார்க்கலாம்.'
      ),
      this.t(
        'Contact details locked',
        'தொடர்பு விவரங்கள் லாக் செய்யப்பட்டுள்ளது'
      )
    );

  }

}

  // ======================================
  // SHORTLIST
  // ======================================

  async shortlistProfile(): Promise<void> {
    if (this.shortlistBusy) return;

    if (
      !this.loggedIn ||
      !this.hasActiveMembership
    ) {
      await this.selectTab('family');
      return;
    }

    const profileId =
      this.premiumProfile?._id ||
      this.premiumProfile?.profile_id;

    const userId = this.auth.getCurrentUserId();

if (!profileId || !userId) {

  this.snackbar.info(
    this.t(
      'To add this profile to your favourites, please open the additional biodata details first.',
      'இந்த வரனை உங்களுக்கு பிடித்த வரன்கள் பட்டியலில் சேர்க்க முதலில் கூடுதல் பயோடேட்டா விவரங்களை திறந்து பார்க்கவும்.'
    ),
    this.t(
      'View biodata details first',
      'முதலில் பயோடேட்டாவை பார்க்கவும்'
    )
  );

  return;
}

    this.shortlistBusy = true;
    this.cdr.markForCheck();

    try {
      const response: any = await firstValueFrom(
        this.http.post<any>(
          `${environment.apiUrl}/shortlists`,
          {
            userId,
            profileId
          },
          {
            headers: this.auth.getAuthHeaders()
          }
        ).pipe(
          timeout(10000)
        )
      );

      if (response?.success === false) {
        throw new Error(
          'Shortlist was not confirmed'
        );
      }

      this.alreadyShortlisted = true;

    this.snackbar.success(
  this.t(
    'This profile has been successfully added to your favourites. You can view it anytime from your shortlisted profiles.',
    'இந்த வரன் உங்களுக்கு பிடித்த வரன்கள் பட்டியலில் சேர்க்கப்பட்டுள்ளது. எப்போது வேண்டுமானாலும் அந்த பட்டியலில் இந்த வரனை பார்க்கலாம்.'
  ),
  this.t(
    'Added to favourites!',
    'பிடித்த வரன்களில் சேர்க்கப்பட்டது!'
  )
);

 } catch (error) {

  this.snackbar.error(
    this.t(
      'Unable to add this profile to your favourites. Please check your favourites list before trying again.',
      'இந்த வரனை பிடித்த வரன்கள் பட்டியலில் சேர்க்க முடியவில்லை. மீண்டும் முயற்சி செய்வதற்கு முன் உங்கள் பிடித்த வரன்கள் பட்டியலை சரிபார்க்கவும்.'
    ),
    this.t(
      'Unable to add to favourites',
      'பிடித்த வரன்களில் சேர்க்க முடியவில்லை'
    )
  );

    } finally {
      this.shortlistBusy = false;
      this.cdr.markForCheck();
    }
  }

  // ======================================
  // GO TO MEMBERSHIP PLANS
  // ======================================

  goToPlans(): void {
    if (!this.loggedIn) {
      void this.router.navigate(['/register']);
      return;
    }

    if (!this.membershipApproved) {
      void this.router.navigate(['/biodata']);
      return;
    }

    void this.router.navigate(['/plans'], {
      queryParams: {
        from: 'profiles',
        profileId: this.profileCode,
        profileName: this.profile?.name || ''
      }
    });
  }

 }