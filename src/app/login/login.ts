import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { LanguageService } from '../core/services/language.service';
import { SnackbarService } from '../shared/snackbar.service';
import { AuthService } from '../services/auth.service';

type LoginType = 'user' | 'admin';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit, OnDestroy {

  private app = inject(LanguageService);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  private subscriptions: Subscription[] = [];

  phone = '';
  dob = ''; // ISO date (YYYY-MM-DD), selected using the browser date picker
  isLoading = false;
  loginType: LoginType = 'user';

  maxDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 18)
  ).toISOString().split('T')[0];

  translations = {
    en: {
      left: {
        tag: 'Welcome Back',
        title: 'Find your perfect match with ASTRO ALLIANCE',
        subtitle:
          'Login to access verified profiles, manage your account, and continue your journey toward a meaningful relationship.',
        points: [
          'Trusted matrimony platform',
          'Secure and private profile access',
          'Verified and genuine connections'
        ]
      },
      form: {
        miniTitle: 'Sign In',
        title: 'Login to Your Account',
        subtitle: 'Enter your details below to continue.',
        phone: 'Phone Number',
        phonePlaceholder: 'Enter your number',
        dob: 'DOB',
        loginBtn: 'Login Now',
        loggingIn: 'Logging in...',
        or: 'or continue with',
        registerText: 'Don’t have an account?',
        registerBtn: 'Register Now'
      },
      alerts: {
        fillAll: 'Please fill all fields.',
        loginSuccess: 'Login successful.',
        adminLoginSuccess: 'Admin login successful.',
        adminInvalid: 'Invalid admin credentials.',
        somethingWrong: 'Something went wrong. Please try again.',
        phoneInvalid: 'Please enter a valid 10 digit mobile number.',
        dobInvalid: 'Please enter a valid date of birth.',
        ageInvalid: 'Age must be 18 or above'
      }
    },
    ta: {
      left: {
        tag: 'மீண்டும் வரவேற்கிறோம்',
        title: 'ASTRO ALLIANCE மூலம் உங்கள் சரியான துணையை கண்டுபிடிக்கவும்',
        subtitle:
          'சரிபார்க்கப்பட்ட சுயவிவரங்களை அணுக, உங்கள் கணக்கை நிர்வகிக்க மற்றும் உங்கள் வாழ்க்கை பயணத்தை தொடர உள்நுழையவும்.',
        points: [
          'நம்பகமான மேட்ரிமோனி தளம்',
          'பாதுகாப்பான மற்றும் தனிப்பட்ட சுயவிவர அணுகல்',
          'சரிபார்க்கப்பட்ட உண்மையான தொடர்புகள்'
        ]
      },
      form: {
        miniTitle: 'உள்நுழைவு',
        title: 'உங்கள் கணக்கில் உள்நுழைக',
        subtitle: 'தொடர உங்கள் விவரங்களை கீழே உள்ளிடவும்.',
        phone: 'தொலைபேசி எண்',
        phonePlaceholder: 'உங்கள் எண்ணை உள்ளிடவும்',
        dob: 'பிறந்த தேதி',
        loginBtn: 'இப்போது உள்நுழைக',
        loggingIn: 'உள்நுழைகிறது...',
        or: 'அல்லது இதன்மூலம் தொடரவும்',
        registerText: 'உங்களுக்கு கணக்கு இல்லையா?',
        registerBtn: 'இப்போது பதிவு செய்யவும்'
      },
      alerts: {
        fillAll: 'அனைத்து விவரங்களையும் நிரப்பவும்.',
        loginSuccess: 'உள்நுழைவு வெற்றி.',
        adminLoginSuccess: 'நிர்வாகி உள்நுழைவு வெற்றி.',
        adminInvalid: 'தவறான நிர்வாகி விவரங்கள்.',
        somethingWrong: 'ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
        phoneInvalid: 'சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.',
        dobInvalid: 'சரியான பிறந்த தேதியை உள்ளிடவும்.',
        ageInvalid: '18 வயது அல்லது அதற்கு மேல் இருக்க வேண்டும்.'
      }
    }
  };

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  get tr() {
    return this.translations[this.currentLang];
  }

  setLoginType(type: LoginType): void {
    this.loginType = type;
    this.phone = '';
    this.dob = '';
  }

  formatDob(event: Event): void {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/\D/g, '');

    if (value.length > 2) {
      value = value.substring(0, 2) + '-' + value.substring(2);
    }

    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 9);
    }

    this.dob = value;
  }

  onMobileDatePick(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.value) return;

    const [year, month, day] = input.value.split('-');

    this.dob = `${day}-${month}-${year}`;
  }

  onLogin(): void {
    if (this.isLoading) return;

    const cleanPhone = this.normalizePhone(this.phone);
    const normalizedDob = this.getNodeDob();

    if (!this.validateLogin(cleanPhone, normalizedDob)) return;

    this.isLoading = true;

    const sub = this.authService.login({
      mobile: cleanPhone,
      dob: normalizedDob
    }).subscribe({
      next: (res) => {
        const profile = res?.data?.profile;
        const approved = profile?.profileStatus === 'approved' && profile?.isPublished === true;
        const needsBiodata = !profile || profile.profileStatus === 'draft';
        const correctionsRequested = profile?.profileStatus === 'rejected';
        if (!approved && !needsBiodata && !correctionsRequested) {
          if (res?.data?.token && res?.data?.user) {
            this.authService.logout();
            this.authService.saveUserSession(res.data);
          }
          this.snackbar.error(this.currentLang === 'ta'
            ? 'உங்கள் சுயவிவரம் நிர்வாகி ஒப்புதலுக்காகக் காத்திருக்கிறது.'
            : 'Your Biodata is pending admin approval. Free Search remains available.');
          void this.router.navigate(['/approval-pending']);
          return;
        }
        if (!res?.data?.token || !res?.data?.user) {
          this.snackbar.error(this.tr.alerts.somethingWrong);
          return;
        }
        if (needsBiodata || correctionsRequested) {
          // This token MUST be restricted to onboarding by the backend.
          this.authService.logout();
          this.authService.saveUserSession(res.data);
          this.snackbar.success(this.currentLang === 'ta'
            ? 'உங்கள் சுயவிவரத்தை நிரப்பவும் அல்லது திருத்தவும்.'
            : 'Complete or correct your Biodata before approval.');
          void this.router.navigate(['/biodata']);
          return;
        }
        this.authService.logout();
        this.authService.saveUserSession(res.data);

        this.snackbar.success(this.tr.alerts.loginSuccess);

        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.snackbar.error(
          err?.error?.message || this.tr.alerts.somethingWrong
        );
        this.stopLoading();
      },
      complete: () => {
        this.stopLoading();
      }
    });

    this.subscriptions.push(sub);
  }

  private validateLogin(cleanPhone: string, dateOfBirth: string): boolean {
    if (!/^\d{10}$/.test(cleanPhone)) {
      this.snackbar.error(this.tr.alerts.phoneInvalid);
      return false;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      this.snackbar.error(this.tr.alerts.dobInvalid);
      return false;
    }
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 ||
        parsed.getUTCDate() !== day || dateOfBirth > this.maxDate) {
      this.snackbar.error(this.tr.alerts.dobInvalid);
      return false;
    }
    return true;
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  private normalizePhone(value: string): string {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length > 10 ? digits.slice(-10) : digits;
  }

  private getNodeDob(): string {
    if (
      this.dob.includes('-') &&
      this.dob.split('-')[0].length === 2
    ) {
      return this.dob.split('-').reverse().join('-');
    }

    return this.dob;
  }

  private stopLoading(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}