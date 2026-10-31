
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  PublicProfile,
  toPublicProfile
} from '../../free-search/models/search.models';

import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-home-discovery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-discovery.html',
  styleUrls: [
    './home-discovery.scss',
    './home-discovery.responsive.scss'
  ]
})
export class HomeDiscovery implements OnInit, OnDestroy {

  @Input() mode: 'recent' | 'recommended' = 'recent';

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);

  private readonly isBrowser = isPlatformBrowser(
    inject(PLATFORM_ID)
  );

  readonly origin = environment.apiUrl.replace(/\/api\/?$/, '');

  profiles: PublicProfile[] = [];

  loading = true;
  error = false;

  activeProfileIndex = 0;

  genderFilter: 'all' | 'female' | 'male' = 'all';

  private timer: ReturnType<typeof setInterval> | null = null;

  private touchX = 0;
  private touchY = 0;
  private touchSwiped = false;
  private paused = false;

  // ==========================================
  // LANGUAGE
  // ==========================================

  get lang(): 'en' | 'ta' {
    return this.language.currentLang;
  }

  t(en: string, ta: string): string {
    return this.lang === 'ta' ? ta : en;
  }

  // ==========================================
  // SECTION TITLES
  // ==========================================

  get sectionTitle(): string {
    return this.mode === 'recent'
      ? this.t(
          'Recently Approved Profiles',
          'சமீபத்தில் அங்கீகரிக்கப்பட்ட சுயவிவரங்கள்'
        )
      : this.t(
          'More Profiles You May Like',
          'உங்களுக்கான மேலும் வரன்கள்'
        );
  }

  get headingId(): string {
    return this.mode === 'recent'
      ? 'recent-profiles-title'
      : 'recommended-profiles-title';
  }

  // ==========================================
  // PROFILE FILTERING
  // ==========================================

  get carouselProfiles(): PublicProfile[] {

    const selected = this.mode === 'recent'
      ? this.profiles.slice(0, 6)
      : this.profiles.slice(6, 12);

    if (
      this.mode !== 'recent' ||
      this.genderFilter === 'all'
    ) {
      return selected;
    }

    return selected.filter(profile => {
      const gender = String(
        profile.gender || ''
      ).trim().toLowerCase();

      if (this.genderFilter === 'male') {
        return [
          'male',
          'man',
          'groom',
          'ஆண்',
          'மணமகன்'
        ].includes(gender);
      }

      return [
        'female',
        'woman',
        'bride',
        'பெண்',
        'மணமகள்'
      ].includes(gender);
    });
  }

  get total(): number {
    return this.carouselProfiles.length;
  }

  // ==========================================
  // LIFECYCLE
  // ==========================================

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.stop();
  }

  // ==========================================
  // LOAD APPROVED PROFILES
  // ==========================================

  load(): void {

    this.loading = true;
    this.error = false;

    const url = `${environment.apiUrl}/profile`;

    this.http.get<{
      success: boolean;
      data: any[];
    }>(url)
      .pipe(
        timeout(15000),

        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Home discovery API response:',
            response
          );

          const data = Array.isArray(response?.data)
            ? response.data
            : [];

          // Convert backend profiles into the
          // existing PublicProfile card format.
          
        
this.profiles = data
  .filter((item: any) => {
    // Only profiles with an uploaded photo
    const photo = String(
      item.profile_image_url ||
      item.media?.profileImage ||
      item.media?.profileImageUrl ||
      ''
    ).trim();

    return photo.length > 0;
  })
  .map((item: any): PublicProfile | null => {
    const profile = toPublicProfile(item, this.origin);

    if (!profile) return null;

    return profile;
  })
  .filter(
    (profile): profile is PublicProfile =>
      profile !== null
  );


          this.activeProfileIndex = 0;
          this.error = false;

          this.cdr.markForCheck();

          // Start mobile carousel after data arrives
          this.start();
        },

        error: (error) => {

          console.error(
            'Home discovery API error:',
            error
          );

          this.profiles = [];
          this.activeProfileIndex = 0;
          this.error = true;

          this.stop();
          this.cdr.markForCheck();
        }
      });
  }

  // ==========================================
  // GENDER FILTER
  // ==========================================

  setGender(
    value: 'all' | 'female' | 'male'
  ): void {

    this.genderFilter = value;
    this.activeProfileIndex = 0;

    this.start();
  }

  // ==========================================
  // PROFILE SLIDER
  // ==========================================

  setActiveProfile(index: number): void {

    if (!this.total) {
      return;
    }

    this.activeProfileIndex =
      (index + this.total) % this.total;

    this.start();
  }

  nextProfile(): void {
    this.setActiveProfile(
      this.activeProfileIndex + 1
    );
  }

  previousProfile(): void {
    this.setActiveProfile(
      this.activeProfileIndex - 1
    );
  }

  isNextProfile(index: number): boolean {
    return this.total > 1 &&
      index ===
      (this.activeProfileIndex + 1) % this.total;
  }

  isPreviousProfile(index: number): boolean {
    return this.total > 2 &&
      index ===
      (
        this.activeProfileIndex -
        1 +
        this.total
      ) % this.total;
  }

  pauseProfileSlider(): void {
    this.paused = true;
    this.stop();
  }

  resumeProfileSlider(): void {
    this.paused = false;
    this.start();
  }

  // ==========================================
  // AUTOPLAY
  // ==========================================

  private stop(): void {

    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private start(): void {

    this.stop();

    if (
      !this.isBrowser ||
      this.paused ||
      this.total < 2
    ) {
      return;
    }

    if (
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
    ) {
      return;
    }

    // Desktop uses existing hover/card interaction
    if (window.innerWidth > 880) {
      return;
    }

    this.timer = setInterval(() => {

      if (document.hidden) {
        return;
      }

      this.activeProfileIndex =
        (this.activeProfileIndex + 1) %
        this.total;

      this.cdr.markForCheck();

    }, 5000);
  }

  // ==========================================
  // MOBILE TOUCH / SWIPE
  // ==========================================

  onProfileTouchStart(event: TouchEvent): void {

    const touch = event.changedTouches[0];

    if (!touch) return;

    this.touchX = touch.clientX;
    this.touchY = touch.clientY;
    this.touchSwiped = false;
  }

  onProfileTouchEnd(event: TouchEvent): void {

    const touch = event.changedTouches[0];

    if (!touch) return;

    const dx = touch.clientX - this.touchX;
    const dy = touch.clientY - this.touchY;

    if (
      Math.abs(dx) > 40 &&
      Math.abs(dx) > Math.abs(dy)
    ) {
      this.touchSwiped = true;

      if (dx < 0) {
        this.nextProfile();
      } else {
        this.previousProfile();
      }
    }
  }

  onProfileTouchCancel(): void {
    this.touchSwiped = false;
  }

  // ==========================================
  // PROFILE CARD CLICK
  // ==========================================

  onProfileCardClick(
    index: number,
    profile: PublicProfile
  ): void {

    if (this.touchSwiped) {
      this.touchSwiped = false;
      return;
    }

    if (
      this.isBrowser &&
      window.innerWidth <= 880
    ) {
      void this.router.navigate([
        '/free-profile',
        profile.code
      ]);

      return;
    }

    this.setActiveProfile(index);
  }

  // ==========================================
  // FALLBACK IMAGES
  // ==========================================

  getGenderFallback(p: PublicProfile): string {
  return '/assets/matrimony-fallback.jpeg';
}

  // ==========================================
  // PROFILE IMAGE URL
  // ==========================================

 
getProfilePhoto(p: PublicProfile): string {
  const image = String(p.image || '').trim();

  if (!image) {
    return this.getGenderFallback(p);
  }

  if (/^(https?:|data:|blob:)/i.test(image)) {
    return image;
  }

  if (image.startsWith('/assets/')) {
    return image;
  }

  if (image.startsWith('assets/')) {
    return `/${image}`;
  }

  return `${this.origin}/${image.replace(/^\/+/, '')}`;
}


onProfilePhotoError(
  event: Event,
  profile: PublicProfile
): void {
  const image = event.target as HTMLImageElement;

  // Prevent repeatedly retrying the broken image
  image.onerror = null;

  // Remove the profile from this carousel
  this.profiles = this.profiles.filter(
    item => item.code !== profile.code
  );

  if (this.activeProfileIndex >= this.total) {
    this.activeProfileIndex = Math.max(0, this.total - 1);
  }

  this.start();
  this.cdr.markForCheck();
}






}
