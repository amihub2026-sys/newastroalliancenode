
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

    // Reset image error only when the profile
    // or its image URL changes.
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

  // ==========================================
  // LANGUAGE
  // ==========================================

  get lang() {
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
  // PROFILE PHOTO URL
  // ==========================================

  get photo(): string {
    return String(this.profile?.image || '').trim();
  }

  // ==========================================
  // CHECK IF REAL PHOTO IS AVAILABLE
  // ==========================================

  get hasPhoto(): boolean {
    return this.photo.length > 0 && !this.photoFailed;
  }

  // ==========================================
  // PROFILE INITIALS FOR PLACEHOLDER
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
  // PROFILE IMAGE ERROR HANDLING
  // ==========================================

  onPhotoError(event: Event): void {

    const img = event.target as HTMLImageElement;

    // Prevent repeated error handling.
    img.onerror = null;

    // Replace broken image with the HTML
    // initials placeholder.
    this.photoFailed = true;
  }

  // ==========================================
  // REMEMBER SEARCH POSITION
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
