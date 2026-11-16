import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { LanguageService } from '../core/services/language.service';
import { SnackbarService } from '../shared/snackbar.service';
import { AuthService } from '../services/auth.service';
import { MasterService } from '../services/master.service';

interface ReligionOption {
  religion_name: string;
  religion_name_ta: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register implements OnInit, OnDestroy {
  private app = inject(LanguageService);
  private router = inject(Router);
  private snackbar = inject(SnackbarService);
  private authService = inject(AuthService);
  private masterService = inject(MasterService);

  private subscriptions: Subscription[] = [];

  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  profileFor = '';
  gender = '';
  age: number | null = null;
  dob = '';
  religion = '';
  religionList: ReligionOption[] = [];
  location = '';
  acceptedTerms = false;
  isLoading = false;
  showTermsPopup = false;

  maxDate = new Date(
    new Date().setFullYear(new Date().getFullYear() - 18)
  ).toISOString().split('T')[0];

  translations = {
    en: {
      left: {
        tag: 'Join ASTRO ALLIANCE',
        title: 'Create your matrimony profile today',
        subtitle: 'Register now to connect with genuine profiles, explore matches, and start your journey toward a happy married life.',
        points: [
          'Create your profile in minutes',
          'Your details stay safe and private',
          'Find trusted and meaningful matches'
        ]
      },
      form: {
        miniTitle: 'Sign Up',
        title: 'Create Account',
        subtitle: 'Fill in your details to start your matrimony journey.',
        firstName: 'First Name',
        firstNamePlaceholder: 'Enter first name',
        lastName: 'Last Name',
        lastNamePlaceholder: 'Enter last name',
        email: 'Email Address',
        emailPlaceholder: 'Enter your email',
        phone: 'Phone Number',
        phonePlaceholder: 'Enter your phone number',
        gender: 'Gender',
        genderPlaceholder: 'Select Gender',
        male: 'Male',
        female: 'Female',
        age: 'Age',
        agePlaceholder: 'Enter your age',
        dob: 'Date of Birth',
        profileFor: 'Profile For',
        profileForPlaceholder: 'Select',
        self: 'Self',
        daughter: 'Daughter',
        son: 'Son',
        sister: 'Sister',
        brother: 'Brother',
        relative: 'Relative',
        friend: 'Friend',
        religion: 'Religion',
        religionPlaceholder: 'Select Religion',
        location: 'Location',
        locationPlaceholder: 'Enter your city / location',
        terms: 'I agree to the Terms & Conditions',
        button: 'Create Account',
        creating: 'Creating Account...',
        bottomText: 'Already have an account?',
        loginNow: 'Login Now'
      },
      alerts: {
        fillAll: 'Please fill all required fields.',
        acceptTerms: 'Please accept the Terms & Conditions.',
        ageInvalid: 'Age must be 18 or above',
        phoneInvalid: 'Phone number must be exactly 10 digits.',
        registerSuccess: 'Registration successful.',
        somethingWrong: 'Something went wrong. Please try again.'
      },
      termsPopup: {
        title: 'Important Notice',
        message1: 'Please provide only correct and true information. Fake details, wrong photos, or misleading profile information are strictly not allowed.',
        message2: 'If any false information is found, we may suspend or permanently remove the account and take necessary action.',
        okButton: 'I Understand'
      }
    },
    ta: {
      left: {
        tag: 'ASTRO ALLIANCE இல் சேருங்கள்',
        title: 'இன்றே உங்கள் மேட்ரிமோனி சுயவிவரத்தை உருவாக்குங்கள்',
        subtitle: 'உண்மையான சுயவிவரங்களுடன் இணைய, பொருத்தங்களை பார்க்க, மகிழ்ச்சியான திருமண வாழ்க்கைக்கான உங்கள் பயணத்தை தொடங்க இப்போது பதிவு செய்யுங்கள்.',
        points: [
          'சில நிமிடங்களில் உங்கள் சுயவிவரத்தை உருவாக்குங்கள்',
          'உங்கள் விவரங்கள் பாதுகாப்பாகவும் தனிப்பட்டதாகவும் இருக்கும்',
          'நம்பகமான மற்றும் அர்த்தமுள்ள பொருத்தங்களை கண்டுபிடிக்கவும்'
        ]
      },
      form: {
        miniTitle: 'பதிவு',
        title: 'கணக்கு உருவாக்கவும்',
        subtitle: 'உங்கள் திருமண பயணத்தை தொடங்க உங்கள் விவரங்களை நிரப்பவும்.',
        firstName: 'முதல் பெயர்',
        firstNamePlaceholder: 'முதல் பெயரை உள்ளிடவும்',
        lastName: 'கடைசி பெயர்',
        lastNamePlaceholder: 'கடைசி பெயரை உள்ளிடவும்',
        email: 'மின்னஞ்சல் முகவரி',
        emailPlaceholder: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
        phone: 'தொலைபேசி எண்',
        phonePlaceholder: 'உங்கள் தொலைபேசி எண்ணை உள்ளிடவும்',
        gender: 'பாலினம்',
        genderPlaceholder: 'பாலினத்தை தேர்வு செய்யவும்',
        male: 'ஆண்',
        female: 'பெண்',
        age: 'வயது',
        agePlaceholder: 'உங்கள் வயதை உள்ளிடவும்',
        dob: 'பிறந்த தேதி',
        profileFor: 'சுயவிவரம் யாருக்காக',
        profileForPlaceholder: 'தேர்வு செய்யவும்',
        self: 'நான்',
        daughter: 'மகள்',
        son: 'மகன்',
        sister: 'சகோதரி',
        brother: 'சகோதரர்',
        relative: 'உறவினர்',
        friend: 'நண்பர்',
        religion: 'மதம்',
        religionPlaceholder: 'மதத்தை தேர்வு செய்யவும்',
        location: 'இடம்',
        locationPlaceholder: 'உங்கள் நகரம் / இடத்தை உள்ளிடவும்',
        terms: 'நான் விதிமுறைகள் மற்றும் நிபந்தனைகளை ஒப்புக்கொள்கிறேன்',
        button: 'கணக்கு உருவாக்கவும்',
        creating: 'கணக்கு உருவாக்கப்படுகிறது...',
        bottomText: 'ஏற்கனவே கணக்கு உள்ளதா?',
        loginNow: 'இப்போது உள்நுழைக'
      },
      alerts: {
        fillAll: 'தேவையான அனைத்து விவரங்களையும் நிரப்பவும்.',
        acceptTerms: 'விதிமுறைகள் மற்றும் நிபந்தனைகளை ஒப்புக்கொள்ளவும்.',
        ageInvalid: '18 வயது அல்லது அதற்கு மேல் இருக்க வேண்டும்.',
        phoneInvalid: 'தொலைபேசி எண் சரியாக 10 இலக்கங்கள் இருக்க வேண்டும்.',
        registerSuccess: 'பதிவு வெற்றிகரமாக முடிந்தது.',
        somethingWrong: 'ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.'
      },
      termsPopup: {
        title: 'முக்கிய அறிவிப்பு',
        message1: 'தயவுசெய்து சரியான மற்றும் உண்மையான தகவல்களை மட்டும் வழங்கவும். போலியான விவரங்கள், தவறான புகைப்படங்கள் அல்லது தவறான சுயவிவர தகவல்கள் அனுமதிக்கப்படாது.',
        message2: 'ஏதேனும் தவறான தகவல் கண்டறியப்பட்டால், உங்கள் கணக்கு தற்காலிகமாக நிறுத்தப்படலாம் அல்லது நிரந்தரமாக நீக்கப்படலாம். தேவையான நடவடிக்கையும் எடுக்கப்படும்.',
        okButton: 'புரிந்துகொண்டேன்'
      }
    }
  };

  ngOnInit(): void {
    this.loadReligions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  get tr() {
    return this.translations[this.currentLang];
  }

  get dobLabel(): string {
    const labels: any = {
      en: {
        Self: 'Your Date of Birth',
        Daughter: "Daughter's Date of Birth",
        Son: "Son's Date of Birth",
        Sister: "Sister's Date of Birth",
        Brother: "Brother's Date of Birth",
        Relative: "Relative's Date of Birth",
        Friend: "Friend's Date of Birth"
      },
      ta: {
        Self: 'உங்கள் பிறந்த தேதி',
        Daughter: 'மகளின் பிறந்த தேதி',
        Son: 'மகனின் பிறந்த தேதி',
        Sister: 'சகோதரியின் பிறந்த தேதி',
        Brother: 'சகோதரரின் பிறந்த தேதி',
        Relative: 'உறவினரின் பிறந்த தேதி',
        Friend: 'நண்பரின் பிறந்த தேதி'
      }
    };

    return labels[this.currentLang][this.profileFor] || this.tr.form.dob;
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const code = event.which || event.keyCode;
    if (code < 48 || code > 57) event.preventDefault();
  }

  blockInvalidPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') || '';
    if (!/^[0-9]+$/.test(text)) event.preventDefault();
  }
handleTyping(event: KeyboardEvent): void {
  if (this.currentLang !== 'ta') return;

  const convertThis = (window as any).convertThis;

  if (typeof convertThis !== 'function') return;

  convertThis(event);

  setTimeout(() => {
    const input = event.target as HTMLInputElement;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, 0);
}
onProfileForChange(value: string): void {
  if (value === 'Daughter' || value === 'Sister') {
    this.gender = 'Female';
    return;
  }

  if (value === 'Son' || value === 'Brother') {
    this.gender = 'Male';
    return;
  }

  this.gender = '';
}

  onTermsChange(): void {
    if (this.acceptedTerms) this.showTermsPopup = true;
  }

  closeTermsPopup(): void {
    this.showTermsPopup = false;
  }

  calculateAge(): void {
    const birthDate = this.getBirthDate();

    if (!birthDate) {
      this.age = null;
      return;
    }

    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    this.age = age;
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
    this.calculateAge();
  }

  onMobileDatePick(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.value) return;

    const [year, month, day] = input.value.split('-');

    this.dob = `${day}-${month}-${year}`;
    this.calculateAge();
  }

  loadReligions(): void {
    const sub = this.masterService.getReligions().subscribe({
      next: (res) => {
        this.religionList = (res.data || []).map((item: any) => ({
          religion_name: item.nameEn,
          religion_name_ta: item.nameTa
        }));
      },
      error: (err) => {
        console.error('Religion load error:', err);
        this.religionList = [];
      }
    });

    this.subscriptions.push(sub);
  }

  onRegister(): void {
    if (this.isLoading) return;
    if (!this.isFormValid()) return;

    const payload = {
      name: this.getFullName(),
      fullName: this.getFullName(),
      fullNameTa: '',
      mobile: this.normalizePhone(this.phone),
      dob: this.getNodeDob(),
      email: this.normalizeEmail(this.email),
      gender: this.gender.trim(),
      age: this.age,
      religion: this.religion.trim(),
      location: this.location.trim(),
      profileFor: this.profileFor.trim()
    };

    this.isLoading = true;

    const sub = this.authService.register(payload).subscribe({
next: (res) => {
        // Registration creates a DRAFT profile. Retain the registration session
        // ONLY so the member can complete their own eight-step Biodata.
        // Both the route guard and backend must restrict draft users to onboarding.
     if (!res?.data?.token || !res?.data?.user || !res?.data?.profile) {
  this.isLoading = false;

  this.snackbar.warning(
    this.currentLang === 'ta'
      ? 'உங்கள் ரெஜிஸ்ட்ரேஷன் விவரங்கள் பெறப்பட்டுள்ளன. ஆனால் பயோடேட்டா பக்கத்தை திறக்க முடியவில்லை. மீண்டும் ரெஜிஸ்டர் செய்யாமல் எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
      : 'Your registration details have been received, but the biodata page could not be opened. Please contact our support team instead of registering again.',

    this.currentLang === 'ta'
      ? 'பயோடேட்டா பக்கத்தை திறக்க முடியவில்லை'
      : 'Unable to open biodata'
  );

  return;
}
this.authService.logout(); // remove an unrelated previous member session
this.authService.saveUserSession(res.data);

this.snackbar.success(
  this.currentLang === 'ta'
    ? 'உங்கள் ரெஜிஸ்ட்ரேஷன் முடிந்துவிட்டது. அடுத்ததாக பயோடேட்டா விவரங்களை முழுமையாக நிரப்பி சப்மிட் செய்யுங்கள். அதன் பிறகு அட்மின் உங்கள் பயோடேட்டாவை சரிபார்ப்பார்.'
    : 'Your registration is complete. Next, fill in and submit your biodata for admin approval.',

  this.currentLang === 'ta'
    ? 'ரெஜிஸ்ட்ரேஷன் வெற்றிகரமாக முடிந்தது!'
    : 'Registration successful!'
);

void this.router.navigate(['/biodata']);
      },
  error: (err) => {
  this.isLoading = false;

  this.snackbar.error(
    this.currentLang === 'ta'
      ? 'உங்கள் ரெஜிஸ்ட்ரேஷன் முடிந்ததா என்று உறுதி செய்ய முடியவில்லை. ஏற்கனவே ரெஜிஸ்டர் செய்திருந்தால் லாகின் செய்து பாருங்கள். முடியவில்லை என்றால் எங்கள் சப்போர்ட் டீமை தொடர்பு கொள்ளுங்கள்.'
      : 'We could not confirm your registration. If you have already registered, try logging in. If you need help, please contact our support team.',

    this.currentLang === 'ta'
      ? 'ரெஜிஸ்ட்ரேஷனை உறுதி செய்ய முடியவில்லை'
      : 'Unable to confirm registration'
  );
},
      complete: () => {
        this.isLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

private isFormValid(): boolean {
  if (
    !this.firstName.trim() ||
    !this.phone.trim() ||
    !this.profileFor.trim() ||
    !this.gender.trim() ||
    !this.age ||
    !this.dob ||
    !this.religion.trim()
  ) {
    this.snackbar.warning(
      this.currentLang === 'ta'
        ? 'ரெஜிஸ்ட்ரேஷனை முடிக்க தேவையான அனைத்து விவரங்களையும் நிரப்பி, மீண்டும் முயற்சி செய்யுங்கள்.'
        : 'Please fill in all the required details to complete your registration.',

      this.currentLang === 'ta'
        ? 'விவரங்களை முழுமையாக நிரப்புங்கள்'
        : 'Required details missing'
    );

    return false;
  }

    if (!this.acceptedTerms) {

  this.snackbar.warning(
    this.currentLang === 'ta'
      ? 'ரெஜிஸ்ட்ரேஷனை தொடர, Terms & Conditions படித்து அதற்கு அருகில் உள்ள டிக் பாக்ஸை தேர்வு செய்யுங்கள்.'
      : 'Please read and accept the Terms & Conditions by selecting the checkbox to continue your registration.',

    this.currentLang === 'ta'
      ? 'Terms & Conditions ஏற்கவும்'
      : 'Accept Terms & Conditions'
  );

  return false;
}

  if (!this.age || this.age < 18) {

  this.snackbar.warning(
    this.currentLang === 'ta'
      ? 'ரெஜிஸ்டர் செய்ய குறைந்தபட்சம் 18 வயது இருக்க வேண்டும். நீங்கள் கொடுத்த பிறந்த தேதியை சரிபார்க்கவும்.'
      : 'You must be at least 18 years old to register. Please check the entered date of birth.',

    this.currentLang === 'ta'
      ? 'வயது தகுதி இல்லை'
      : 'Age requirement not met'
  );

  return false;
}

  if (!/^[0-9]{10}$/.test(this.normalizePhone(this.phone))) {

  this.snackbar.warning(
    this.currentLang === 'ta'
      ? 'உங்கள் மொபைல் நம்பர் 10 இலக்கங்கள் கொண்டதாக இருக்க வேண்டும். சரியான மொபைல் நம்பரை கொடுத்து மீண்டும் முயற்சி செய்யுங்கள்.'
      : 'Your mobile number must contain 10 digits. Please enter a valid mobile number and try again.',

    this.currentLang === 'ta'
      ? 'மொபைல் நம்பர் தவறாக உள்ளது'
      : 'Invalid mobile number'
  );

  return false;
}
    return true;
  }

  private normalizeEmail(value: string): string {
    return String(value || '').trim().toLowerCase();
  }

  private normalizePhone(value: string): string {
    return String(value || '').replace(/\D/g, '').trim();
  }

  private getFullName(): string {
    return `${this.firstName.trim()} ${this.lastName.trim()}`.trim();
  }

  private getBirthDate(): Date | null {
    if (!this.dob) return null;

    const parts = this.dob.split('-');

    if (parts.length === 3 && parts[0].length === 2) {
      const day = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const year = Number(parts[2]);

      const date = new Date(year, month, day);

      return isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(this.dob);

    return isNaN(date.getTime()) ? null : date;
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
}