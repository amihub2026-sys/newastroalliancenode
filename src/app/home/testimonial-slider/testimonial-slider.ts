
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ElementRef,
  HostListener,
  PLATFORM_ID,
  ViewChild,
  inject
} from '@angular/core';

import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import { firstValueFrom } from 'rxjs';

import {
  Testimonial,
  TestimonialService
} from '../../services/testimonial.service';

import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-testimonial-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial-slider.html',
  styleUrls: [
    './testimonial-slider.scss',
    './testimonial-slider.responsive.scss'
  ]
})
export class TestimonialSlider implements OnInit, OnDestroy {

  private readonly service = inject(TestimonialService);
  private readonly language = inject(LanguageService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly isBrowser = isPlatformBrowser(
    inject(PLATFORM_ID)
  );

  @ViewChild('lightboxClose')
  lightboxClose?: ElementRef<HTMLButtonElement>;

  @ViewChild('lightboxPanel')
  lightboxPanel?: ElementRef<HTMLElement>;

  // DATA
  testimonials: Testimonial[] = [];
  loading = true;

  // SLIDER
  activeIndex = 0;
  itemsPerPage = 3;
  readonly slideInterval = 5000;

  private sliderTimer: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;

  // INTERACTION
  hoveredCardId: string | null = null;
  openedStoryId: string | null = null;
  expandedReviewId: string | null = null;

  // PHOTO LIGHTBOX
  lightboxItem: Testimonial | null = null;

  private previousFocus: HTMLElement | null = null;
  private previousBodyOverflow = '';

  // PHOTO ERROR TRACKING
  private readonly failedPhotoIds = new Set<string>();

  // ==========================================
  // LANGUAGE
  // ==========================================

  get currentLang(): 'en' | 'ta' {
    return this.language.currentLang;
  }

  t(english: string, tamil: string): string {
    return this.currentLang === 'ta' ? tamil : english;
  }

  getCoupleName(item: Testimonial): string {
    if (
      this.currentLang === 'ta' &&
      item.coupleNameTamil?.trim()
    ) {
      return item.coupleNameTamil;
    }

    return item.coupleNameEnglish || '';
  }

  getReview(item: Testimonial): string {
    if (
      this.currentLang === 'ta' &&
      item.reviewTamil?.trim()
    ) {
      return item.reviewTamil;
    }

    return item.reviewEnglish || '';
  }

  // ==========================================
  // INIT / API
  // ==========================================

  ngOnInit(): void {
    this.updateItemsPerPage();

    if (!this.isBrowser) {
      this.loading = false;
      return;
    }

    void this.loadTestimonials();
  }

  async loadTestimonials(): Promise<void> {
    this.loading = true;

    try {
      const response = await firstValueFrom(
        this.service.getPublished()
      );

      if (this.destroyed) return;

      const records = Array.isArray(response.data)
        ? response.data
        : [];

      this.testimonials = records.filter(
        item => item.published !== false
      );

      this.activeIndex = 0;
      this.resetStoryState();
      this.startAutoSlide();

    } catch (error) {
      if (this.destroyed) return;

      console.error('Testimonials API error:', error);

      this.testimonials = [];
      this.stopAutoSlide();

    } finally {
      if (!this.destroyed) {
        this.loading = false;
        this.cdr.markForCheck();
      }
    }
  }

  // ==========================================
  // RESPONSIVE
  // ==========================================

  private updateItemsPerPage(): void {
    if (!this.isBrowser) {
      this.itemsPerPage = 3;
      return;
    }

    const width = window.innerWidth;

    this.itemsPerPage =
      width <= 600 ? 1 :
      width <= 1024 ? 2 : 3;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!this.isBrowser) return;

    const oldCount = this.itemsPerPage;
    this.updateItemsPerPage();

    if (oldCount !== this.itemsPerPage) {
      this.startAutoSlide();
      this.cdr.markForCheck();
    }
  }

  get hasTestimonials(): boolean {
    return this.testimonials.length > 0;
  }

  get canSlide(): boolean {
    return this.testimonials.length > this.itemsPerPage;
  }

  get visibleTestimonials(): Testimonial[] {
    const total = this.testimonials.length;

    if (!total) return [];

    const visibleCount = Math.min(
      total,
      this.itemsPerPage
    );

    return Array.from(
      { length: visibleCount },
      (_, index) =>
        this.testimonials[
          (this.activeIndex + index) % total
        ]
    );
  }

  trackByTestimonial(
    _: number,
    item: Testimonial
  ): string {
    return item._id;
  }

  // ==========================================
  // AUTO SLIDER
  // ==========================================

  private startAutoSlide(): void {
    this.stopAutoSlide();

    if (
      !this.isBrowser ||
      !this.canSlide ||
      this.hoveredCardId !== null ||
      this.openedStoryId !== null ||
      this.expandedReviewId !== null ||
      this.lightboxItem !== null ||
      document.hidden
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

    this.sliderTimer = setInterval(() => {
      this.nextSlide(false);
    }, this.slideInterval);
  }

  private stopAutoSlide(): void {
    if (this.sliderTimer !== null) {
      clearInterval(this.sliderTimer);
      this.sliderTimer = null;
    }
  }

  private resetStoryState(): void {
    this.hoveredCardId = null;
    this.openedStoryId = null;
    this.expandedReviewId = null;
  }

  nextSlide(resetTimer = true): void {
    if (!this.canSlide) return;

    this.resetStoryState();

    this.activeIndex =
      (this.activeIndex + 1) %
      this.testimonials.length;

    if (resetTimer) {
      this.startAutoSlide();
    }

    this.cdr.markForCheck();
  }

  prevSlide(): void {
    if (!this.canSlide) return;

    this.resetStoryState();

    const total = this.testimonials.length;

    this.activeIndex =
      (this.activeIndex - 1 + total) % total;

    this.startAutoSlide();
    this.cdr.markForCheck();
  }

  goToSlide(index: number): void {
    if (
      index < 0 ||
      index >= this.testimonials.length
    ) {
      return;
    }

    this.resetStoryState();
    this.activeIndex = index;

    this.startAutoSlide();
    this.cdr.markForCheck();
  }

  // ==========================================
  // HOVER AND KEYBOARD FOCUS
  // ==========================================

  onCardEnter(item: Testimonial): void {
    if (
      !this.isBrowser ||
      !window.matchMedia('(hover: hover)').matches
    ) {
      return;
    }

    this.hoveredCardId = item._id;
    this.stopAutoSlide();
  }

  onCardLeave(item: Testimonial): void {
    if (this.hoveredCardId === item._id) {
      this.hoveredCardId = null;
    }

    this.startAutoSlide();
  }

  onCardFocusIn(item: Testimonial): void {
    this.hoveredCardId = item._id;
    this.stopAutoSlide();
  }

  onCardFocusOut(
    event: FocusEvent,
    item: Testimonial
  ): void {
    const card = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;

    if (next && card.contains(next)) {
      return;
    }

    if (this.hoveredCardId === item._id) {
      this.hoveredCardId = null;
    }

    this.startAutoSlide();
  }

  // ==========================================
  // MOBILE STORY OPEN / CLOSE
  // ==========================================

  isStoryOpen(item: Testimonial): boolean {
    return (
      this.openedStoryId === item._id ||
      this.expandedReviewId === item._id
    );
  }

  isOverlayVisible(item: Testimonial): boolean {
    return (
      this.hoveredCardId === item._id ||
      this.isStoryOpen(item)
    );
  }

  openStory(item: Testimonial): void {
    this.openedStoryId = item._id;
    this.stopAutoSlide();
    this.cdr.markForCheck();
  }

  closeStory(item: Testimonial): void {
    if (this.openedStoryId === item._id) {
      this.openedStoryId = null;
    }

    if (this.expandedReviewId === item._id) {
      this.expandedReviewId = null;
    }

    this.startAutoSlide();
    this.cdr.markForCheck();
  }

  // ==========================================
  // READ MORE / READ LESS
  // ==========================================

  toggleReview(item: Testimonial): void {
    if (this.expandedReviewId === item._id) {
      this.expandedReviewId = null;
    } else {
      this.expandedReviewId = item._id;
      this.openedStoryId = item._id;
    }

    if (this.expandedReviewId !== null) {
      this.stopAutoSlide();
    } else {
      this.startAutoSlide();
    }

    this.cdr.markForCheck();
  }

  // ==========================================
  // COUPLE PHOTO
  // ==========================================

  hasPhoto(item: Testimonial): boolean {
    return (
      !!item.photoUrl?.trim() &&
      !this.failedPhotoIds.has(item._id)
    );
  }

  onPhotoError(item: Testimonial): void {
    console.warn(
      'Testimonial photo failed:',
      item.photoUrl
    );

    this.failedPhotoIds.add(item._id);
    this.cdr.markForCheck();
  }

  // ==========================================
  // FULL SIZE PHOTO LIGHTBOX
  // ==========================================

  openLightbox(item: Testimonial): void {
    if (!this.isBrowser || !this.hasPhoto(item)) {
      return;
    }

    this.stopAutoSlide();

    this.previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    this.previousBodyOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    this.lightboxItem = item;
    this.cdr.detectChanges();

    this.lightboxClose?.nativeElement.focus();
  }

  closeLightbox(): void {
    if (!this.lightboxItem) return;

    this.lightboxItem = null;

    if (this.isBrowser) {
      document.body.style.overflow =
        this.previousBodyOverflow;
    }

    this.cdr.detectChanges();

    this.previousFocus?.focus();
    this.previousFocus = null;

    this.startAutoSlide();
  }

  changeLightboxPhoto(direction: number): void {
    if (!this.lightboxItem) return;

    const currentIndex = this.testimonials.findIndex(
      item => item._id === this.lightboxItem?._id
    );

    if (currentIndex < 0) return;

    const total = this.testimonials.length;

    for (let offset = 1; offset < total; offset++) {
      const nextIndex =
        (currentIndex + direction * offset + total * 2) % total;

      const candidate = this.testimonials[nextIndex];

      if (this.hasPhoto(candidate)) {
        this.lightboxItem = candidate;
        this.cdr.markForCheck();
        return;
      }
    }
  }

  get hasMultiplePhotos(): boolean {
    return this.testimonials.filter(
      item => this.hasPhoto(item)
    ).length > 1;
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.lightboxItem) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeLightbox();
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.changeLightboxPhoto(1);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.changeLightboxPhoto(-1);
      return;
    }

    if (event.key !== 'Tab') return;

    const panel = this.lightboxPanel?.nativeElement;
    if (!panel) return;

    const buttons = Array.from(
      panel.querySelectorAll<HTMLButtonElement>(
        'button:not([disabled])'
      )
    );

    if (!buttons.length) return;

    const first = buttons[0];
    const last = buttons[buttons.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === first
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  }

  // ==========================================
  // PAGE VISIBILITY
  // ==========================================

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (!this.isBrowser) return;

    if (document.hidden) {
      this.stopAutoSlide();
    } else {
      this.startAutoSlide();
    }
  }

  // ==========================================
  // DESTROY
  // ==========================================

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopAutoSlide();

    if (this.isBrowser && this.lightboxItem) {
      document.body.style.overflow =
        this.previousBodyOverflow;
    }
  }
}
