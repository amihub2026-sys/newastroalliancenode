
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PublicProfile } from '../../free-search/models/search.models';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-public-card',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './public-card.html',

  styleUrls: [
    './public-card.scss',
    './public-card.responsive.scss'
  ]
})
export class PublicCard {

  // ==========================================
  // LANGUAGE SERVICE
  // ==========================================

  private readonly langService = inject(LanguageService);

  // ==========================================
  // PROFILE INPUT
  // ==========================================

  private _profile!: PublicProfile;

  @Input({ required: true })
  set profile(value: PublicProfile) {

    // Reset photo error when profile or image changes.
    if (
      this._profile?.code !== value.code ||
      this._profile?.image !== value.image
    ) {
      this.photoFailed = false;
    }

    this._profile = value;
  }

  get profile(): PublicProfile {
    return this._profile;
  }

  // ==========================================
  // OTHER INPUTS
  // ==========================================

  @Input()
  compact = false;

  @Input()
  returnState = '';

  @Input()
  searchRoute: 'free-search' | 'profiles' = 'free-search';

  

  // ==========================================
  // PHOTO STATE
  // ==========================================

  photoFailed = false;

  // Prevent repeated avatar loading errors.
  avatarFailed = false;

  // ==========================================
  // LANGUAGE
  // ==========================================

  get lang(): 'en' | 'ta' {
    return this.langService.currentLang;
  }

  t(en: string, ta: string): string {
    return this.lang === 'ta' ? ta : en;
  }

  // ==========================================
  // PROFILE NAME
  // ==========================================

  get displayName(): string {

    if (!this.profile) {
      return this.t(
        'Name not available',
        'பெயர் கிடைக்கவில்லை'
      );
    }

    const name =
      this.lang === 'ta'
        ? (this.profile.nameTa || this.profile.name)
        : (this.profile.name || this.profile.nameTa);

    return name?.trim() || this.t(
      'Name not available',
      'பெயர் கிடைக்கவில்லை'
    );
  }

  // ==========================================
  // PROFILE AGE
  // ==========================================

  get displayAge(): string {

    const age = this.profile?.age;

    if (age === null || age === undefined) {
      return '';
    }

    return `${age} ${this.t('Years', 'வயது')}`;
  }

  // ==========================================
  // ORIGINAL PROFILE PHOTO
  // ==========================================

  get photo(): string {
    return String(this.profile?.image || '').trim();
  }

  // ==========================================
  // REAL PHOTO AVAILABILITY
  // ==========================================

  get hasPhoto(): boolean {
    return this.photo.length > 0 && !this.photoFailed;
  }

  // ==========================================
  // GENDER-BASED DEFAULT AVATAR
  // ==========================================

  get defaultAvatar(): string {

    const gender = String(this.profile?.gender || '')
      .trim()
      .toLowerCase();

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

    return '/assets/avatars/person.svg';
  }

  // ==========================================
  // DISPLAY PHOTO
  // ==========================================

  get displayPhoto(): string {

    if (this.avatarFailed) {
      return '';
    }

    if (this.hasPhoto) {
      return this.photo;
    }

    return this.defaultAvatar;
  }

  // ==========================================
  // DISPLAY AVATAR OR INITIALS
  // ==========================================

  get showImage(): boolean {
    return !this.avatarFailed;
  }

  // ==========================================
  // PROFILE INITIALS
  // FINAL FALLBACK
  // ==========================================

  get initials(): string {

    const name = this.displayName.trim();

    if (
      !name ||
      name === 'Name not available' ||
      name === 'பெயர் கிடைக்கவில்லை'
    ) {
      return 'AA';
    }

    const words = name.split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
      return (
        Array.from(words[0])[0] +
        Array.from(words[1])[0]
      ).toLocaleUpperCase();
    }

    return Array.from(words[0])
      .slice(0, 2)
      .join('')
      .toLocaleUpperCase();
  }

  // ==========================================
  // PHOTO ERROR HANDLING
  // ==========================================

  onPhotoError(event: Event): void {

    const img = event.target as HTMLImageElement;

    // When a real image fails, use the avatar.
    if (!this.photoFailed && this.photo.length > 0) {

      this.photoFailed = true;

      img.src = this.defaultAvatar;

      return;
    }

    // If the avatar also fails, show initials.
    img.onerror = null;

    this.avatarFailed = true;
  }

  // ==========================================
  // REMEMBER SEARCH SCROLL POSITION
  // ==========================================

  rememberSearchPosition(): void {

    if (
      !this.returnState ||
      typeof window === 'undefined'
    ) {
      return;
    }

    try {
      sessionStorage.setItem(
        'astro_search_scroll',
        String(window.scrollY)
      );
    } catch {
      // Browser storage may be unavailable.
    }
  }
}
