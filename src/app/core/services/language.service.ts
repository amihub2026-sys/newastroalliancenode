import { Injectable, signal } from '@angular/core';
export type Language = 'en' | 'ta';
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly language = signal<Language>(this.loadSavedLanguage());
  private loadSavedLanguage(): Language {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem('tm_language') === 'ta' ? 'ta' : 'en';
  }
  get currentLang(): Language { return this.language(); }
  set currentLang(value: Language) {
    if (value !== 'en' && value !== 'ta') return;
    this.language.set(value);
    if (typeof window !== 'undefined') localStorage.setItem('tm_language', value);
  }
}
