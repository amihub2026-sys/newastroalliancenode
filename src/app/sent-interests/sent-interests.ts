import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { SnackbarService } from '../shared/snackbar.service';
import { LanguageService } from '../core/services/language.service';

@Component({
  selector: 'app-sent-interests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sent-interests.html',
  styleUrls: ['./sent-interests.scss']
})
export class SentInterests implements OnInit {

  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  http = inject(HttpClient);

  snackbar = inject(SnackbarService);
  app = inject(LanguageService);

  apiUrl = environment.apiUrl;
  isBrowser = isPlatformBrowser(this.platformId);

  isLoading = false;
  interests: any[] = [];

  // ==========================================
  // CURRENT LANGUAGE
  // ==========================================

  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;

    setTimeout(async () => {
      await this.loadSentInterests();
    }, 0);
  }

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  private getStoredLoggedInUser(): any | null {
    if (!this.isBrowser) return null;

    try {
      const raw = localStorage.getItem('matrimony_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // ==========================================
  // IMAGE FALLBACK
  // ==========================================

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-avatar.png';
  }

  // ==========================================
  // LOAD SENT INTERESTS
  // ==========================================

  async loadSentInterests(): Promise<void> {

    this.isLoading = true;
    this.interests = [];
    this.cdr.detectChanges();

    try {

      const storedUser = this.getStoredLoggedInUser();

      const loggedUserId =
        storedUser?._id ||
        storedUser?.id ||
        storedUser?.userId ||
        storedUser?.user_id;

      if (!loggedUserId) {

        this.snackbar.info(
          this.currentLang === 'ta'
            ? 'நீங்கள் அனுப்பிய இன்ட்ரஸ்ட்களை பார்க்க முதலில் உங்கள் அக்கவுண்ட்டில் லாகின் செய்யுங்கள்.'
            : 'Please log in to your account to view the interest requests you have sent.',

          this.currentLang === 'ta'
            ? 'லாகின் செய்யுங்கள்'
            : 'Login required'
        );

        return;
      }

      const res: any = await firstValueFrom(
        this.http.get(
          `${this.apiUrl}/interests/sent/${loggedUserId}`
        )
      );

      this.interests = res?.data || [];

    } catch (err: any) {

      this.snackbar.error(
        this.currentLang === 'ta'
          ? 'நீங்கள் அனுப்பிய இன்ட்ரஸ்ட்களை தற்போது பார்க்க முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சி செய்யுங்கள். தொடர்ந்து இந்த பிரச்சனை இருந்தால் எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
          : 'Unable to load your sent interests at the moment. Please try again later. If the issue continues, contact our support team.',

        this.currentLang === 'ta'
          ? 'அனுப்பிய இன்ட்ரஸ்ட்களை பார்க்க முடியவில்லை'
          : 'Unable to load sent interests'
      );

    } finally {

      this.isLoading = false;
      this.cdr.detectChanges();

    }
  }

  // ==========================================
  // VIEW PROFILE
  // ==========================================

  viewProfile(item: any): void {

    if (!item?.receiver?.profile_code) {

      this.snackbar.warning(
        this.currentLang === 'ta'
          ? 'இந்த வரனின் பயோடேட்டாவை தற்போது பார்க்க முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சி செய்யுங்கள்.'
          : 'This biodata is currently unavailable. Please try again later.',

        this.currentLang === 'ta'
          ? 'பயோடேட்டாவை பார்க்க முடியவில்லை'
          : 'Biodata unavailable'
      );

      return;
    }

    this.router.navigate([
      '/free-profile',
      item.receiver.profile_code
    ]);
  }
}