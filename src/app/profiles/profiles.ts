import {
  Component,
  OnInit,
OnDestroy,
  inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  HostListener,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../core/services/language.service';
import { SnackbarService } from '../shared/snackbar.service';
import { ProfilesService } from '../services/profiles.service';
type TabType = 'browse' | 'liked' | 'likedMe';

interface LangText {
  en: string;
  ta: string;
}

interface ProfileItem {
  profileId: string;
  id: string;
  userId: string;
  dob?: string | null;
  name: LangText;
  age: number;
  religion: LangText;
  location: LangText;
  city: LangText;
  state: LangText;
  profession: LangText;
  education: LangText;
  maritalStatus: LangText;
  caste: LangText;
  gender: LangText;
  nakshatra: LangText;
  image: string;
  liked: boolean;
  latitude: number | null;
  longitude: number | null;
  distanceKm?: number | null;
}
@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './profiles.html',
  styleUrls: ['./profiles.scss']
})
export class Profiles implements OnInit, OnDestroy {
  app = inject(LanguageService);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  cdr = inject(ChangeDetectorRef);
snackbar = inject(SnackbarService);
profilesService = inject(ProfilesService);
  isBrowser = isPlatformBrowser(this.platformId);

  activeTab: TabType = 'browse';
  isLoading = false;
  sidebarFilter = 'all';

ageFromOptions:number[] = [];

ageToOptions:number[] = [];
  radiusOptions = [5, 10, 25, 50, 100, 200];
educationOptions: LangText[] = [];
maritalStatusOptions: LangText[] = [];
stateOptions: LangText[] = [];
cityOptions: (LangText & { state: string })[] = [];
religionOptions: LangText[] = [];
casteOptions: (LangText & { religion: string })[] = [];
genderOptions: LangText[] = [];
professionOptions: LangText[] = [];
casteMap: Record<string, string> = {};
  openDropdown: string | null = null;
  mobileFilterOpen = false;
  @ViewChild('filterBar') filterBarRef?: ElementRef<HTMLDivElement>;

  userLat: number | null = null;
  userLng: number | null = null;
  geoLocationReady = false;
  geoLocationDenied = false;

  searchTerms = {
    ageFrom: '',
    ageTo: '',
    religion: '',
    caste: '',
    gender: '',
    maritalStatus: '',
    location: '',
    education: '',
    profession: '',
    state: '',
    radius: ''
  };

currentPlan = {
  name: 'No Active Plan',

  profileViewLimit: 0,
  profileViewsUsed: 0,

  contactLimit: 0,
  contactsUsed: 0,

  daysLeft: 0,
  expired: true
};

  currentSubscriptionId = '';
  currentPlanId = '';

 profiles: ProfileItem[] = [];
likedMeProfiles: ProfileItem[] = [];
likedProfilesCount = 0;
likedProfileIdSet = new Set<string>();
  visibleProfileCount = 9;
visibleProfileTimer: any = null;
showProfileLoading = false;
private destroyed = false;
  shortlistedMeUserIds: string[] = [];
    userProfileImage = '';
userProfileName = '';
userGender = '';
userCaste = '';
userRasi = '';
userNakshatra = '';
  shortlistedByYouIds: string[] = [];

showBiodataPopup = true;
showApprovalMessage = false;
filters = {
  caste: null as string | null,
  religion: null as string | null,
  gender: null as string | null,
  maritalStatus: null as string | null,
  location: null as string | null,
  education: null as string | null,
  profession: null as string | null,
  state: null as string | null,
  ageFrom: null as number | null,
  ageTo: null as number | null,
  radius: null as number | null
};
appliedFilters = {
  caste: null as string | null,
  religion: null as string | null,
  gender: null as string | null,
  maritalStatus: null as string | null,
  location: null as string | null,
  education: null as string | null,
  profession: null as string | null,
  state: null as string | null,
  ageFrom: null as number | null,
  ageTo: null as number | null,
  radius: null as number | null
};

  translations = {
    en: {
      header: {
        miniTitle: 'Matrimony Profiles',
        title: 'Find Your Perfect Match',
        subtitle:
          'Explore genuine and verified profiles tailored for meaningful relationships.'
      },
      tabs: {
        browse: 'All Profiles',
        liked: 'Liked Profiles',
        likedMe: 'Who Liked Me'
      },
      plan: {
        expiresIn: 'Expires in',
        day: 'day',
        days: 'days',
        expiredText: 'Your plan has expired',
        viewed: 'Viewed',
        remaining: 'Remaining',
        status: 'Status',
        usageProgress: 'Usage Progress',
        profilesUsed: 'profiles used',
        upgradeNow: 'Upgrade Now',
        seePlans: 'See Plans',
        renewPlan: 'Renew Plan',
        onlyLeft: 'Only',
        profileViewsLeft: 'profile views left',
        unlockText:
          'Upgrade now to unlock more matching profiles and premium features.',
        subscriptionExpired: 'Your subscription has expired',
        renewText:
          'Renew now to continue viewing profiles and sending interests.',
        active: 'Active',
        lowBalance: 'Low Balance',
        limitReached: 'Limit Reached',
        expired: 'Expired'
      },
      filters: {
        caste: 'Caste',
        religion: 'Religion',
        gender: 'Gender',
        maritalStatus: 'Marital Status',
        location: 'City',
        state: 'State',
        education: 'Education',
        ageFrom: 'Age From',
        ageTo: 'Age To',
        radius: 'Radius (km)',
        nearbyOnly: 'Nearby',
        search: 'Apply Filters',
        reset: 'Reset'
      },
      profile: {
        age: 'Age',
        religion: 'Religion',
        location: 'Location',
        profession: 'Profession',
        education: 'Education',
        maritalStatus: 'Marital Status',
        caste: 'Caste',
        gender: 'Gender',
        distance: 'Distance',
        viewProfile: 'View Profile',
        like: 'Like',
        liked: 'Liked',
        removeLike: 'Remove Like',
        likeBack: 'Like Back',
        likedBadge: 'Liked',
        likedMeBadge: 'Liked You'
      },
      empty: {
        likedTitle: 'No liked profiles yet',
        likedText: 'You can like a profile and see it listed here.',
        likedMeTitle: 'No likes received yet',
        likedMeText: 'Profiles that like you will appear here.',
        browseTitle: 'No matching profiles found',
        browseText: 'Try changing your filters to see more profiles.'
      },
      alerts: {
        planExpired: 'Your plan has expired. Please upgrade.',
        limitReached: 'Profile limit reached. Upgrade your plan.',
        interestSent: 'Interest sent to',
        expiredOnly: 'Your plan has expired.',
        loginRequired: 'Please login or register to view full profile.',
        geoDenied:
          'Location permission denied. Radius filter will use city filter only.',
        geoUnavailable:
          'Unable to get your current location. Radius filter will use city filter only.',
        invalidProfileCode: 'This profile does not have a valid profile code yet.',
        approvalPendingTitle:
'Your profile is under verification',

approvalPendingText:
'Your biodata has been submitted successfully. Admin approval is required before viewing matching profiles.For more details contact 99433 15331'
      },
sidebar: {
  allMatches: 'All Matches',

  yourMatches: 'Your Matches',
  yourMatchesText: 'View all the profiles that match your preferences',

  basedOnActivity: 'Based on activity',

  shortlistedByYou: 'Shortlisted by you',
  shortlistedByYouText: 'Matches you have shortlisted',

  whoShortlistedYou: 'Who shortlisted you',
  whoShortlistedYouText: 'Members who shortlisted your profile',

  viewedByYou: 'Viewed by you',
  viewedByYouText: 'Matches you have viewed',

  recentlyJoined: 'Recently joined & nearby matches',

  newlyJoined: 'Newly Joined',
  newlyJoinedText: 'Matches who joined within the last 30 days',

  nearbyMatches: 'Nearby matches',
  nearbyMatchesText: 'Matches near your location',

  profileDetails: 'Based on profile details',

  withPhotos: 'Matches with photos',
  withPhotosText: 'Matches that have added photos',

  withHoroscope: 'Matches with horoscope',
  withHoroscopeText: 'Matches that have added horoscope',

  similarHobbies: 'Matches with similar hobbies',
  similarHobbiesText: 'Matches who have hobbies similar to you'

  ,

astroCompatibility: 'Based on astrological compatibility',

starMatches: 'Star matches',
starMatchesText: 'Matches with compatible star sign',

horoscopeMatches: 'Horoscope matches',
horoscopeMatchesText: 'Matches with horoscope matching yours',

lookingForSomeone: 'Members who are looking for someone like you',

mutualMatches: 'Mutual matches',
mutualMatchesText:
  'Matches whose profile match your preferences and vice versa',

lookingForYou: 'Looking for you',
lookingForYouText:
  'Matches whose preferences match your profile',

preferenceMatches: 'Matches based on preferences',

cityPreference: 'City/location preference',
cityPreferenceText:
  'Matches based on your preferred city/location',

nriMatches: 'NRI matches',
nriMatchesText:
  'Matches from outside India',

otherMatches: 'Other matches',

assistedMatches: 'Assisted matches',
assistedMatchesText:
  'Matches whose profiles are handled by a relationship manager'
}
    },
    ta: {
      header: {
        miniTitle: 'திருமண சுயவிவரங்கள்',
        title: 'உங்கள் சரியான வாழ்க்கைத் துணையை கண்டுபிடிக்கவும்',
        subtitle:
          'நம்பகமான மற்றும் சரிபார்க்கப்பட்ட சுயவிவரங்களைப் பார்த்து அர்த்தமுள்ள உறவை உருவாக்குங்கள்.'
      },
      tabs: {
        browse: 'அனைத்து சுயவிவரங்கள்',
        liked: 'பிடித்த சுயவிவரங்கள்',
        likedMe: 'என்னை விரும்பியவர்கள்'
      },
      plan: {
        expiresIn: 'காலாவதி ஆக இன்னும்',
        day: 'நாள்',
        days: 'நாட்கள்',
        expiredText: 'உங்கள் திட்டம் காலாவதியாகிவிட்டது',
        viewed: 'பார்த்தவை',
        remaining: 'மீதமுள்ளவை',
        status: 'நிலை',
        usageProgress: 'பயன்பாட்டு முன்னேற்றம்',
        profilesUsed: 'சுயவிவரங்கள் பயன்படுத்தப்பட்டது',
        upgradeNow: 'இப்போதே மேம்படுத்தவும்',
        seePlans: 'திட்டங்களை பார்க்கவும்',
        renewPlan: 'திட்டத்தை புதுப்பிக்கவும்',
        onlyLeft: 'மட்டும்',
        profileViewsLeft: 'சுயவிவர பார்வைகள் மீதமுள்ளது',
        unlockText:
          'மேலும் பொருத்தமான சுயவிவரங்கள் மற்றும் பிரீமியம் அம்சங்களை பெற இப்போதே மேம்படுத்தவும்.',
        subscriptionExpired: 'உங்கள் சந்தா காலாவதியாகிவிட்டது',
        renewText:
          'சுயவிவரங்களை பார்க்கவும் ஆர்வம் அனுப்பவும் திட்டத்தை புதுப்பிக்கவும்.',
        active: 'செயலில் உள்ளது',
        lowBalance: 'குறைந்த இருப்பு',
        limitReached: 'வரம்பு முடிந்தது',
        expired: 'காலாவதியானது'
      },
      filters: {
        caste: 'ஜாதி',
        religion: 'மதம்',
        gender: 'பாலினம்',
        maritalStatus: 'திருமண நிலை',
        location: 'நகரம்',
        state: 'மாநிலம்',
        education: 'கல்வி',
        ageFrom: 'வயது முதல்',
        ageTo: 'வயது வரை',
        radius: 'அருகிலுள்ள தூரம் (கி.மீ)',
        nearbyOnly: 'அருகில்',
        search: 'வடிகட்டு',
        reset: 'மீட்டமை'
      },
      profile: {
        age: 'வயது',
        religion: 'மதம்',
        location: 'இடம்',
        profession: 'தொழில்',
        education: 'கல்வி',
        maritalStatus: 'திருமண நிலை',
        caste: 'ஜாதி',
        gender: 'பாலினம்',
        distance: 'தூரம்',
        viewProfile: 'சுயவிவரம் பார்க்க',
        like: 'பிடிக்கும்',
        liked: 'பிடித்தது',
        removeLike: 'பிடித்ததை நீக்கு',
        likeBack: 'மீண்டும் விருப்பம் தெரிவி',
        sendInterest: 'ஆர்வம் அனுப்பு',
        likedBadge: 'பிடித்தது',
        likedMeBadge: 'உங்களை விரும்பினார்'
      },
      empty: {
        likedTitle: 'இன்னும் பிடித்த சுயவிவரங்கள் இல்லை',
        likedText: 'ஒரு சுயவிவரத்தை விரும்பினால் அது இங்கே தோன்றும்.',
        likedMeTitle: 'இன்னும் யாரும் விருப்பம் தெரிவிக்கவில்லை',
        likedMeText: 'உங்களை விரும்பிய சுயவிவரங்கள் இங்கே தோன்றும்.',
        browseTitle: 'பொருந்தும் சுயவிவரங்கள் இல்லை',
        browseText: 'மேலும் சுயவிவரங்களை பார்க்க வடிகட்டலை மாற்றவும்.'
      },
      alerts: {
        planExpired: 'உங்கள் திட்டம் காலாவதியாகிவிட்டது. தயவுசெய்து மேம்படுத்தவும்.',
        limitReached: 'சுயவிவர பார்வை வரம்பு முடிந்துவிட்டது. திட்டத்தை மேம்படுத்தவும்.',
        interestSent: 'ஆர்வம் அனுப்பப்பட்டது',
        expiredOnly: 'உங்கள் திட்டம் காலாவதியாகிவிட்டது.',
        loginRequired: 'முழு சுயவிவரத்தை பார்க்க தயவுசெய்து உள்நுழையவும் அல்லது பதிவு செய்யவும்.',
        geoDenied:
          'உங்கள் இருப்பிட அனுமதி மறுக்கப்பட்டது. Radius filter நகர அடிப்படையில் மட்டும் செயல்படும்.',
        geoUnavailable:
          'உங்கள் தற்போதைய இருப்பிடத்தை பெற முடியவில்லை. Radius filter நகர அடிப்படையில் மட்டும் செயல்படும்.',
        invalidProfileCode: 'இந்த profile-க்கு சரியான profile code இன்னும் இல்லை.',
        approvalPendingTitle:
'உங்கள் சுயவிவரம் சரிபார்ப்பில் உள்ளது',

approvalPendingText:
'உங்கள் விவரங்கள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டுள்ளது. நிர்வாகி அனுமதி கிடைத்த பிறகு பொருத்தமான சுயவிவரங்களை பார்க்கலாம்.மேலும் விவரங்களுக்கு தொடர்பு கொள்ளவும்: 99433 15331'
      },
      sidebar: {
  allMatches: 'அனைத்து பொருத்தங்கள்',
  yourMatches: 'உங்கள் பொருத்தங்கள்',
  yourMatchesText: 'உங்கள் விருப்பங்களுக்கு பொருந்தும் அனைத்து சுயவிவரங்களையும் பார்க்கவும்',

  basedOnActivity: 'செயல்பாடுகளின் அடிப்படையில்',
  shortlistedByYou: 'நீங்கள் பிடித்தவர்கள்',
  shortlistedByYouText: 'நீங்கள் பிடித்த சுயவிவரங்கள்',
  whoShortlistedYou: 'உங்களை பிடித்தவர்கள்',
  whoShortlistedYouText: 'உங்கள் சுயவிவரத்தை பிடித்த உறுப்பினர்கள்',
  viewedByYou: 'நீங்கள் பார்த்தவர்கள்',
  viewedByYouText: 'நீங்கள் பார்த்த பொருத்தங்கள்',

  recentlyJoined: 'சமீபத்தில் சேர்ந்தவர்கள் மற்றும் அருகிலுள்ள பொருத்தங்கள்',
  newlyJoined: 'புதிய உறுப்பினர்கள்',
  newlyJoinedText: 'கடந்த 30 நாட்களில் சேர்ந்தவர்கள்',
  nearbyMatches: 'அருகிலுள்ள பொருத்தங்கள்',
  nearbyMatchesText: 'உங்கள் இடத்திற்கு அருகிலுள்ள பொருத்தங்கள்',

  profileDetails: 'சுயவிவர விவரங்களின் அடிப்படையில்',
  withPhotos: 'புகைப்படம் உள்ளவர்கள்',
  withPhotosText: 'புகைப்படம் சேர்த்துள்ள பொருத்தங்கள்',
  withHoroscope: 'ஜாதகம் உள்ளவர்கள்',
  withHoroscopeText: 'ஜாதகம் சேர்த்துள்ள பொருத்தங்கள்',
  similarHobbies: 'ஒத்த பொழுதுபோக்கு உள்ளவர்கள்',
  similarHobbiesText: 'உங்களுடன் ஒத்த பொழுதுபோக்குகள் உள்ளவர்கள்',
  

astroCompatibility: 'ஜோதிட பொருத்தத்தின் அடிப்படையில்',

starMatches: 'நட்சத்திர பொருத்தங்கள்',
starMatchesText:
  'உங்கள் நட்சத்திரத்துடன் பொருந்தும் பொருத்தங்கள்',

horoscopeMatches: 'ஜாதக பொருத்தங்கள்',
horoscopeMatchesText:
  'உங்கள் ஜாதகத்துடன் பொருந்தும் பொருத்தங்கள்',

lookingForSomeone:
  'உங்களைப் போன்றவரை தேடுகிற உறுப்பினர்கள்',

mutualMatches: 'இருவருக்கும் பொருத்தமானவர்கள்',
mutualMatchesText:
  'உங்கள் விருப்பங்களும் அவர்களின் விருப்பங்களும் பொருந்தும் உறுப்பினர்கள்',

lookingForYou: 'உங்களை தேடுபவர்கள்',
lookingForYouText:
  'உங்கள் சுயவிவரத்துடன் பொருந்தும் விருப்பங்கள் கொண்டவர்கள்',

preferenceMatches:
  'விருப்பங்களின் அடிப்படையிலான பொருத்தங்கள்',

cityPreference: 'நகரம் / இட விருப்பம்',
cityPreferenceText:
  'நீங்கள் தேர்ந்தெடுத்த நகரம் / இடத்தின் அடிப்படையிலான பொருத்தங்கள்',

nriMatches: 'வெளிநாட்டு பொருத்தங்கள்',
nriMatchesText:
  'இந்தியாவிற்கு வெளியே உள்ள பொருத்தங்கள்',

otherMatches: 'மற்ற பொருத்தங்கள்',

assistedMatches: 'உதவி செய்யப்பட்ட பொருத்தங்கள்',
assistedMatchesText:
  'உறவு மேலாளரால் நிர்வகிக்கப்படும் சுயவிவரங்கள்'
}
    }
  };

  async ngOnInit(): Promise<void> {
    // Keep Likes / Liked Me accessible on the legacy activity page.
    const requestedTab = this.router.parseUrl(this.router.url).queryParams['tab'];
    this.activeTab = requestedTab === 'liked' || requestedTab === 'likedMe' ? requestedTab : 'browse';
    await this.loadAgeOptions();
    await this.loadGenderOptions();
    await this.loadReligionOptions();
    this.sidebarFilter = 'all';
    this.resetFilters();

    this.isLoading = true;
    this.cdr.detectChanges();


if (this.isBrowser) {
  await this.loadCurrentPlan();
  await this.loadLoggedInUserProfile();
  await this.refreshUserProfileLanguage();
}

await Promise.all([
  this.loadEducationOptions(),
  this.loadFilterTables()
]);

if (this.isBrowser) {

  if (!this.isLoggedIn) {

    // Guest free search
    await this.loadProfilesFromApi();

  } 
  else {

    const canViewProfiles =
      await this.checkUserApprovalStatus();


    if (canViewProfiles) {

      await this.loadProfilesFromApi();

    }

  }

}
if(this.isLoggedIn){

  await this.loadLikedProfiles();

  await this.loadLikedMeProfiles();

await this.loadShortlistedByYou();

await this.loadShortlistedMe();

}


    this.cdr.detectChanges();

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

get currentLang(): 'en' | 'ta' {
  return this.app.currentLang;
}

  get tr() {
    return this.translations[this.currentLang];
  }

asLangText(value: string | null | undefined): LangText {
    const text = value?.trim() || '';
  return {
    en: text,
    ta: text
  };
}

private asLangTextTa(
  enValue: string | null | undefined,
  taValue: string | null | undefined
): LangText {
  const en = enValue?.trim() || '';
  const ta = taValue?.trim() || en;

  return { en, ta };
}

private hasTamilText(value: string | null | undefined): boolean {
  return /[\u0B80-\u0BFF]/.test(String(value || ''));
}

private async translateText(
  text: string | null | undefined,
  target: 'en' | 'ta'
): Promise<string> {

  const value = String(text || '').trim();

  if (!value) return '';


  try {

    const response:any =
      await this.profilesService
      .translateText(value,target)
      .toPromise();


    return response?.translatedText || value;


  }
  catch(error){

    console.error(
      "Translation error",
      error
    );

    return value;

  }

}

private async makeLangText(
  enValue: string | null | undefined,
  taValue: string | null | undefined
): Promise<LangText> {
  let en = String(enValue || '').trim();
  let ta = String(taValue || '').trim();

  if (this.hasTamilText(en)) {
    en = await this.translateText(en, 'en');
  }

  if (!ta && en) {
    ta = await this.translateText(en, 'ta');
  }

  return { en, ta: ta || en };
}

  private normalizeText(value: string | null | undefined): string {
    return String(value || '').toLowerCase().trim();
  }

  private normalizeGender(value: string | null | undefined): 'male' | 'female' | '' {
  const gender = String(value || '').toLowerCase().trim();

  if (gender === 'male' || gender === 'ஆண்') return 'male';
  if (gender === 'female' || gender === 'பெண்') return 'female';

  return '';
}

private isOppositeGender(profileGenderValue: string | null | undefined): boolean {
  const myGender = this.normalizeGender(this.userGender);
  const profileGender = this.normalizeGender(profileGenderValue);

  // If login user has no gender, show ALL profiles
  if (!myGender) return true;

  // If profile gender is missing, don't hide it
  if (!profileGender) return true;

  // Male -> Female only
  // Female -> Male only
  return myGender !== profileGender;
}

  private toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }
private hasRealProfileCode(id: string): boolean {
  return /^(AMI|AAM)-/i.test(String(id || '').trim());
}

private getLoggedInUserId(): string | null {
  if (!this.isBrowser) return null;

  try {
    const rawUser =
      localStorage.getItem('matrimony_user') ||
      localStorage.getItem('user') ||
      localStorage.getItem('loggedInUser');

    if (rawUser) {
      const parsed = JSON.parse(rawUser);

      return (
        parsed?.user_id ||
        parsed?._id ||
        parsed?.id ||
        parsed?.userId ||
        null
      );
    }
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
  }

  return localStorage.getItem('app_user_id');
}

  private getUserStorageKey(key: string): string {
    const userId = this.getLoggedInUserId();
    return userId ? `${key}_${userId}` : key;
  }

  private getDaysLeft(endDate: string | null | undefined): number {
    if (!endDate) return 0;

    const today = new Date();
    const end = new Date(endDate);

    if (isNaN(end.getTime())) return 0;

    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffMs = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(diffDays, 0);
  }

  get isLoggedIn(): boolean {
    return !!this.getLoggedInUserId();
  }

  tryGetUserLocation(): void {
  if (!this.isBrowser || !('geolocation' in navigator)) {
  return;
}

  navigator.geolocation.getCurrentPosition(
  (position) => {
    this.userLat = position.coords.latitude;
    this.userLng = position.coords.longitude;
    this.geoLocationReady = true;
    this.geoLocationDenied = false;

    // ✅ ADD THIS PART ONLY
    this.profiles = this.profiles.map(profile => ({
      ...profile,
      distanceKm: this.getDistanceForProfile(profile)
    }));

    this.applyFilters?.();

    this.cdr.detectChanges();
  },
      (error) => {
        console.warn('Geolocation error:', error);
     // do nothing
        this.cdr.detectChanges();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }

  calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  getDistanceForProfile(profile: ProfileItem): number | null {
    if (
      this.userLat === null ||
      this.userLng === null ||
      profile.latitude === null ||
      profile.longitude === null
    ) {
      return null;
    }

    return this.calculateDistanceKm(
      this.userLat,
      this.userLng,
      profile.latitude,
      profile.longitude
    );
  }

  private getCityCenterByName(cityName: string | null | undefined): { lat: number; lng: number } | null {
    const normalizedCity = this.normalizeText(cityName);
    if (!normalizedCity) return null;

    const matchingProfiles = this.profiles.filter((profile) => {
      const profileCity = this.normalizeText(this.getText(profile.city));
      return (
        profileCity === normalizedCity &&
        profile.latitude !== null &&
        profile.longitude !== null
      );
    });

    if (matchingProfiles.length === 0) return null;

    const total = matchingProfiles.reduce(
      (acc, profile) => {
        acc.lat += profile.latitude ?? 0;
        acc.lng += profile.longitude ?? 0;
        return acc;
      },
      { lat: 0, lng: 0 }
    );

    return {
      lat: total.lat / matchingProfiles.length,
      lng: total.lng / matchingProfiles.length
    };
  }

  private getDistanceFromSelectedCity(profile: ProfileItem): number | null {
    const selectedCityCenter = this.getCityCenterByName(this.appliedFilters.location);

    if (
      !selectedCityCenter ||
      profile.latitude === null ||
      profile.longitude === null
    ) {
      return null;
    }

    return this.calculateDistanceKm(
      selectedCityCenter.lat,
      selectedCityCenter.lng,
      profile.latitude,
      profile.longitude
    );
  }

  formatDistance(distance: number | null | undefined): string {
    if (distance === null || distance === undefined || !Number.isFinite(distance)) {
      return '-';
    }
    return `${distance.toFixed(1)} km`;
  }

async loadCurrentPlan(): Promise<void> {
  const userId = this.getLoggedInUserId();

  if (!userId) {
    this.currentPlan = {
      name: 'No Active Plan',
      profileViewLimit: 0,
      profileViewsUsed: 0,
      contactLimit: 0,
      contactsUsed: 0,
      daysLeft: 0,
      expired: true
    };
    return;
  }

  try {
    const response: any = await this.profilesService
      .getUserSubscription(userId)
      .toPromise();

const activeSubscription = response?.data || null;

    if (!activeSubscription) {
      this.currentPlan = {
        name: 'No Active Plan',
        profileViewLimit: 0,
        profileViewsUsed: 0,
        contactLimit: 0,
        contactsUsed: 0,
        daysLeft: 0,
        expired: true
      };
      return;
    }

    const daysLeft = this.getDaysLeft(activeSubscription.end_date);

    this.currentSubscriptionId = activeSubscription.subscription_id || '';
    this.currentPlanId = activeSubscription.plan_id || '';

    this.currentPlan = {
      name: activeSubscription.plan_name || activeSubscription.plan_id || 'Active Plan',
      profileViewLimit: Number(activeSubscription.profile_view_limit || 0),
      profileViewsUsed: Number(activeSubscription.profile_views_used || 0),
      contactLimit: Number(activeSubscription.total_contacts_allowed || 0),
      contactsUsed: Number(activeSubscription.contacts_used || 0),
      daysLeft,
      expired: !activeSubscription.is_active || daysLeft <= 0
    };

    this.cdr.detectChanges();
  } catch (error) {
    console.error('Load current plan error:', error);
  }
}
  async loadProfilesFromApi(): Promise<void> {
    this.isLoading = true;
    this.cdr.detectChanges();

    try {
const response: any = await this.profilesService.getProfiles().toPromise();
if (this.destroyed) return;
const rows = Array.isArray(response)
  ? response
  : Array.isArray(response?.data)
    ? response.data
    : [];

    const filteredRows = rows
  .filter((row: any) => {

    const loggedInUserId = String(this.getLoggedInUserId() || '').trim();
    const rowUserId = String(row.user_id || '').trim();

    const loggedInName = String(this.userProfileName || '').toLowerCase().trim();
    const rowName = String(row.full_name || '').toLowerCase().trim();

// Apply these only AFTER LOGIN
if (this.isLoggedIn) {

  // Don't show own profile
  if (
    (loggedInUserId && rowUserId === loggedInUserId) ||
    (loggedInName && rowName === loggedInName)
  ) {
    return false;
  }

  // Show only opposite gender
  if (!this.isOppositeGender(row.gender_text)) {
    return false;
  }

}
    // =========================

    if (!row) return false;

    const status = String(row.profile_status || '').toLowerCase().trim();
    if (status === 'draft') return false;

    const usableId = row.profile_id || '';
    return !!usableId;
  });
//         .map((row: any) => {
//           const usableId = row.profile_code || row.user_id || row.profile_id || '';

//           const cityValue =
//             String(row.city_text || '').trim() ||
//             String(row.location_text || '').split(',')[0]?.trim() ||
//             '';

//           const fullLocation =
//             String(row.location_text || '').trim() ||
//             [row.city_text, row.state_text, row.country_text]
//               .filter(Boolean)
//               .map((item: any) => String(item).trim())
//               .filter(Boolean)
//               .join(', ');

//           return {
//             id: String(usableId).trim(),
//             userId: String(row.user_id || '').trim(),
//           name: this.asLangTextTa(
//   row.full_name,
//   row.full_name_ta
// ),


//             age: Number(row.age || 0),
//            religion: this.asLangTextTa(
//   row.religion_text,
//   this.getTamilProfileValue('religion', row.religion_text)
// ),

// profession: this.asLangTextTa(
//   row.occupation_text,
//   row.occupation_text_ta ||
//   this.getTamilProfileValue('profession', row.occupation_text)
// ),

// education: this.asLangTextTa(
//   row.education_text,
//   row.education_text_ta ||
//   this.getTamilProfileValue('education', row.education_text)
// ),

// maritalStatus: this.asLangTextTa(
//   row.marital_status_text,
//   this.getTamilProfileValue('maritalStatus', row.marital_status_text)
// ),

// caste: this.asLangTextTa(
//   row.caste_text,
//   this.casteMap[
//     String(row.caste_text || '').trim().toLowerCase()
//   ] || row.caste_text
// ),
// gender: this.asLangTextTa(
//   row.gender_text,
//   this.getTamilProfileValue('gender', row.gender_text)
// ),

//             image: row.profile_image_url || 'assets/default-avatar.png',
//             liked: false,
//             latitude: this.toNullableNumber(row.latitude),
//             longitude: this.toNullableNumber(row.longitude),
//             distanceKm: null
//           } as ProfileItem;
//         });
this.profiles = await Promise.all(
  filteredRows.map(async (row: any) => {
  const usableId = row.profile_code || row.user_id || row.profile_id || '';



return {
  id: String(row.profile_code || '').trim(),
  profileId: String(row.profile_id || '').trim(),
  userId: String(row.user_id || '').trim(),
  dob: row.dob || null,
      name: await this.makeLangText(row.full_name, row.full_name_ta),
      age: Number(row.age || 0),
religion: await this.makeLangText(
  row.religion_text || '-',
  this.getTamilProfileValue('religion', row.religion_text)
),

maritalStatus: await this.makeLangText(
  row.marital_status_text || '-',
  this.getTamilProfileValue('maritalStatus', row.marital_status_text)
),

caste: await this.makeLangText(
  row.caste_text || '-',
  this.casteMap[String(row.caste_text || '').trim().toLowerCase()] || row.caste_text
),

gender: await this.makeLangText(
  row.gender_text || '-',
  this.getTamilProfileValue('gender', row.gender_text)
),
nakshatra: await this.makeLangText(
  row.nakshatra_text,
  row.nakshatra_text_ta || row.nakshatra_text
),
location: await this.makeLangText(
  row.city_text || row.location_text,
  this.getTamilFromOptions(this.cityOptions, row.city_text || row.location_text)
),

city: await this.makeLangText(
  row.city_text,
  this.getTamilFromOptions(this.cityOptions, row.city_text)
),

state: await this.makeLangText(
  row.state_text,
  this.getTamilFromOptions(this.stateOptions, row.state_text)
),

education: await this.makeLangText(
  row.education_text || '-',
  row.education_text_ta || this.getTamilProfileValue('education', row.education_text)
),

profession: await this.makeLangText(
  row.occupation_text || '-',
  row.occupation_text_ta || this.getTamilProfileValue('profession', row.occupation_text)
),

image: row.profile_image_url || 'assets/default-avatar.png',
      liked: false,
      latitude: this.toNullableNumber(row.latitude),
      longitude: this.toNullableNumber(row.longitude),
      distanceKm: null
    } as ProfileItem;
  })
);

      this.likedMeProfiles = [];

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Load profiles error:', error);
      this.profiles = [];
      this.cdr.detectChanges();
    } finally {
  this.isLoading = false;

  setTimeout(() => {
    this.startProfileBatchLoading();
    this.cdr.detectChanges();
  }, 0);
}
  }
private getTamilProfileValue(
  type: string,
  value: string | null | undefined
): string {

  const text = String(value || '').trim();

  const map: any = {

    gender: {
      Male: 'ஆண்',
      Female: 'பெண்'
    },

  maritalStatus: {
  'First Marriage': 'முதல் திருமணம்',
  'Second Marriage': 'மறுமணம்',
  Unmarried: 'திருமணம் ஆகாதவர்',
  Divorced: 'மறுமணம்',
  Widowed: 'துணையை இழந்தவர்'
},
    religion: {
      Hindu: 'இந்து',
      Christian: 'கிறிஸ்துவர்',
      Muslim: 'முஸ்லிம்'
    },

   education: {
  BCom: 'பி.காம்',
  BTech: 'பி.டெக்',
  BE: 'பி.இ',
  MBA: 'எம்.பி.ஏ'
},

profession: {
  developer: 'டெவலப்பர்',
  look: 'லுக்',
  'software engineer': 'மென்பொருள் பொறியாளர்',
  teacher: 'ஆசிரியர்',
  doctor: 'மருத்துவர்'
},



  };

  return map[type]?.[text] || text;
}

private getTamilFromOptions(
  options: LangText[],
  value: string | null | undefined
): string {
  const text = String(value || '').toLowerCase().trim();

  const found = options.find(item =>
    String(item.en || '').toLowerCase().trim() === text ||
    String(item.ta || '').toLowerCase().trim() === text
  );

  return found?.ta || String(value || '').trim();
}

async loadShortlistedMe(){

const userId=this.getLoggedInUserId();

if(!userId) return;


try{

const res:any =
await this.profilesService
.getShortlistedByUser(userId)
.toPromise();


this.shortlistedMeUserIds =
(res.received || [])
.map((x:any)=>
String(x.profile_code)
);


this.cdr.detectChanges();


}
catch(error){

console.error(
"Shortlist received error",
error
);

}

}

async loadShortlistedByYou(){

const userId = this.getLoggedInUserId();

if(!userId) return;


try{

const res:any =
await this.profilesService
.getShortlistedByUser(userId)
.toPromise();


this.shortlistedByYouIds =
(res.sent || [])
.map((x:any)=>
String(x.profile_code)
);


this.cdr.detectChanges();


}
catch(error){

console.error(
"Shortlist load error",
error
);

}


}
async loadLikedProfiles(): Promise<void> {

  const userId = this.getLoggedInUserId();

  if (!userId) {
    this.likedProfilesCount = 0;
    this.likedProfileIdSet.clear();
    return;
  }

  try {

    const data: any = await this.profilesService
      .getLikedByMe(userId)
      .toPromise();

    const likedIds = (data || [])
      .map((x: any) => String(x.toUser?._id || x.toUser))
      .filter(Boolean);

    this.likedProfileIdSet = new Set(likedIds);

    this.profiles = this.profiles.map(profile => ({
      ...profile,
      liked: this.likedProfileIdSet.has(profile.userId)
    }));

    this.likedProfilesCount = this.profiles.filter(x => x.liked).length;

    this.cdr.detectChanges();

  } catch (err) {
    console.error(err);
  }

}
async loadLikedMeProfiles(): Promise<void> {

  const userId = this.getLoggedInUserId();

  if (!userId) {
    this.likedMeProfiles = [];
    return;
  }

  try {

    const data: any = await this.profilesService
      .getWhoLikedMe(userId)
      .toPromise();

    const ids = (data || [])
      .map((x: any) => String(x.fromUser?._id || x.fromUser))
      .filter(Boolean);

    this.likedMeProfiles = this.profiles.filter(profile =>
      ids.includes(profile.userId)
    );

    this.cdr.detectChanges();

  } catch (err) {
    console.error(err);
  }

}
startProfileBatchLoading(): void {
  if (!this.isBrowser) return;

  if (this.visibleProfileTimer) {
    clearTimeout(this.visibleProfileTimer);
    this.visibleProfileTimer = null;
  }

  this.visibleProfileCount = 9;
  this.cdr.detectChanges();
}
loadMoreProfilesAfterScroll(): void {
  if (!this.isBrowser) return;
  if (this.visibleProfileTimer) return;
  if (this.visibleProfileCount >= this.filteredProfiles.length) return;

  this.showProfileLoading = true;
  this.cdr.detectChanges();

  this.visibleProfileTimer = setTimeout(() => {
    this.visibleProfileCount += 9;
    this.showProfileLoading = false;
    this.visibleProfileTimer = null;

    this.cdr.detectChanges();
    this.cdr.markForCheck();
  }, 1500);
}
@HostListener('window:scroll', [])
onWindowScroll(): void {

  if (!this.isBrowser) return;

  if (this.activeTab !== 'browse') return;

  if (this.isLoading) return;

  const scrollPosition = window.innerHeight + window.scrollY;

  const pageHeight = document.documentElement.scrollHeight;

  if (scrollPosition >= pageHeight - 300) {

    this.loadMoreProfilesAfterScroll();

    this.cdr.detectChanges();

  }

}

  applySidebarFilter(type: string): void {
    const protectedFilters = [
  'liked',
  'shortlistedMe',
  'viewedByYou',
  'mutual',
  'lookingForYou'
];

if (!this.isLoggedIn && protectedFilters.includes(type)) {
  this.snackbar.error('Please login or register');
  this.router.navigate(['/login']);
  return;
}
    this.sidebarFilter = type;

    if (type === 'all') {
      this.resetFilters();
      this.sidebarFilter = 'all';
      return;
    }

    if (type === 'nearby') {
      this.appliedFilters.radius = this.appliedFilters.radius || 50;
    }

    this.cdr.detectChanges();
  }

 
  get planExpired(): boolean {
    return this.currentPlan.expired;
  }
get hasNoPlan(): boolean {
  return (
    this.currentPlan.name === 'No Active Plan' ||
    this.profileLimit <= 0
  );
}
  get daysLeft(): number {
    return this.currentPlan.daysLeft;
  }

get profileLimit(): number {
  return this.currentPlan.profileViewLimit;
}

get viewedProfiles(): number {
  return this.currentPlan.profileViewsUsed;
}

get remainingProfiles(): number {
  return Math.max(this.profileLimit - this.viewedProfiles, 0);
}

get contactLimit(): number {
  return this.currentPlan.contactLimit;
}

get contactsUsed(): number {
  return this.currentPlan.contactsUsed;
}

get remainingContacts(): number {
  return Math.max(this.contactLimit - this.contactsUsed, 0);
}
  get usagePercent(): number {
    if (this.profileLimit <= 0) return 0;
    return Math.min((this.viewedProfiles / this.profileLimit) * 100, 100);
  }

  get isLowBalance(): boolean {
    return this.remainingProfiles > 0 && this.remainingProfiles <= 5;
  }

get planStatus(): string {

  const tr = this.tr.plan;

  if (this.hasNoPlan) {
    return 'No Plan';
  }

  if (this.planExpired) {
    return tr.expired;
  }

  if (this.remainingProfiles <= 0 && this.profileLimit > 0) {
    return tr.limitReached;
  }

  if (this.isLowBalance) {
    return tr.lowBalance;
  }

  return tr.active;
}
  getPlanClass(): string {
    const name = (this.currentPlan?.name || '').toLowerCase().trim();

    if (name === 'astro alliance') return 'plan-basic';
    if (name === 'tm classic') return 'plan-classic';
    if (name === 'tm premium') return 'plan-premium';
    if (name === 'tm elite') return 'plan-elite';

    return 'plan-default';
  }

  get likedProfiles(): ProfileItem[] {
    return this.profiles.filter(profile => profile.liked);
  }

  private isRasiNakshatraMatch(profile: ProfileItem): boolean {
  const myRasi = this.normalizeText(this.userRasi);
  const myStar = this.normalizeText(this.userNakshatra);

  const profileStar = this.normalizeText(this.getText(profile.nakshatra));

  if (!myRasi || !myStar || !profileStar) return false;

  if (myRasi.includes('rishab') && myStar.includes('rohini')) {
    return [
      'mirugasirisham',
      'thiruvathirai',
      'punarpoosam',
      'poosam',
      'ayilyam',
      'magham',
      'uthiram',
      'hastham',
      'chithirai',
      'swathi',
      'anusham',
      'uthiradam',
      'thiruvonam',
      'avittam',
      'sathayam',
      'uthiratadhi',
      'revathi'
    ].some(star => profileStar.includes(star));
  }

  return false;
}

  get filteredProfiles(): ProfileItem[] {
    const radius = this.appliedFilters.radius;
const userLat = this.userLat;
const userLng = this.userLng;
if (this.sidebarFilter === 'shortlistedMe') {
  return this.profiles.filter(profile =>
    this.shortlistedMeUserIds.includes(profile.userId)
  );
}
if (this.sidebarFilter === 'shortlistedByYou') {
  return this.profiles.filter(profile =>
    this.shortlistedByYouIds.includes(profile.id)
  );
}
if (this.sidebarFilter === 'liked') {
  return this.profiles.filter(profile => profile.liked === true);
}
    const result = this.profiles.filter((profile) => {
const religion = this.normalizeText(profile.religion.en);
const city = this.normalizeText(profile.city.en);
const state = this.normalizeText(profile.state.en);
const education = this.normalizeText(profile.education.en);
const profession = this.normalizeText(profile.profession.en);
const maritalStatus = this.normalizeText(profile.maritalStatus.en);
const caste = this.normalizeText(profile.caste.en);
const gender = this.normalizeText(profile.gender.en);
      const matchesOppositeGender =
  !this.isLoggedIn || this.isOppositeGender(this.getText(profile.gender));
      const casteFilter = this.normalizeText(this.appliedFilters.caste);
      const religionFilter = this.normalizeText(this.appliedFilters.religion);
      const genderFilter = this.normalizeText(this.appliedFilters.gender);
      const maritalStatusFilter = this.normalizeText(this.appliedFilters.maritalStatus);
      const locationFilter = this.normalizeText(this.appliedFilters.location);
      const stateFilter = this.normalizeText(this.appliedFilters.state);
      const educationFilter = this.normalizeText(this.appliedFilters.education);
      const professionFilter = this.normalizeText(this.appliedFilters.profession);
      const radiusFilter = this.appliedFilters.radius;

      const matchesCaste = !casteFilter || caste === casteFilter;
      const matchesReligion = !religionFilter || religion === religionFilter;
      const matchesGender = !genderFilter || gender === genderFilter;
      const matchesMaritalStatus = !maritalStatusFilter || maritalStatus === maritalStatusFilter;
      const matchesEducation = !educationFilter || education === educationFilter;
      const matchesProfession = !professionFilter || profession === professionFilter;
      const matchesState = !stateFilter || state === stateFilter;
      const matchesAgeFrom =
        this.appliedFilters.ageFrom === null || profile.age >= this.appliedFilters.ageFrom;
      const matchesAgeTo =
        this.appliedFilters.ageTo === null || profile.age <= this.appliedFilters.ageTo;

     
let matchesLocation = true;

if (locationFilter) {
  matchesLocation = city === locationFilter;
}

if (matchesLocation && radiusFilter !== null && radiusFilter > 0) {

  if (
    this.userLat == null ||
    this.userLng == null ||
    profile.latitude == null ||
    profile.longitude == null
  ) {
    matchesLocation = false;
  } else {

    const distance = this.calculateDistanceKm(
      this.userLat,
      this.userLng,
      profile.latitude,
      profile.longitude
    );

    profile.distanceKm = distance;

    matchesLocation = distance <= radiusFilter;
  }
}

      return (
        matchesOppositeGender &&
        matchesCaste &&
        matchesReligion &&
        matchesGender &&
        matchesMaritalStatus &&
        matchesLocation &&
        matchesState &&
        matchesEducation &&
        matchesProfession &&
        matchesAgeFrom &&
        matchesAgeTo
      );
    });

    const sidebarFiltered = result.filter((profile) => {
      if (this.sidebarFilter === 'all') return true;

 if (this.sidebarFilter === 'liked') {
  return profile.liked === true;
}

    if (this.sidebarFilter === 'shortlistedMe') {
 return this.shortlistedMeUserIds.includes(profile.id);
}

      if (this.sidebarFilter === 'viewedByYou' || this.sidebarFilter === 'viewed') {
        if (!this.isBrowser) return false;

        const viewedIds = JSON.parse(
          localStorage.getItem(this.getUserStorageKey('tm_viewed_profiles')) || '[]'
        ) as string[];

        return viewedIds.includes(profile.id);
      }

      if (this.sidebarFilter === 'newlyJoined') {
        
        return true;
      }

      if (this.sidebarFilter === 'nearby') {
        const distance = this.getDistanceForProfile(profile);
        return distance !== null && distance <= 50;
      }

      if (this.sidebarFilter === 'photos') {
        return !!profile.image && profile.image !== 'assets/default-avatar.png';
      }

      if (this.sidebarFilter === 'education') {
        return !!this.getText(profile.education);
      }

      if (this.sidebarFilter === 'profession') {
        return !!this.getText(profile.profession);
      }

      if (this.sidebarFilter === 'location') {
        return !!this.getText(profile.location);
      }

      if (this.sidebarFilter === 'nri') {
        return !this.normalizeText(this.getText(profile.location)).includes('india');
      }

      if (this.sidebarFilter === 'mutual') {
        return profile.liked === true;
      }

      if (this.sidebarFilter === 'lookingForYou') {
        return true;
      }
    if (this.sidebarFilter === 'star') {
      
  return this.isRasiNakshatraMatch(profile);

  
}

      return true;
    });

    return sidebarFiltered
      .map((profile) => {
        let distanceKm: number | null = null;

        if (this.appliedFilters.radius !== null && this.appliedFilters.radius > 0) {
          if (this.appliedFilters.location) {
            distanceKm = this.getDistanceFromSelectedCity(profile);
          } else {
            distanceKm = this.getDistanceForProfile(profile);
          }
        }

        return {
          ...profile,
          distanceKm
        };
      })
.sort((a, b) => {

  // Free Search -> don't sort by caste
  if (!this.isLoggedIn) {
    return 0;
  }

  const myCaste = this.normalizeText(this.userCaste);

console.log('MY CASTE:', myCaste);
console.log(
  'PROFILE CASTES:',
  sidebarFiltered.map(p => this.normalizeText(this.getText(p.caste)))
);

  const casteA = this.normalizeText(this.getText(a.caste));
  const casteB = this.normalizeText(this.getText(b.caste));

  const aSameCaste = myCaste && casteA === myCaste;
  const bSameCaste = myCaste && casteB === myCaste;

  if (aSameCaste && !bSameCaste) return -1;
  if (!aSameCaste && bSameCaste) return 1;

  const radiusActive = this.appliedFilters.radius !== null;
  if (!radiusActive) return 0;

  const aDistance = a.distanceKm ?? Number.MAX_SAFE_INTEGER;
  const bDistance = b.distanceKm ?? Number.MAX_SAFE_INTEGER;

  return aDistance - bDistance;
});
  }
async loadEducationOptions(){

  try {

    const response:any =
      await this.profilesService
      .getEducationOptions()
      .toPromise();


    this.educationOptions =
      (response.data || [])
      .map((item:any)=>({

        en:
          item.en ||
          item.education_name ||
          item.name ||
          item,


        ta:
          item.ta ||
          item.education_name_ta ||
          item.name_ta ||
          item.en ||
          item

      }));


  }
  catch(error){

    console.error(
      "Education loading error",
      error
    );

  }

}
async loadFilterTables(): Promise<void> {
try {

  const response:any =
    await this.profilesService
    .getMaritalStatusOptions()
    .toPromise();


  const maritalData =
    response.data || [];


  this.maritalStatusOptions =
    maritalData
    .map((x:any)=>({

      en:
        String(
          x.nameEn || ""
        ).trim(),


      ta:
        String(
          x.nameTa || x.nameEn || ""
        ).trim()

    }))
    .filter(
      (x:LangText)=>x.en
    );


}
catch(error){

 console.error(
  "Marital status loading error",
  error
 );

}
try {

  const response:any =
    await this.profilesService
    .getStateOptions()
    .toPromise();


  const stateData =
    response.data || [];


  this.stateOptions =
    stateData
    .map((x:any)=>({

      en:
        String(
          x.nameEn || ""
        ).trim(),


      ta:
        String(
          x.nameTa || x.nameEn || ""
        ).trim()


    }))
    .filter(
      (x:LangText)=>x.en
    );


}
catch(error){

 console.error(
   "State loading error",
   error
 );

}
try {

  const response:any =
    await this.profilesService
    .getCityOptions()
    .toPromise();


  const cityData =
    response.data || [];


  this.cityOptions =
    cityData
    .map((x:any)=>({

      en:
        String(
          x.nameEn || ""
        ).trim(),


      ta:
        String(
          x.nameTa || x.nameEn || ""
        ).trim(),


      state:
        String(
          x.stateId?.nameEn || ""
        )
        .toLowerCase()
        .trim()

    }))
    .filter(
      (x:any)=>x.en
    );


}
catch(error){

 console.error(
  "City loading error",
  error
 );

}
try {

  const religionResponse:any =
    await this.profilesService
    .getReligionOptions()
    .toPromise();


  this.religionOptions =
    (religionResponse.data || [])
    .map((x:string)=>({

      en:x,

      ta:this.getTamilProfileValue(
        'religion',
        x
      )

    }));


}
catch(error){

 console.error(
   "Religion loading error",
   error
 );

}

try {

  const response:any =
    await this.profilesService
    .getCasteOptions()
    .toPromise();


  const casteData =
    response.data || [];


  this.casteOptions =
    casteData
    .map((x:any)=>({

      en:
        String(
          x.nameEn || ""
        ).trim(),


      ta:
        String(
          x.nameTa || x.nameEn || ""
        ).trim(),


      religion:
        String(
          x.religionId?.nameEn || ""
        )
        .toLowerCase()
        .trim()

    }))
    .filter(
      (x:any)=>x.en
    );


  this.casteMap = {};


  this.casteOptions.forEach((x:any)=>{

    this.casteMap[
      x.en.toLowerCase()
    ] =
      x.ta || x.en;

  });


}
catch(error){

 console.error(
  "Caste loading error",
  error
 );

}

try {

  const response:any =
    await this.profilesService
    .getGenderMasterOptions()
    .toPromise();


  const genderData =
    response.data || response || [];


  this.genderOptions =
    genderData
    .map((x:any)=>{

      const en =
        String(
          x.gender_name ||
          x.name ||
          x
        ).trim();


      return {

        en,

        ta:this.getTamilProfileValue(
          'gender',
          en
        )

      };

    })
    .filter(
      (x:LangText)=>x.en
    );


}
catch(error){

 console.error(
   "Gender loading error",
   error
 );

}
try {

  const response:any =
    await this.profilesService
    .getProfessionOptions()
    .toPromise();


  const professionData =
    response.data || response || [];


  this.professionOptions =
    professionData.map((item:string)=>({

      en:item,

      ta:this.getTamilProfileValue(
        'profession',
        item
      )

    }));


}
catch(error){

 console.error(
   "Profession loading error",
   error
 );

}
  this.cdr.detectChanges();
}
getFilteredCasteOptions(): (LangText & { religion: string })[] {
  const search = String(this.searchTerms.caste || '').toLowerCase().trim();
  const selectedReligion = String(this.filters.religion || '').toLowerCase().trim();

  return this.casteOptions.filter((item) => {
    const casteName = this.getText(item).toLowerCase();
    const matchesSearch = !search || casteName.includes(search);
    const matchesReligion = !selectedReligion || item.religion === selectedReligion;

    return matchesSearch && matchesReligion;
  });
}
  getText(value: string | LangText): string {
    if (typeof value === 'string') return value;
    return value?.[this.currentLang] || value?.en || '';
  }
getDistrictOnly(location: string): string {

  if (!location) return '-';

  const parts = location
    .split(',')
    .map(x => x.trim())
    .filter(Boolean);

  return parts[0] || '-';
}
getUniqueOptions(list: ProfileItem[], key: keyof ProfileItem): string[] {
  const values = list
    .map(item => this.getText(item[key] as string | LangText))
    .map(value => {
      const text = String(value || '').trim().toLowerCase();

      if (
        text === '' ||
        text === '-' ||
        text === 'null' ||
        text === 'nil' ||
        text === 'nill' ||
        text === 'undefined' ||
        text === 'n/a' ||
        text === 'unworking' ||
        text === 'no job'
      ) {
        return 'Not Working';
      }

      return String(value || '').trim();
    })
    .filter(Boolean);

  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

  toggleDropdown(name: string, event: Event): void {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === name ? null : name;
  }
private getNextDropdown(field: string): string | null {

  const order: Record<string, string | null> = {

    ageFrom: 'ageTo',

    ageTo: 'religion',

    religion: 'caste',

    caste: 'gender',

    gender: 'maritalStatus',

    maritalStatus: 'state',

    state: 'location',

    location: 'radius',

    radius: 'education',

    education: 'profession',

    profession: null

  };

  return order[field] || null;
}
selectOption(
  field:
    | 'caste'
    | 'religion'
    | 'gender'
    | 'maritalStatus'
    | 'location'
    | 'education'
    | 'profession'
    | 'state',

  value: string
): void {

  this.filters[field] = value;

  this.appliedFilters = {
    ...this.filters
  };

const next = this.getNextDropdown(field);

this.openDropdown = next;

this.cdr.detectChanges();

if (next) {
  this.scrollFilterToDropdown(next);
} else {
  this.scrollFilterToDropdown('apply');
}
}

selectNumberOption(
  field: 'ageFrom' | 'ageTo' | 'radius',
  value: number | null
): void {

  this.filters[field] = value;

  this.appliedFilters = {
    ...this.filters
  };

const next = this.getNextDropdown(field);

this.openDropdown = next;

this.cdr.detectChanges();

if (next) {
  this.scrollFilterToDropdown(next);
} else {
  this.scrollFilterToDropdown('apply');
}
}
  getFilteredOptions(options: string[], search: string): string[] {
    const term = String(search || '').toLowerCase().trim();
    if (!term) return options;
    return options.filter(item =>
      String(item || '').toLowerCase().includes(term)
    );
  }
getFilteredLangOptions(options: LangText[], search: string): LangText[] {
  const term = String(search || '').toLowerCase().trim();

  if (!term) return options;

  return options.filter(item =>
    this.getText(item).toLowerCase().includes(term)
  );
}
getFilteredCityOptions(): LangText[] {
  const search = String(this.searchTerms.location || '').toLowerCase().trim();
  const selectedState = String(this.filters.state || '').toLowerCase().trim();

  return this.cityOptions.filter((item: any) => {

    const cityName = this.getText(item).toLowerCase();

    const cityState = String(item.state || '').toLowerCase().trim();

    const matchesSearch =
      !search || cityName.includes(search);

    const matchesState =
      !selectedState || cityState === selectedState;

    return matchesSearch && matchesState;
  });
}
  getFilteredNumberOptions(options: number[], search: string): number[] {
    const term = String(search || '').toLowerCase().trim();
    if (!term) return options;
    return options.filter(item =>
      String(item).toLowerCase().includes(term)
    );
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.openDropdown = null;
  }

  trackByProfile(index: number, profile: ProfileItem): string {
    return profile.id || String(index);
  }
private scrollFilterToStart(): void {
  setTimeout(() => {
    const el = this.filterBarRef?.nativeElement as any;

    if (el) {
      el.scrollLeft = 0;
    }
  }, 150);
}
private scrollFilterToDropdown(name: string): void {
  setTimeout(() => {
    const item = document.querySelector(
      `[data-filter="${name}"]`
    ) as HTMLElement | null;

    if (item) {
      item.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest'
      });
    }
  }, 100);
}

  setTab(tab: TabType): void {
    this.activeTab = tab;
    this.openDropdown = null;
    this.cdr.detectChanges();
  }

applyFilters(forceClose?: boolean): void {

  this.appliedFilters = { ...this.filters };

  this.openDropdown = null;

  this.cdr.detectChanges();

  this.scrollFilterToStart();
}

  resetFilters(): void {
    this.filters = {
      caste: null,
      religion: null,
      gender: null,
      maritalStatus: null,
      location: null,
      education: null,
      profession: null,
      state: null,
      ageFrom: null,
      ageTo: null,
      radius: null
    };

    this.appliedFilters = { ...this.filters };

this.searchTerms = {
  ageFrom: '',
  ageTo: '',
  religion: '',
  caste: '',
  gender: '',
  maritalStatus: '',
  location: '',
  education: '',
   profession: '',
  state: '',
  radius: ''
};
   this.openDropdown = null;
this.mobileFilterOpen = false;
this.cdr.detectChanges();

this.scrollFilterToStart();
  }

  /**
   * Basic profile previews are free for everyone. Do NOT check subscription
   * or request the premium /profile/view endpoint when View Profile is clicked.
   * The public endpoint serves only approved + published, public fields.
   */
  viewProfile(profile: ProfileItem): void {
    const code = String(profile?.id || '').trim();
    if (!code) {
      this.snackbar.error(this.tr.alerts.invalidProfileCode);
      return;
    }
    void this.router.navigate(['/free-profile', code]);
  }
instantLike(event: MouseEvent, profile: ProfileItem): void {
  event.preventDefault();
  event.stopPropagation();

  console.log('❤️ HEART BUTTON CLICKED');
  console.log(profile);

  this.likeProfile(profile);
}
async likeProfile(profile: ProfileItem): Promise<void> {

  const userId = this.getLoggedInUserId();

  if (!userId) {
    this.snackbar.error('Please login');
    return;
  }

  try {

    const res: any = await this.profilesService
      .toggleLike(userId, profile.userId)
      .toPromise();

    profile.liked = res.liked;

    await this.loadLikedProfiles();
    await this.loadLikedMeProfiles();

    this.cdr.detectChanges();

  } catch (err) {
    console.error(err);
  }

}
async sendInterest(profile: ProfileItem): Promise<void> {

  const userId = this.getLoggedInUserId();

  if (!userId) {
    this.snackbar.error('Please login first');
    this.router.navigate(['/login']);
    return;
  }

  try {

    const response:any =
      await this.profilesService
      .sendInterest(
        userId,
        profile.userId
      )
      .toPromise();


    if(response?.success){

      this.snackbar.success(
        'Interest sent successfully'
      );

    }
    else{

      this.snackbar.error(
        response?.message || 
        'Failed to send interest'
      );

    }


  }
  catch(error:any){

    console.error(
      "Interest error",
      error
    );


    if(error?.status === 409){

      this.snackbar.error(
        'Already sent interest'
      );

      return;
    }


    this.snackbar.error(
      'Failed to send interest'
    );

  }

}

  upgradePlan(): void {
    this.router.navigate(['/plans']);
  }
async loadLoggedInUserProfile(): Promise<void> {
  const userId = this.getLoggedInUserId();

  if (!userId) return;

  try {
    const response: any = await this.profilesService.getMyProfile().toPromise();
    const data = response?.data;

    if (!data) return;

    this.userProfileName =
      data.basic?.fullName?.[this.currentLang] ||
      data.basic?.fullName?.en ||
      '';

this.userProfileImage =
  data.media?.profileImage ||
  data.media?.profileImageUrl ||
  '';

this.userGender =
  data.basic?.gender ||
  data.gender_text ||
  data.gender ||
  data.personal?.gender ||
  '';
  if (!this.userGender && this.isBrowser) {
  const rawUser =
    localStorage.getItem('matrimony_user') ||
    localStorage.getItem('user') ||
    localStorage.getItem('loggedInUser');

  if (rawUser) {
    const parsed = JSON.parse(rawUser);
    this.userGender =
      parsed.gender ||
      parsed.gender_text ||
      parsed.userGender ||
      '';
  }
}
console.log('LOGGED USER ID:', userId);
console.log('LOGGED USER GENDER:', this.userGender);      

this.userCaste =
  data.religion?.caste ||
  data.religion?.otherCaste ||
  data.caste_text ||
  '';
  console.log('LOGGED USER CASTE:', this.userCaste);

    this.userRasi =
      data.astrology?.rasiText ||
      '';

    this.userNakshatra =
      data.astrology?.nakshatraText ||
      '';

    this.userLat = this.toNullableNumber(data.address?.latitude);
    this.userLng = this.toNullableNumber(data.address?.longitude);

    this.cdr.detectChanges();
  } catch (error) {
    console.error('Load logged in user profile error:', error);
  }
}
  renewPlan(): void {
    this.router.navigate(['/plans']);
  }
async refreshUserProfileLanguage(): Promise<void> {

  const userId = this.getLoggedInUserId();

  if (!userId) return;


  try {

    const response:any =
      await this.profilesService
      .getMyProfile()
      .toPromise();


    const data =
      response?.data;


    if(!data) return;


    const fullName =
      data.basic?.fullName;


    this.userProfileName =
      this.currentLang === 'ta'
      ? (
          fullName?.ta ||
          fullName?.en ||
          ''
        )
      : (
          fullName?.en ||
          fullName?.ta ||
          ''
        );


    this.cdr.detectChanges();


  }
  catch(error){

    console.error(
      "Refresh profile language error",
      error
    );

  }

}
ngOnDestroy(): void {
  this.destroyed = true;

  if (this.visibleProfileTimer) {
    clearTimeout(this.visibleProfileTimer);
    this.visibleProfileTimer = null;
  }
}
private async checkUserApprovalStatus(): Promise<boolean> {

  const userId = this.getLoggedInUserId();

  if (!userId) {
    return true;
  }

  try {

 const response:any =
  await this.profilesService
  .getMyProfile()
  .toPromise();


    const profile =
      response?.data?.profile ||
      response?.profile ||
      response?.data;


    const status =
      String(profile?.profileStatus || '')
      .toLowerCase()
      .trim();


    console.log(
      "CURRENT PROFILE STATUS:",
      status
    );

if(status === 'pending' || status === 'draft'){

  this.showApprovalMessage = true;

  this.profiles = [];

  this.isLoading = false;

  this.cdr.detectChanges();

  return false;
}

    if(status === 'approved'){

      this.showApprovalMessage = false;

      return true;
    }


    return false;


  } catch(error){

    console.error(
      "Approval check error",
      error
    );

    return false;
  }

}
async loadAgeOptions(){

  try {

    const response:any =
      await this.profilesService
      .getAgeOptions()
      .toPromise();


    if(response?.success){

      this.ageFromOptions = response.data;

      this.ageToOptions = response.data;

    }


  } catch(error){

    console.error(
      "Age options loading error",
      error
    );

  }

}
async loadGenderOptions(){

  try {

    const response:any =
      await this.profilesService
      .getGenderOptions()
      .toPromise();


    if(response?.success){

      this.genderOptions = response.data;

    }


  } catch(error){

    console.error(
      "Gender options error",
      error
    );

  }

}
async loadReligionOptions(){

  try {

    const response:any =
      await this.profilesService
      .getReligionOptions()
      .toPromise();


    if(response?.success){

      this.religionOptions =
        (response.data || []).map((item:string)=>({

          en:item,

          ta:this.getTamilProfileValue(
            'religion',
            item
          )

        }));

    }


  } catch(error){

    console.error(
      "Religion options error",
      error
    );

  }

}
getSelectedFilterText(
 type:string,
 value:string|null
):string {

 if(!value) return '';

 let list:any[] = [];

 switch(type){

 case 'gender':
   list = this.genderOptions;
   break;

 case 'religion':
   list = this.religionOptions;
   break;

 case 'caste':
   list = this.casteOptions;
   break;

 case 'maritalStatus':
   list = this.maritalStatusOptions;
   break;

 case 'education':
   list = this.educationOptions;
   break;

 case 'profession':
   list = this.professionOptions;
   break;

 case 'state':
   list = this.stateOptions;
   break;

 case 'location':
   list = this.cityOptions;
   break;
 }


 const item = list.find(
   x =>
   x.en?.toLowerCase() === value.toLowerCase()
 );


 return item ? this.getText(item) : value;

}
}