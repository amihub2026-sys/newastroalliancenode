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
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SUCCESS_STORY_PHOTOS, SuccessStoryPhoto } from './success-stories.data';
import { HomeDiscovery } from './home-discovery/home-discovery';
import { finalize, timeout } from 'rxjs';


interface MatrimonyCommunity {
  nameEn: string;
  nameTa: string;
  count: number;
}


type ActiveForm = 'none' | 'register' | 'login' | 'match';
type Language = 'en' | 'ta';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HomeDiscovery],
  templateUrl: './home.html',
  styleUrls: [
  './home.scss',
  
  './home.responsive.scss'
]
})
export class Home implements OnInit, AfterViewInit, OnDestroy {

  
  // ==========================================
  // COMMUNITY COUNTS
  // ==========================================
  communitySearch = '';

  communityCounts: Record<string, number> = {};

  communityCountsLoading = false;

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private router = inject(Router);
  private http = inject(HttpClient);
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
  mini: 'WHY CHOOSE US',
  title: 'Find your life partner with confidence',
  items: [
    {
      icon: '👥',
      title: '1 Lakh+ Profiles',
      text: 'Explore a wide network of matrimonial profiles.'
    },
    {
      icon: '🏆',
      title: '10+ Successful Years',
      text: 'A decade of experience helping people begin their matrimonial journey.'
    },
    {
      icon: '🤝',
      title: 'Trusted Service',
      text: 'Personal guidance and friendly support throughout your matchmaking journey.'
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
  mini: 'ஏன் எங்களைத் தேர்ந்தெடுக்க வேண்டும்?',
  title: 'நம்பிக்கையுடன் உங்கள் வாழ்க்கைத் துணையைத் தேர்ந்தெடுங்கள்',
  items: [
    {
      icon: '👥',
      title: '1 லட்சத்திற்கும் மேற்பட்ட சுயவிவரங்கள்',
      text: 'பரந்த திருமண வரன் சுயவிவரங்களை ஆராயுங்கள்.'
    },
    {
      icon: '🏆',
      title: '10+ ஆண்டுகள் சிறப்பான சேவை',
      text: 'திருமண சேவையில் பத்து ஆண்டுகளுக்கும் மேலான அனுபவம்.'
    },
    {
      icon: '🤝',
      title: 'நம்பகமான சேவை',
      text: 'உங்கள் திருமணப் பயணத்தின் ஒவ்வொரு நிலையிலும் அன்பான வழிகாட்டுதலும் நட்பான ஆதரவும்.'
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


  /** Expected backend endpoint: GET /public/community-counts
   * Returns { counts: { "Nadar": 12, "Chettiar": 8 } }.
   * Must aggregate ALL approved + published profiles server-side.
   */
  

loadCommunityCounts(): void {
  this.communityCountsLoading = true;

  const url =
    `${environment.apiUrl}/profile/community-counts`;

  this.http.get<{
    success: boolean;
    counts: Record<string, number>;
  }>(url).subscribe({
    next: (response) => {
      console.log("Community counts:", response);

      this.communityCounts = response.counts ?? {};
      this.communityCountsLoading = false;
      this.cdr.markForCheck();
    },
    error: (error) => {
      console.error("Community counts error:", error);
      this.communityCounts = {};
      this.communityCountsLoading = false;
      this.cdr.markForCheck();
    }
  });
}

getCommunityCount(name: string): number {
  return this.communityCounts[name.trim().toLowerCase()] ?? 0;
}


  
ngOnInit(): void {

  if (!this.isBrowser) {
    return;
  }

  const savedLang =
    localStorage.getItem('tm_language') as Language | null;

  if (savedLang === 'en' || savedLang === 'ta') {
    this.currentLang = savedLang;
  }

  window.addEventListener(
    'app-language-changed',
    this.handleLanguageChange
  );

  this.startHeroSlider();
  this.startWelcomeSlider();
  this.setupVisibilityHandling();

  // Load real community counts once
  this.loadCommunityCounts();
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
      (this.elementRef.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.reveal');

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
    (this.elementRef.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.reveal');

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


  

showAllDesktopCommunities = false;
showAllMobileCommunities = false;

get visibleCommunities(): MatrimonyCommunity[] {
  const communities = this.filteredCommunities;

  // Show all matching results while searching
  if (this.communitySearch.trim()) {
    return communities;
  }

  // Server-side rendering: use the collapsed desktop count
  if (!this.isBrowser) {
    return communities.slice(0, 12);
  }

  // Desktop: 4 columns × 3 rows
  if (window.innerWidth > 880) {
    return this.showAllDesktopCommunities
      ? communities
      : communities.slice(0, 12);
  }

  // Mobile: 3 columns × 2 rows
  return this.showAllMobileCommunities
    ? communities
    : communities.slice(0, 6);
}

toggleDesktopCommunities(): void {
  this.showAllDesktopCommunities =
    !this.showAllDesktopCommunities;
}

toggleMobileCommunities(): void {
  this.showAllMobileCommunities =
    !this.showAllMobileCommunities;
}





selectedCommunity: MatrimonyCommunity | null = null;

readonly communities: MatrimonyCommunity[] = [
  { nameEn: 'Chettiar', nameTa: 'செட்டியார்', count: 7107 },
  { nameEn: 'Nadar', nameTa: 'நாடார்', count: 4604 },
  { nameEn: 'Naidu', nameTa: 'நாயுடு', count: 4563 },
  { nameEn: 'Vanniyar', nameTa: 'வன்னியர்', count: 4376 },
  { nameEn: 'Pillaimar', nameTa: 'பிள்ளைமார்', count: 4312 },
  { nameEn: 'Viswakarma', nameTa: 'விஸ்வகர்மா', count: 3078 },
  { nameEn: 'Yadavar', nameTa: 'யாதவர்', count: 2430 },
  { nameEn: 'Mudaliar', nameTa: 'முதலியார்', count: 2398 },
  { nameEn: 'Agamudaiyar', nameTa: 'அகமுடையார்', count: 2164 },
  { nameEn: 'Gounder', nameTa: 'கவுண்டர்', count: 2104 },
  { nameEn: 'PR', nameTa: 'PR', count: 1975 },
  { nameEn: 'Maravar', nameTa: 'மறவர்', count: 1658 },
  { nameEn: 'Kallar', nameTa: 'கள்ளர்', count: 1558 },
  { nameEn: 'Christian', nameTa: 'கிறிஸ்தவர்', count: 1498 },
  { nameEn: 'PL', nameTa: 'PL', count: 1260 },
  { nameEn: 'Muthuraja', nameTa: 'முத்துரையர்', count: 1009 },
  { nameEn: 'Udayar', nameTa: 'உடையார்', count: 780 },
  { nameEn: 'Reddiar', nameTa: 'ரெட்டியார்', count: 626 },
  { nameEn: 'Veerasaivam', nameTa: 'வீரசைவம்', count: 548 },
  { nameEn: 'Brahmin', nameTa: 'பிராமின்', count: 545 },
  { nameEn: 'Maruthuvar', nameTa: 'மருத்துவர்', count: 530 },
  { nameEn: 'Nayakkar', nameTa: 'நாயக்கர்', count: 405 },
  { nameEn: 'Muslim', nameTa: 'முஸ்லிம்', count: 284 },
  { nameEn: 'Arunthathiyar', nameTa: 'அருந்ததியர்', count: 263 },
  { nameEn: 'Vannar', nameTa: 'வண்ணார்', count: 261 },
  { nameEn: 'Boyer', nameTa: 'போயர்', count: 235 },
  { nameEn: 'Vellalar', nameTa: 'வேளாளர்', count: 213 },
  { nameEn: 'Sourashtra', nameTa: 'செளராஷ்டிரா', count: 163 },
  { nameEn: 'Valluvar', nameTa: 'வள்ளுவர்', count: 111 },
  { nameEn: 'Nair', nameTa: 'நாயர்', count: 84 },
  { nameEn: 'Meenavar', nameTa: 'மீனவர்', count: 44 },
  { nameEn: 'Kuravar', nameTa: 'குறவர்', count: 42 },
  { nameEn: 'Kshatriya Raju', nameTa: 'சத்திரிய ராஜு', count: 10 },
  { nameEn: 'Marathi', nameTa: 'மராட்டி', count: 5 }
];

get filteredCommunities(): MatrimonyCommunity[] {
  const query = this.communitySearch
    .trim()
    .toLocaleLowerCase();

  if (!query) {
    return this.communities;
  }

  return this.communities.filter(community =>
    community.nameEn.toLocaleLowerCase().includes(query) ||
    community.nameTa.toLocaleLowerCase().includes(query)
  );
}

onCommunitySearch(value: string): void {
  this.communitySearch = value;
}

selectCommunity(community: MatrimonyCommunity): void {
  this.selectedCommunity =
    this.selectedCommunity?.nameEn === community.nameEn
      ? null
      : community;
}

readonly testimonials = [
  {
    id: 1,
    image: '/assets/testimonial-1.jpg',
    nameEn: 'Sample Member 01',
    nameTa: 'மாதிரி உறுப்பினர் 01',
    quoteEn: 'Friendly and welcoming.',
    quoteTa: 'அன்பான அணுகுமுறை.',
    textEn:
      'The team made the experience comfortable with their kind and helpful approach.',
    textTa:
      'அன்பான அணுகுமுறையும் உதவிகரமான வழிகாட்டுதலும் இந்த அனுபவத்தை இனிமையாக்கின.'
  },
  {
    id: 2,
    image: '/assets/testimonial-2.jpg',
    nameEn: 'Sample Member 02',
    nameTa: 'மாதிரி உறுப்பினர் 02',
    quoteEn: 'A thoughtful experience.',
    quoteTa: 'சிறந்த அனுபவம்.',
    textEn:
      'Clear communication and personal attention made the process straightforward.',
    textTa:
      'தெளிவான தகவல் தொடர்பும் தனிப்பட்ட கவனிப்பும் பயணத்தை எளிதாக்கின.'
  },
  {
    id: 3,
    image: '/assets/testimonial-3.jpg',
    nameEn: 'Sample Member 03',
    nameTa: 'மாதிரி உறுப்பினர் 03',
    quoteEn: 'Support at every step.',
    quoteTa: 'ஒவ்வொரு நிலையிலும் ஆதரவு.',
    textEn:
      'A welcoming approach and helpful guidance throughout the journey.',
    textTa:
      'ஒவ்வொரு நிலையிலும் அன்பான அணுகுமுறையும் பயனுள்ள வழிகாட்டுதலும் கிடைத்தன.'
  },
  {
    id: 4,
    image: '/assets/testimonial-4.jpg',
    nameEn: 'Sample Member 04',
    nameTa: 'மாதிரி உறுப்பினர் 04',
    quoteEn: 'A comfortable journey.',
    quoteTa: 'மனநிறைவான பயணம்.',
    textEn:
      'An approachable team and a simple experience made exploring options easier.',
    textTa:
      'நட்பான குழுவினரும் எளிய நடைமுறைகளும் தேடலை வசதியாக்கின.'
  },
  {
    id: 5,
    image: '/assets/testimonial-5.jpg',
    nameEn: 'Sample Member 05',
    nameTa: 'மாதிரி உறுப்பினர் 05',
    quoteEn: 'Personal attention matters.',
    quoteTa: 'தனிப்பட்ட கவனிப்பு.',
    textEn:
      'The friendly support and guidance made the matrimonial search feel more reassuring.',
    textTa:
      'நட்பான ஆதரவும் வழிகாட்டுதலும் திருமணத் தேடலில் நம்பிக்கையை அளித்தன.'
  },
  {
    id: 6,
    image: '/assets/testimonial-6.jpg',
    nameEn: 'Sample Member 06',
    nameTa: 'மாதிரி உறுப்பினர் 06',
    quoteEn: 'Simple and helpful.',
    quoteTa: 'எளிமையான சேவை.',
    textEn:
      'A straightforward experience with thoughtful guidance and clear explanations.',
    textTa:
      'எளிய நடைமுறைகளும் தெளிவான விளக்கங்களும் பயனுள்ளதாக இருந்தன.'
  }
];

onTestimonialImageError(event: Event): void {
  const img = event.target as HTMLImageElement;
  const fallback = '/assets/matrimony-fallback.jpeg';

  if (!img.src.endsWith(fallback)) {
    img.src = fallback;
  }
}

}