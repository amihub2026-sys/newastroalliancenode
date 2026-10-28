import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  NgZone,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SUCCESS_STORY_PHOTOS, SuccessStoryPhoto } from './success-stories.data';
import { HomeDiscovery } from './home-discovery/home-discovery';

type ActiveForm = 'none' | 'register' | 'login' | 'match';
type Language = 'en' | 'ta';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HomeDiscovery],
  templateUrl: './home.html',
  styleUrls: ['./home.scss', './home-stories.scss']
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  activeForm: ActiveForm = 'none';
  readonly storyPhotos = SUCCESS_STORY_PHOTOS;
  trackStory(_: number, item: SuccessStoryPhoto) { return item.id; }
  currentLang: Language = 'en';

  readonly translations: Record<Language, any> = {
    en: {
      hero: [
        {
          title1: 'Find Your Perfect',
          title2: 'Life Partner',
          register: 'Register',
          login: 'Login',
          match: 'Find Your Match'
        },
        {
          title1: 'Trusted Profiles',
          title2: 'Meaningful Matches',
          register: 'Register',
          login: 'Login',
          match: 'Find Your Match'
        },
        {
          title1: 'Start Your Beautiful',
          title2: 'Journey Today',
          register: 'Register',
          login: 'Login',
          match: 'Find Your Match'
        },
        {
          title1: 'Begin Your New',
          title2: 'Happy Chapter',
          register: 'Register',
          login: 'Login',
          match: 'Find Your Match'
        },
{
  title1: 'Together Forever',
  title2: 'Starts Here',
  register: 'Register',
  login: 'Login',
  match: 'Find Your Match'
},
{
  title1: 'Meet Your Dream',
  title2: 'Soulmate Today',
  register: 'Register',
  login: 'Login',
  match: 'Find Your Match'
}
      ],
      popup: {
        registerTitle: 'Create Account',
        loginTitle: 'Login',
        matchTitle: 'Find Your Match',
        name: 'Name',
        namePlaceholder: 'Enter your name',
        email: 'Email',
        emailPlaceholder: 'Enter your email',
        password: 'Password',
        passwordPlaceholderRegister: 'Create password',
        passwordPlaceholderLogin: 'Enter your password',
        searchingFor: 'Searching For',
        lookingFor: 'I am looking for',
        ageFrom: 'Age From',
        ageTo: 'Age To',
        religion: 'Religion',
        registerBtn: 'Register',
        loginBtn: 'Login',
        searchBtn: 'Search Now',
        select: 'Select',
        self: 'Self',
        son: 'Son',
        daughter: 'Daughter',
        brother: 'Brother',
        sister: 'Sister',
        bride: 'Bride',
        groom: 'Groom',
        selectReligion: 'Select Religion',
        christian: 'Christian',
        hindu: 'Hindu',
        muslim: 'Muslim'
      },
      features: {
        mini: 'Why Choose Us',
        title: 'Find your special one with confidence',
        items: [
          {
            icon: '✅',
            title: 'Verified Profiles',
            text: 'Connect only with genuine and trusted matrimonial profiles.'
          },
          {
            icon: '🔒',
            title: 'Secure Platform',
            text: 'Your privacy and profile details are protected with care.'
          },
          {
            icon: '💖',
            title: 'Perfect Matches',
            text: 'Find meaningful connections based on your preferences.'
          }
        ]
      },
      welcome: {
        mini: 'Welcome to ASTRO ALLIANCE',
        title: 'Your trusted matrimony partner',
        text: 'We help families and individuals find meaningful, lasting relationships. Our platform is designed with trust, simplicity, and a smooth user experience.',
        stats: [
          { value: '✓', label: 'Approved profiles' },
          { value: '♡', label: 'Thoughtful matching' },
          { value: '☆', label: 'Member privacy' }
        ]
      },
      moments: {
        mini: 'Moments',
        title: 'How It Works',
        steps: [
          {
            no: '1',
            title: 'Create Profile',
            text: 'Register and complete your details with preferences, family values, and partner expectations.'
          },
          {
            no: '2',
            title: 'Discover Matches',
            text: 'Browse suitable profiles using filters like age, religion, profession, and location.'
          },
          {
            no: '3',
            title: 'Send Interest',
            text: 'Show genuine interest and begin meaningful conversations with the right match.'
          },
          {
            no: '4',
            title: 'Start New Chapter',
            text: 'Build trust, involve families, and move forward toward a happy married life.'
          }
        ]
      },
      cta: {
        title: 'Start your matrimony journey today',
        text: 'Join now and meet genuine profiles for a meaningful future.',
        button: 'Create Free Account'
      }
    },
    ta: {
      hero: [
        {
          title1: 'உங்கள் சிறந்த',
          title2: 'வாழ்க்கைத்துணையை கண்டறியுங்கள்',
          register: 'பதிவு செய்யவும்',
          login: 'உள்நுழையவும்',
          match: 'உங்கள் இணையை காண்க'
        },
        {
          title1: 'நம்பகமான சுயவிவரங்கள்',
          title2: 'அர்த்தமுள்ள இணைகள்',
          register: 'பதிவு செய்யவும்',
          login: 'உள்நுழையவும்',
          match: 'உங்கள் இணையை காண்க'
        },
        {
          title1: 'உங்கள் அழகான',
          title2: 'பயணத்தை இன்று தொடங்குங்கள்',
          register: 'பதிவு செய்யவும்',
          login: 'உள்நுழையவும்',
          match: 'உங்கள் இணையை காண்க'
        },
        {
          title1: 'உங்கள் புதிய',
          title2: 'மகிழ்ச்சியான அத்தியாயத்தை தொடங்குங்கள்',
          register: 'பதிவு செய்யவும்',
          login: 'உள்நுழையவும்',
          match: 'உங்கள் இணையை காண்க'
        },
{
  title1: 'என்றும் இணையும்',
  title2: 'அழகான உறவு',
  register: 'பதிவு செய்யவும்',
  login: 'உள்நுழையவும்',
  match: 'உங்கள் இணையை காண்க'
},
{
  title1: 'உங்கள் கனவு',
  title2: 'இணையை இன்று சந்திக்கவும்',
  register: 'பதிவு செய்யவும்',
  login: 'உள்நுழையவும்',
  match: 'உங்கள் இணையை காண்க'
}
      ],
      popup: {
        registerTitle: 'கணக்கு உருவாக்கு',
        loginTitle: 'உள்நுழைவு',
        matchTitle: 'உங்கள் இணையை தேடுங்கள்',
        name: 'பெயர்',
        namePlaceholder: 'உங்கள் பெயரை உள்ளிடவும்',
        email: 'மின்னஞ்சல்',
        emailPlaceholder: 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
        password: 'கடவுச்சொல்',
        passwordPlaceholderRegister: 'கடவுச்சொல் உருவாக்கவும்',
        passwordPlaceholderLogin: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
        searchingFor: 'யாருக்காக தேடுகிறீர்கள்',
        lookingFor: 'நான் தேடுவது',
        ageFrom: 'வயது முதல்',
        ageTo: 'வயது வரை',
        religion: 'மதம்',
        registerBtn: 'பதிவு செய்யவும்',
        loginBtn: 'உள்நுழையவும்',
        searchBtn: 'இப்போது தேடுங்கள்',
        select: 'தேர்வு செய்யவும்',
        self: 'எனக்காக',
        son: 'மகனுக்காக',
        daughter: 'மகளுக்காக',
        brother: 'அண்ணன் / தம்பிக்காக',
        sister: 'அக்கா / தங்கைக்காக',
        bride: 'மணமகள்',
        groom: 'மணமகன்',
        selectReligion: 'மதத்தைத் தேர்வு செய்யவும்',
        christian: 'கிறிஸ்துவர்',
        hindu: 'இந்துவர்',
        muslim: 'முஸ்லிம்'
      },
      features: {
        mini: 'எங்களை ஏன் தேர்வு செய்ய வேண்டும்',
        title: 'நம்பிக்கையுடன் உங்கள் சிறப்பான இணையை கண்டுபிடிக்கவும்',
        items: [
          {
            icon: '✅',
            title: 'சரிபார்க்கப்பட்ட சுயவிவரங்கள்',
            text: 'உண்மையான மற்றும் நம்பகமான திருமண சுயவிவரங்களுடன் மட்டும் இணைக.'
          },
          {
            icon: '🔒',
            title: 'பாதுகாப்பான தளம்',
            text: 'உங்கள் தனியுரிமை மற்றும் சுயவிவரத் தகவல்கள் பாதுகாப்பாக பராமரிக்கப்படுகின்றன.'
          },
          {
            icon: '💖',
            title: 'சரியான பொருத்தங்கள்',
            text: 'உங்கள் விருப்பங்களின் அடிப்படையில் அர்த்தமுள்ள உறவுகளை கண்டறியுங்கள்.'
          }
        ]
      },
      welcome: {
        mini: 'ASTRO ALLIANCE-க்கு வரவேற்கிறோம்',
        title: 'உங்கள் நம்பகமான திருமண துணை',
        text: 'குடும்பங்களும் தனிநபர்களும் அர்த்தமுள்ள, நீண்டநாள் உறவுகளை கண்டுபிடிக்க நாங்கள் உதவுகிறோம். நம்பிக்கை, எளிமை, மற்றும் மென்மையான பயனர் அனுபவத்துடன் எங்கள் தளம் வடிவமைக்கப்பட்டுள்ளது.',
        stats: [
          { value: '✓', label: 'அங்கீகரிக்கப்பட்ட சுயவிவரங்கள்' },
          { value: '♡', label: 'பொருத்தமான இணைகள்' },
          { value: '☆', label: 'உறுப்பினர் தனியுரிமை' }
        ]
      },
      moments: {
        mini: 'பயண கட்டங்கள்',
        title: 'எப்படி இது செயல்படுகிறது',
        steps: [
          {
            no: '1',
            title: 'சுயவிவரம் உருவாக்கு',
            text: 'உங்கள் விருப்பங்கள், குடும்ப மதிப்புகள் மற்றும் எதிர்பார்ப்புகளுடன் பதிவு செய்து விவரங்களை பூர்த்தி செய்யுங்கள்.'
          },
          {
            no: '2',
            title: 'இணைகளை கண்டறி',
            text: 'வயது, மதம், தொழில் மற்றும் இருப்பிடம் போன்ற வடிகட்டல்களைக் கொண்டு பொருத்தமான சுயவிவரங்களை பார்வையிடுங்கள்.'
          },
          {
            no: '3',
            title: 'விருப்பம் தெரிவிக்கவும்',
            text: 'உண்மையான விருப்பத்தை வெளிப்படுத்தி, சரியான இணையுடன் அர்த்தமுள்ள உரையாடலை தொடங்குங்கள்.'
          },
          {
            no: '4',
            title: 'புதிய அத்தியாயம் தொடங்கு',
            text: 'நம்பிக்கையை உருவாக்கி, குடும்பங்களை இணைத்து, மகிழ்ச்சியான திருமண வாழ்க்கைக்குப் பயணம் செய்யுங்கள்.'
          }
        ]
      },
      cta: {
        title: 'உங்கள் திருமண பயணத்தை இன்று தொடங்குங்கள்',
        text: 'இப்போது இணையுங்கள் மற்றும் அர்த்தமுள்ள எதிர்காலத்திற்கான உண்மையான சுயவிவரங்களை சந்திக்கவும்.',
        button: 'இலவச கணக்கு உருவாக்கு'
      }
    }
  };

  get t() {
    return this.translations[this.currentLang];
  }

  currentSlide = 0;
  readonly totalSlides = 6;
  private heroIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly heroSlideDelay = 5000;

  welcomeCurrentSlide = 0;
  readonly welcomeSlidesCount = 4;
  private welcomeIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly welcomeSlideDelay = 3200;

  private revealObserver: IntersectionObserver | null = null;

  constructor(
    private readonly zone: NgZone,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const savedLang = localStorage.getItem('tm_language') as Language | null;
    if (savedLang === 'en' || savedLang === 'ta') {
      this.currentLang = savedLang;
    }

    window.addEventListener('app-language-changed', this.handleLanguageChange);
    this.startHeroSlider();
    this.startWelcomeSlider();
    this.setupVisibilityHandling();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.initRevealAnimations();
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    this.stopHeroSlider();
    this.stopWelcomeSlider();
    this.destroyRevealObserver();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('app-language-changed', this.handleLanguageChange);
  }

private readonly handleLanguageChange = (event: Event): void => {
  const customEvent = event as CustomEvent<Language>;
  const lang = customEvent.detail;

  if (lang === 'en' || lang === 'ta') {
    this.currentLang = lang;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.refreshRevealAnimations();
    }, 0);
  }
};
  showForm(type: Exclude<ActiveForm, 'none'>): void {
    this.activeForm = type;
  }

  closeForm(): void {
    this.activeForm = 'none';
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  startHeroSlider(): void {
    if (!this.isBrowser) return;

    this.stopHeroSlider();

    this.zone.runOutsideAngular(() => {
      this.heroIntervalId = setInterval(() => {
        this.zone.run(() => {
          this.currentSlide = this.getNextIndex(this.currentSlide, this.totalSlides);
        });
      }, this.heroSlideDelay);
    });
  }

  stopHeroSlider(): void {
    if (this.heroIntervalId !== null) {
      clearInterval(this.heroIntervalId);
      this.heroIntervalId = null;
    }
  }

  resetHeroSlider(): void {
    this.startHeroSlider();
  }

  nextSlide(): void {
    this.currentSlide = this.getNextIndex(this.currentSlide, this.totalSlides);
    this.resetHeroSlider();
  }

  prevSlide(): void {
    this.currentSlide = this.getPrevIndex(this.currentSlide, this.totalSlides);
    this.resetHeroSlider();
  }

  goToSlide(index: number): void {
    if (index < 0 || index >= this.totalSlides || index === this.currentSlide) {
      return;
    }
    this.currentSlide = index;
    this.resetHeroSlider();
  }

  startWelcomeSlider(): void {
    if (!this.isBrowser) return;

    this.stopWelcomeSlider();

    this.zone.runOutsideAngular(() => {
      this.welcomeIntervalId = setInterval(() => {
        this.zone.run(() => {
          this.welcomeCurrentSlide = this.getNextIndex(
            this.welcomeCurrentSlide,
            this.welcomeSlidesCount
          );
        });
      }, this.welcomeSlideDelay);
    });
  }

  stopWelcomeSlider(): void {
    if (this.welcomeIntervalId !== null) {
      clearInterval(this.welcomeIntervalId);
      this.welcomeIntervalId = null;
    }
  }

  initRevealAnimations(): void {
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') {
      return;
    }
    

    const revealElements =
      this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.reveal');

    if (!revealElements.length) return;

    this.destroyRevealObserver();

    this.revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((element) => {
      this.revealObserver?.observe(element);
    });
  }
private refreshRevealAnimations(): void {
  if (!this.isBrowser) return;

  this.destroyRevealObserver();

  const revealElements =
    this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.reveal');

  revealElements.forEach((element) => {
    element.classList.add('active');
  });

  this.initRevealAnimations();
}
  private destroyRevealObserver(): void {
    if (this.revealObserver) {
      this.revealObserver.disconnect();
      this.revealObserver = null;
    }
  }

  private setupVisibilityHandling(): void {
    if (!this.isBrowser) return;
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private readonly handleVisibilityChange = (): void => {
    if (!this.isBrowser) return;

    if (document.hidden) {
      this.stopHeroSlider();
      this.stopWelcomeSlider();
      return;
    }

    this.startHeroSlider();
    this.startWelcomeSlider();
  };

  private getNextIndex(current: number, total: number): number {
    return (current + 1) % total;
  }

  private getPrevIndex(current: number, total: number): number {
    return (current - 1 + total) % total;
  }
}