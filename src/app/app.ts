import { LanguageService } from './core/services/language.service';
import { AuthService } from './services/auth.service';
import {
  Component,
  HostListener,
  inject,
  PLATFORM_ID
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../environments/environment';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { SnackbarComponent } from './shared/snackbar/snackbar';
import { SnackbarService } from './shared/snackbar.service';

type Language = 'en' | 'ta';

@Component({
  selector: 'app-root',
  standalone: true,
imports: [
  CommonModule,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  SnackbarComponent
],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
    private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private http = inject(HttpClient);
  private readonly auth = inject(AuthService);
apiUrl = environment.apiUrl;
  private isBrowser = isPlatformBrowser(this.platformId);
showFooter = true;
isAdminPage = false;
menuOpen = false;
private bodyOverflowBeforeMenu: string | null = null;
biodataMenuOpen = false;
mobileAccountMenuOpen = false;
private confirmedAccountStage: 'draft'|'pending'|'rejected'|'approved'|null = null;
private confirmedStageToken = '';
private lastMenuStatusCheck = 0;
private menuStatusChecking = false;
private readonly language = inject(LanguageService);
get currentLang(): Language { return this.language.currentLang; }
set currentLang(value: Language) { this.language.currentLang = value; }
isNavigating = false;

interestNotificationCount = 0;
receivedInterestCount = 0;
sentInterestCount = 0;
receivedInterestTotal = 0;
sentInterestTotal = 0;
hasBiodataStatus = false;
  translations: Record<Language, any> = {
    en: {
      nav: {
        home: 'Home',
        profiles: 'Find your match',
        plans: 'Plans',
        terms: 'Terms',
        login: 'Login',
        register: 'Register',
        biodata: 'Create Biodata',
        logout: 'Logout'
      },
      footer: {
        aboutTitle: 'ASTRO ❤ ALLIANCE',
        aboutText:
          'Trusted matrimony platform helping families and individuals find genuine and meaningful life partners.',
        quickLinks: 'Quick Links',
        contact: 'Contact',
        contactus: 'Contact Us',
        followUs: 'Follow Us',
        home: 'Home',
        profiles: 'Profiles',
        plans: 'Plans',
        terms: 'Terms & Conditions',
        login: 'Login',
        privacypolicy: 'Privacy Policy',
        location: 'Madurai, Tamil Nadu',
        phone: '+91 90421 11424',
        email: 'astroalliance7@gmail.com',
        copyright: '© 2026 Astro Alliance. All Rights Reserved.'
      }
    },
    ta: {
      nav: {
        home: 'ஹோம்',
        profiles: 'மேட்ச்சஸ்',
        plans: 'திட்டம்',
        terms: 'விதிமுறைகள்',
        login: 'உள்நுழைவு',
        register: 'பதிவு',
        biodata: 'பயோடேட்டா உருவாக்கு',
        logout: 'வெளியேறு'
      },
      footer: {
        aboutTitle: 'ஆஸ்ட்ரோ அலையன்ஸ் ❤ மேட்ரிமோனி',
        aboutText:
          'குடும்பங்களும் தனிநபர்களும் உண்மையான மற்றும் அர்த்தமுள்ள வாழ்க்கைத் துணையை கண்டுபிடிக்க உதவும் நம்பகமான திருமண தளம்.',
        quickLinks: 'விரைவு இணைப்புகள்',
        contact: 'தொடர்பு',
        contactus: 'தொடர்பு கொள்ள',
        followUs: 'எங்களை பின்தொடருங்கள்',
        home: 'ஹோம்',
        profiles: 'மேட்ச்சஸ்',
        plans: 'திட்டம்',
        terms: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
          privacypolicy: 'பிரைவசி பாலிசி',
        login: 'உள்நுழைவு',
        register: 'பதிவு',
        location: 'மதுரை, தமிழ்நாடு',
        phone: '+91 90421 11424',
        email: 'astroalliance7@gmail.com',
        copyright: '© 2026 ஆஸ்ட்ரோ அலையன்ஸ் மேட்ரிமோனி. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'
      }
    }
  };



constructor() {
  this.updateSiteChrome(this.router.url);
  if (this.isBrowser) {


    // Avoid an additional /profile/me request at application startup.
    // Member guards refresh status on protected navigation as needed.


    const savedLang =
      localStorage.getItem('tm_language') as Language | null;


    if (savedLang === 'en' || savedLang === 'ta') this.currentLang = savedLang;


    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {

        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto'
        });

        if (event.urlAfterRedirects.includes('/received-interests')) {
          this.markReceivedInterestsSeen();
        }

        if (event.urlAfterRedirects.includes('/sent-interests')) {
          this.markSentInterestsSeen();
        }

        this.updateSiteChrome(event.urlAfterRedirects);
        this.closeMenu();
      }
    });

  }
}

  private updateSiteChrome(url: string): void {
    const pathname = url.split('?')[0];
    this.isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/generateReportwithoutaddress');
    this.showFooter = !this.isAdminPage && ['/', '/plans', '/terms', '/privacy-policy', '/contact-us'].includes(pathname);
  }

  get t() {
    
    return this.translations[this.currentLang];
  }
get profilesNavText(): string {
  if (!this.isLoggedIn) {
    return this.currentLang === 'ta'
      ? 'இலவச தேடல்'
      : 'Free Search';
  }

  return this.currentLang === 'ta'
    ? 'பைண்ட் யுவர் மேட்ச்'
    : 'Find your match';
}
get isLoggedIn(): boolean {
  if (!this.isBrowser) return false;

  return this.auth.isLoggedIn();
}
get memberAvatar(): string {
  if (!this.isBrowser) return 'assets/avatars/person.svg';
  try {
    const user = JSON.parse(localStorage.getItem('matrimony_user') || '{}');
    const profile = JSON.parse(localStorage.getItem('matrimony_profile') || '{}');
    const url = String(profile?.profile_image_url || profile?.profileImage || profile?.basic?.profilePhoto || '');
    if (/^(https?:\/\/|\/assets\/|assets\/)/i.test(url)) return url;
    const gender = String(user.gender || profile?.basic?.gender || '').toLowerCase();
    if (gender.includes('female') || gender.includes('பெண்')) return 'assets/avatars/female.svg';
    if (gender.includes('male') || gender.includes('ஆண்')) return 'assets/avatars/male.svg';
    return 'assets/avatars/person.svg';
  } catch { return 'assets/avatars/person.svg'; }
}
onAvatarError(event: Event): void {
  const img = event.target as HTMLImageElement;
  if (!img.src.endsWith('/assets/avatars/person.svg')) { img.onerror = null; img.src = 'assets/avatars/person.svg'; }
}
/** Controls mobile menu labels only. The server-side guard still owns access decisions. */
get mobileAccountStage(): 'draft' | 'pending' | 'rejected' | 'approved' {
  if (!this.isBrowser) return 'draft';
  if (this.confirmedAccountStage && this.confirmedStageToken === (localStorage.getItem('matrimony_token') || '')) return this.confirmedAccountStage;
  const storedStatus = localStorage.getItem('profile_status');
  let profile: { profileStatus?: string; isPublished?: boolean } = {};
  try {
    profile = JSON.parse(localStorage.getItem('matrimony_profile') || '{}');
  } catch { /* Stored UI state can be corrupt; route guards remain authoritative. */ }
  const status = String(storedStatus || profile.profileStatus || 'draft').toLowerCase();
  if (status === 'approved') return profile.isPublished === false ? 'pending' : 'approved';
  if (status === 'pending') return 'pending';
  if (status === 'rejected') return 'rejected';
  return 'draft';
}

get mobileAccountStatusLabel(): string {
  const ta = this.currentLang === 'ta';
  switch (this.mobileAccountStage) {
    case 'approved': return ta ? 'அங்கீகரிக்கப்பட்ட சுயவிவரம்' : 'Approved member';
    case 'pending': return ta ? 'நிர்வாகி ஒப்புதலுக்காக காத்திருக்கிறது' : 'Awaiting admin approval';
    case 'rejected': return ta ? 'திருத்தம் தேவை' : 'Corrections requested';
    default: return ta ? 'சுயவிவரத்தைப் பூர்த்தி செய்யவும்' : 'Complete your Biodata';
  }
}

private async syncAccountMenuStage(): Promise<void> {
  if (!this.isBrowser || !this.auth.isLoggedIn() || this.menuStatusChecking ||
      Date.now() - this.lastMenuStatusCheck < 12000) return;
  this.menuStatusChecking = true;
  this.lastMenuStatusCheck = Date.now();
  const token = localStorage.getItem('matrimony_token') || '';
  try {
    const result = await firstValueFrom(this.auth.getUserFlowStatus().pipe(timeout(7000)));
    if (token !== (localStorage.getItem('matrimony_token') || '')) return;
    const flow = result?.data;
    if (!result?.success || !flow) return;
    const status = String(flow.profileStatus || '').toLowerCase();
    this.confirmedAccountStage = status === 'approved' ? (flow.isPublished === true ? 'approved' : 'pending') :
      status === 'pending' ? 'pending' : status === 'rejected' ? 'rejected' : 'draft';
    this.confirmedStageToken = token;
  } catch { /* Keep last-known display state; backend remains authoritative. */ }
  finally { this.menuStatusChecking = false; }
}

toggleMobileAccountMenu(): void {
  if (!this.isBrowser || window.innerWidth > 880) return;
  const shouldOpen = !this.mobileAccountMenuOpen;
  this.closeMenu();
  this.mobileAccountMenuOpen = shouldOpen;
  if (shouldOpen) void this.syncAccountMenuStage();
}

get hasBiodata(): boolean {

  if (!this.isBrowser) return false;

  const status =
    localStorage.getItem('profile_status');

  return (
    status === 'pending' ||
    status === 'approved'
  );
}
  /** Mobile navigation must never remain expanded on a desktop viewport. */
  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isBrowser && window.innerWidth > 880 && (this.menuOpen || this.mobileAccountMenuOpen)) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.menuOpen || this.biodataMenuOpen || this.mobileAccountMenuOpen) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    if (!this.isBrowser || window.innerWidth > 880) return;
    const shouldOpen = !this.menuOpen;
    this.closeMenu();
    if (shouldOpen) {
      this.menuOpen = true;
      this.bodyOverflowBeforeMenu = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.biodataMenuOpen = false;
    this.mobileAccountMenuOpen = false;
    if (this.isBrowser && this.bodyOverflowBeforeMenu !== null) {
      document.body.style.overflow = this.bodyOverflowBeforeMenu;
      this.bodyOverflowBeforeMenu = null;
    }
  }

  toggleBiodataMenu(): void {
    const shouldOpen = !this.biodataMenuOpen;
    this.closeMenu();
    this.biodataMenuOpen = shouldOpen;
    if (shouldOpen) void this.syncAccountMenuStage();
  }

async changeLanguage(lang: Language): Promise<void> {

  const activeComponent: any =
    (window as any).activeBiodataComponent;

  const activeProfileViewComponent: any =
    (window as any).activeProfileViewComponent;

  if (activeComponent?.onLanguageSwitch) {
    await activeComponent.onLanguageSwitch(lang);
  }

  this.currentLang = lang;

  if (this.isBrowser) {
    localStorage.setItem('tm_language', lang);

    window.dispatchEvent(
      new CustomEvent('app-language-changed', {
        detail: lang
      })
    );
  }

  if (
    activeProfileViewComponent &&
    lang === 'ta'
  ) {
    await activeProfileViewComponent.translateProfileValuesToTamil();
  }

  this.closeMenu();
}
async blockIfUnderVerification(path: string): Promise<boolean> {
  // Member-only routes are protected by authGuard; visitors use /free-search.
  // Never rely on an outdated localStorage flag to override server approval.
  return false;
}
  // ✅ NEW FUNCTION (DOUBLE CLICK FIX)
async goToPage(path: string): Promise<void> {

  if (await this.blockIfUnderVerification(path)) {
    return;
  }

  if (this.isNavigating) return;

  this.isNavigating = true;

  this.closeMenu();

  this.router.navigateByUrl(path).finally(() => {
    this.isNavigating = false;
  });
}
async loadInterestNotificationCount(): Promise<void> {
  this.interestNotificationCount = 0;
  this.receivedInterestCount = 0;
  this.sentInterestCount = 0;
}
markReceivedInterestsSeen(): void {
  localStorage.setItem(
    'seen_received_interest_count',
    String(this.receivedInterestTotal)
  );

  this.receivedInterestCount = 0;
  this.interestNotificationCount =
    this.receivedInterestCount + this.sentInterestCount;
}

markSentInterestsSeen(): void {
  localStorage.setItem(
    'seen_sent_interest_count',
    String(this.sentInterestTotal)
  );

  this.sentInterestCount = 0;
  this.interestNotificationCount =
    this.receivedInterestCount + this.sentInterestCount;
}
openReceivedInterests(): void {

  this.markReceivedInterestsSeen();

  this.closeMenu();

  this.goToPage('/received-interests');
}
openSentInterests(): void {

  this.markSentInterestsSeen();

  this.closeMenu();

  this.goToPage('/sent-interests');
}
async checkProfileStatus(){

  if(
    !localStorage.getItem('matrimony_token')
  ){
    return;
  }


  try {

    const res:any = await this.http
    .get(`${this.apiUrl}/profile/me`)
    .toPromise();


    const status =
      res?.profileStatus ||
      res?.data?.profileStatus;


    console.log(
      "Current profile status:",
      status
    );


    if(status){

      localStorage.setItem(
        'profile_status',
        status
      );


      if(status === 'approved'){

        localStorage.removeItem(
          'biodata_pending'
        );

      }

    }


  }
  catch(error){

    console.log(
      "Profile status error",
      error
    );

  }

}
  logout(): void {
    if (this.isBrowser) this.auth.logout();
    this.confirmedAccountStage = null;
    this.confirmedStageToken = '';

    this.closeMenu();
    this.router.navigate(['/login']);
  }
}
