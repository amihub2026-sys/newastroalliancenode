
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  PLATFORM_ID,
  inject
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  Advertisement,
  AdvertisementService
} from '../../services/advertisement.service';

import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-advertisement-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './advertisement-slider.html',
  styleUrls: [
    './advertisement-slider.scss',
    './advertisement-slider.responsive.scss'
  ]
})
export class AdvertisementSlider implements OnInit, OnDestroy {

  // ==========================================
  // SERVICES
  // ==========================================

  private readonly advertisementService =
    inject(AdvertisementService);

  private readonly language =
    inject(LanguageService);

  private readonly cdr =
    inject(ChangeDetectorRef);

  private readonly isBrowser = isPlatformBrowser(
    inject(PLATFORM_ID)
  );

  // ==========================================
  // ENGLISH / TAMIL LANGUAGE SUPPORT
  // ==========================================

  get currentLang(): 'en' | 'ta' {
    return this.language.currentLang;
  }

  t(en: string, ta: string): string {
    return this.currentLang === 'ta' ? ta : en;
  }

  getAdvertisementTitle(ad: Advertisement): string {
    return this.currentLang === 'ta' && ad.titleTamil?.trim()
      ? ad.titleTamil
      : ad.title;
  }

  // ==========================================
  // SLIDER DATA
  // ==========================================

  advertisements: Advertisement[] = [];

  activeIndex = 0;

  loading = true;

  private timer: ReturnType<typeof setInterval> | null = null;

  private readonly slideInterval = 5000;

  private touchStartX = 0;
  private touchStartY = 0;

  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {
    this.loadAdvertisements();
  }

  // ==========================================
  // LOAD PUBLISHED ADVERTISEMENTS
  // ==========================================

  loadAdvertisements(): void {

    this.loading = true;

    // Detect desktop or mobile screen
    const device: 'desktop' | 'mobile' =
      this.isBrowser && window.innerWidth <= 880
        ? 'mobile'
        : 'desktop';

    // Load advertisements for the selected device
    this.advertisementService.getPublished(
      'between-profiles',
      device
    ).subscribe({

      next: (response) => {

        this.advertisements =
          response.success && Array.isArray(response.data)
            ? response.data
            : [];

        this.activeIndex = 0;

        this.loading = false;

        this.startAutoSlide();

        this.cdr.markForCheck();
      },

      error: (error) => {

        console.error(
          'Advertisement slider load error:',
          error
        );

        this.advertisements = [];

        this.loading = false;

        this.stopAutoSlide();

        this.cdr.markForCheck();
      }
    });
  }

  // ==========================================
  // AUTOMATIC SLIDER — EVERY 5 SECONDS
  // ==========================================

  private startAutoSlide(): void {

    this.stopAutoSlide();

    if (
      !this.isBrowser ||
      this.advertisements.length <= 1
    ) {
      return;
    }

    // Respect user preference for reduced motion
    if (
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
    ) {
      return;
    }

    this.timer = setInterval(() => {

      // Do not move slides while tab is hidden
      if (document.hidden) {
        return;
      }

      this.activeIndex =
        (this.activeIndex + 1) %
        this.advertisements.length;

      this.cdr.markForCheck();

    }, this.slideInterval);
  }

  // ==========================================
  // STOP AUTOMATIC SLIDER
  // ==========================================

  private stopAutoSlide(): void {

    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // ==========================================
  // MANUAL SLIDE NAVIGATION
  // ==========================================

  goToSlide(index: number): void {

    if (!this.advertisements.length) {
      return;
    }

    this.activeIndex =
      (index + this.advertisements.length) %
      this.advertisements.length;

    // Restart 5-second timer after manual navigation
    this.startAutoSlide();
  }

  nextSlide(): void {
    this.goToSlide(this.activeIndex + 1);
  }

  previousSlide(): void {
    this.goToSlide(this.activeIndex - 1);
  }

  // ==========================================
  // MOBILE TOUCH SWIPE
  // ==========================================

  onTouchStart(event: TouchEvent): void {

    const touch = event.changedTouches[0];

    if (!touch) {
      return;
    }

    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  onTouchEnd(event: TouchEvent): void {

    const touch = event.changedTouches[0];

    if (!touch) {
      return;
    }

    const deltaX =
      touch.clientX - this.touchStartX;

    const deltaY =
      touch.clientY - this.touchStartY;

    // Horizontal swipe only
    if (
      Math.abs(deltaX) > 45 &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {

      if (deltaX < 0) {
        this.nextSlide();
      } else {
        this.previousSlide();
      }
    }
  }

  // ==========================================
  // ADVERTISEMENT LINK VALIDATION
  // ==========================================

  getAdvertisementLink(ad: Advertisement): string | null {

    if (!ad.destinationUrl) {
      return null;
    }

    try {

      const url = new URL(ad.destinationUrl);

      if (
        url.protocol === 'https:' ||
        url.protocol === 'http:'
      ) {
        return url.href;
      }

    } catch {
      return null;
    }

    return null;
  }

  // ==========================================
  // COMPONENT CLEANUP
  // ==========================================

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }
}
