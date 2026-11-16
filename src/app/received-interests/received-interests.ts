import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { SnackbarService } from '../shared/snackbar.service';
import { LanguageService } from '../core/services/language.service';
@Component({
  selector: 'app-received-interests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './received-interests.html',
  styleUrls: ['./received-interests.scss']
})
export class ReceivedInterests implements OnInit {
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  http = inject(HttpClient);
  authService = inject(AuthService);
  snackbar = inject(SnackbarService);
app = inject(LanguageService);
  apiUrl = environment.apiUrl;
  isBrowser = isPlatformBrowser(this.platformId);

  isLoading = false;
  interests: any[] = [];
get currentLang(): 'en' | 'ta' {
  return this.app.currentLang;
}
async ngOnInit(): Promise<void> {
  if (!this.isBrowser) return;

  await this.loadReceivedInterests();
}
  private showMessage(message: string): void {
    if (this.isBrowser) {
      window.alert(message);
    } else {

    }
  }

  private getStoredLoggedInUser(): any | null {
    if (!this.isBrowser) return null;

    try {
      const raw = localStorage.getItem('matrimony_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-avatar.png';
  }

async loadReceivedInterests(): Promise<void> {
  this.isLoading = true;
  this.interests = [];
  this.cdr.detectChanges();

  try {
    const loggedUserId = this.authService.getCurrentUserId();

  if (!loggedUserId) {

  this.snackbar.info(
    this.currentLang === 'ta'
      ? 'உங்களுக்கு வந்த இன்ட்ரஸ்ட் கோரிக்கைகளை பார்க்க முதலில் உங்கள் அக்கவுண்ட்டில் லாகின் செய்யுங்கள்.'
      : 'Please log in to your account to view the interest requests you have received.',

    this.currentLang === 'ta'
      ? 'லாகின் செய்யுங்கள்'
      : 'Login required'
  );

  return;
}

    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/interests/received/${loggedUserId}`)
    );

    this.interests = res?.data || [];

  } catch (err: any) {
    this.snackbar.error(
  this.currentLang === 'ta'
    ? 'உங்களுக்கு வந்த இன்ட்ரஸ்ட்களை தற்போது பார்க்க முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சி செய்யுங்கள். தொடர்ந்து இந்த பிரச்சனை இருந்தால் எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
    : 'Unable to load your received interests at the moment. Please try again after some time. If the issue continues, contact our support team.',

  this.currentLang === 'ta'
    ? 'வந்த இன்ட்ரஸ்ட்களை பார்க்க முடியவில்லை'
    : 'Unable to load received interests'
);

  } finally {
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
viewProfile(item: any): void {
  if (!item?.sender?.profile_code) {
    this.snackbar.warning(
  this.currentLang === 'ta'
    ? 'இந்த வரனின் பயோடேட்டாவை தற்போது பார்க்க முடியவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சி செய்யுங்கள். தொடர்ந்து இந்த பிரச்சனை இருந்தால் எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
    : 'This biodata is currently unavailable. Please try again later. If the issue continues, contact our support team.',

  this.currentLang === 'ta'
    ? 'பயோடேட்டாவை பார்க்க முடியவில்லை'
    : 'Biodata unavailable'
);
    return;
  }

  this.router.navigate(['/free-profile', item.sender.profile_code]);
}
async updateStatus(item: any, statusCode: 'accepted' | 'rejected'): Promise<void> {
  try {
    const url =
      statusCode === 'accepted'
        ? `${this.apiUrl}/interests/accept`
        : `${this.apiUrl}/interests/reject`;

    await firstValueFrom(
      this.http.post(url, {
        interestId: item.id || item._id
      })
    );

    item.status_code = statusCode;

if (statusCode === 'accepted') {

  this.snackbar.success(
    this.currentLang === 'ta'
      ? 'இந்த வரனின் இன்ட்ரஸ்ட்டை நீங்கள் ஏற்றுக்கொண்டீர்கள். இந்த வரனின் பயோடேட்டாவை பார்த்து திருமண பேச்சுவார்த்தையை தொடரலாம்.'
      : 'You have successfully accepted this interest request. You can view the biodata and proceed with further marriage discussions.',

    this.currentLang === 'ta'
      ? 'இன்ட்ரஸ்ட் ஏற்றுக்கொள்ளப்பட்டது!'
      : 'Interest accepted!'
  );

} else {

  this.snackbar.info(
    this.currentLang === 'ta'
      ? 'இந்த வரனின் இன்ட்ரஸ்ட்டை நீங்கள் நிராகரித்துள்ளீர்கள். உங்களுக்கு பொருத்தமான மற்ற வரன்களை தொடர்ந்து பார்க்கலாம்.'
      : 'You have declined this interest request. You can continue exploring other suitable profiles.',

    this.currentLang === 'ta'
      ? 'இன்ட்ரஸ்ட் நிராகரிக்கப்பட்டது'
      : 'Interest declined'
  );

}

this.cdr.detectChanges();
  } catch {
    this.snackbar.error(
  this.currentLang === 'ta'
    ? 'உங்கள் இன்ட்ரஸ்ட் பதில் சேவ் செய்யப்பட்டுள்ளதா என்பதை உறுதி செய்ய முடியவில்லை. பக்கத்தை ரெஃப்ரெஷ் செய்து தற்போதைய நிலையை சரிபார்க்கவும். தொடர்ந்து இந்த பிரச்சனை இருந்தால் எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
    : 'Unable to confirm whether your interest response has been saved. Please refresh the page and check the current status. If the issue continues, contact our support team.',

  this.currentLang === 'ta'
    ? 'இன்ட்ரஸ்ட் பதிலை உறுதி செய்ய முடியவில்லை'
    : 'Unable to confirm interest response'
);
  }
}
}