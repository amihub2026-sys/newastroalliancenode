import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PublicProfile } from '../../free-search/models/search.models';
import { LanguageService } from '../../core/services/language.service';
import { PublicProfileValuePipe } from '../public-profile-value.pipe';

@Component({
  selector: 'app-public-card', standalone: true,
  imports: [CommonModule, RouterLink, PublicProfileValuePipe],
  templateUrl: './public-card.html', styleUrl: './public-card.scss'
})
export class PublicCard {
  @Input({required:true}) profile!: PublicProfile;
  @Input() compact = false;
  @Input() returnState = '';
  @Input() searchRoute: 'free-search' | 'profiles' = 'free-search';
  private langService = inject(LanguageService);
  get lang(){ return this.langService.currentLang; }
  t(en: string, ta: string){ return this.lang === 'ta' ? ta : en; }
  get displayName(): string { return (this.lang === 'ta' ? (this.profile.nameTa || this.profile.name) : (this.profile.name || this.profile.nameTa)) || this.t('Name not available','பெயர் கிடைக்கவில்லை'); }
  rememberSearchPosition(): void {
    if (this.returnState && typeof window !== 'undefined') {
      try { sessionStorage.setItem('astro_search_scroll', String(window.scrollY)); } catch { /* storage restricted */ }
    }
  }
  get fallback(): string {
    const g = this.profile.gender.toLowerCase();
    return g.includes('female') || g.includes('woman') || g.includes('பெண்') ? 'assets/avatars/female.svg'
      : g.includes('male') || g.includes('man') || g.includes('ஆண்') ? 'assets/avatars/male.svg' : 'assets/avatars/person.svg';
  }
  get photo(): string {return this.profile.image || this.fallback;}
  onPhotoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith(this.fallback)) img.src = this.fallback;
  }
  get heightLabel(): string {
    if(!this.profile.heightCm) return '';
    const inches = Math.round(this.profile.heightCm/2.54);
    return `${Math.floor(inches/12)}′${inches%12}″`;
  }
}