import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../core/services/language.service';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../services/api.service';
import { MasterService } from '../services/master.service';

import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '../shared/snackbar.service';
import { UserFlowService } from '../core/services/user-flow';
import { AuthService } from '../services/auth.service';
import {
  createBiodataFormData,
  createBiodataTamilFormData
} from './biodata.form';
import { biodataTranslations } from './biodata.translations';
import {
  horoscopeValueMap,
  planetShortMap
} from './biodata.constants';
import { MediaUpload } from './sections/media-upload/media-upload';
import { ProfilePreview } from './sections/profile-preview/profile-preview';
import { PersonalDetails } from './sections/personal-details/personal-details';
import { FamilyDetails } from './sections/family-details/family-details';
import { EducationCareer } from './sections/education-career/education-career';
import { LocationDetails } from './sections/location-details/location-details';
import { HoroscopeDetails } from './sections/horoscope-details/horoscope-details';
import { PartnerPreferences } from './sections/partner-preferences/partner-preferences';
import { ReviewSubmit } from './sections/review-submit/review-submit';
import { environment } from '../../environments/environment';
import { BIODATA_STEPS, firstMissingStepField, StepField } from './biodata.steps';
import { suggestBilingualName, hasTamilScript } from './biodata.names';
@Component({
  selector: 'app-biodata',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUpload, ProfilePreview, PersonalDetails, FamilyDetails, EducationCareer, LocationDetails, HoroscopeDetails, PartnerPreferences, ReviewSubmit],
  templateUrl: './biodata.html',
  styleUrls: ['./biodata.scss', './biodata-wizard-backgrounds.scss']
})
export class Biodata implements OnInit {
    constructor(
    private flow: UserFlowService
  ) {}
  app = inject(LanguageService);
  cdr = inject(ChangeDetectorRef);
  snackbar = inject(SnackbarService);
  route = inject(ActivatedRoute);
router = inject(Router);
api = inject(ApiService);
private auth = inject(AuthService);
masterService = inject(MasterService);

editProfileId = '';

isBrowser = typeof window !== 'undefined';

isExtracting = false;
isSaving = false;
isSubmitted = false;
isEditMode = false;
isCheckingDuplicate = false;
duplicateProfileExists = false;
maxDobDate = new Date().toISOString().split('T')[0];

poorvegamSearch = '';
showPoorvegamDropdown = false;
filteredPoorvegamList: any[] = [];
isOtherPoorvegam = false;

iruppidamSearch = '';
showIruppidamDropdown = false;
filteredIruppidamList: any[] = [];
isOtherIruppidam = false;   

isLoadingProfile = false;
submitted = false;
fieldErrors: Record<string, boolean> = {};
private nameTranslateTimer: any;
private fatherNameTranslateTimer: any;
private motherNameTranslateTimer: any;


isInvalid(field: string): boolean {
  return this.submitted && !!this.fieldErrors[field];
}
  private currentUserId: string | null = null;
isAdminCreated = false;

isAdminBiodataMode(): boolean {
  return this.isAdminCreated || !!this.editProfileId;
}
  private existingProfileImageUrl: string | null = null;
  private existingVideoUrl: string | null = null;
  private existingHoroscopeFileUrl: string | null = null;
  private existingLatitude: number | null = null;
  private existingLongitude: number | null = null;

translations = biodataTranslations;
formData = createBiodataFormData();
formDataTa = createBiodataTamilFormData();

// The public registration flow uses a wizard. Admin-created/edited profiles
// keep the original expanded layout and separate Tamil/English name inputs.
readonly wizardSteps = BIODATA_STEPS;
activeStep = 0;
  private guideAudio: HTMLAudioElement | null = null;
  /** Display-only DD-MM-YYYY string. API/desktop form always store YYYY-MM-DD. */
  mobileDobText = '';
  guideAudioError = false;
  readonly audioSteps = ['personal-details','family-details','education-career','location-details','horoscope-details','partner-preferences','media-upload','review-submit'];
  async listenToStep(): Promise<void> {
    this.stopStepAudio(); this.guideAudioError = false;
    if (typeof Audio === 'undefined' || this.isAdminBiodataMode()) return;
    const player = new Audio(`assets/voice-guide/${this.currentLang}/${this.audioSteps[this.activeStep]}.mp3`);
    this.guideAudio=player;
    player.onerror=()=>{this.guideAudioError=true;this.stopStepAudio();};
    try { await player.play(); } catch { this.guideAudioError = true; }
  }
  stopStepAudio(): void {if(this.guideAudio){this.guideAudio.pause();this.guideAudio.currentTime=0;this.guideAudio=null;}}

/** Keep a manually corrected parent-name spelling when the wizard changes steps. */
readonly familySpellingCorrected: Record<'fatherName' | 'motherName', boolean> = {
  fatherName: false, motherName: false
};
showAlternateSpelling = false;
nameSpellingManuallyCorrected = false;
nameNeedsReview = false;

get selectedWizardStep() { return this.wizardSteps[this.activeStep]; }
get nameInActiveLanguage(): string {
  return this.currentLang === 'ta'
    ? (this.formDataTa.fullName || this.formData.fullName)
    : (this.formData.fullName || this.formDataTa.fullName);
}
get alternateNameSuggestion(): string {
  return this.currentLang === 'ta' ? this.formData.fullName : this.formDataTa.fullName;
}
setAlternateNameSpelling(value: string): void {
  this.nameSpellingManuallyCorrected = true;
  if (this.currentLang === 'ta') this.formData.fullName = value.trim();
  else this.formDataTa.fullName = value.trim();
  // Do not mark English text as a valid Tamil spelling.
  this.nameNeedsReview = this.currentLang === 'en' && !!value.trim() && !hasTamilScript(value);
}
onUserNameInput(value: string): void {
  const suggestion = suggestBilingualName(value);
  const inputIsTamil = hasTamilScript(value);
  if (inputIsTamil) {
    this.formDataTa.fullName = value;
    if (!this.nameSpellingManuallyCorrected) this.formData.fullName = suggestion.en;
  } else {
    this.formData.fullName = value;
    if (!this.nameSpellingManuallyCorrected) this.formDataTa.fullName = suggestion.ta;
  }
  this.nameNeedsReview = !this.nameSpellingManuallyCorrected && suggestion.needsReview;
}
  /** Translate only known profile choices for a Tamil review; never fake user prose. */
  wizardDisplayValue(input: unknown): string {
    const value = String(input ?? '').trim();
    if (!value || this.currentLang !== 'ta') return value || '-';
    const options: Record<string, string> = {
      male: 'ஆண்', female: 'பெண்', hindu: 'இந்து', christian: 'கிறிஸ்தவர்',
      muslim: 'இஸ்லாம்', 'first marriage': 'முதல் திருமணம்',
      'second marriage': 'மறுமணம்', yes: 'ஆம்', no: 'இல்லை',
      india: 'இந்தியா', tamilnadu: 'தமிழ்நாடு', 'tamil nadu': 'தமிழ்நாடு',
      chennai: 'சென்னை', madurai: 'மதுரை', salem: 'சேலம்',
      coimbatore: 'கோயம்புத்தூர்', trichy: 'திருச்சி',
      'civil engineer': 'சிவில் பொறியாளர்', 'software engineer': 'மென்பொருள் பொறியாளர்'
    };
    return options[value.toLocaleLowerCase('en-IN')] || value;
  }

setWizardLanguage(lang: 'en' | 'ta'): void {
  this.app.currentLang = lang;
  if (typeof window !== 'undefined') localStorage.setItem('tm_language', lang);
  if (this.nameInActiveLanguage.trim() && (!this.formData.fullName || !this.formDataTa.fullName)) {
    const suggested = suggestBilingualName(this.nameInActiveLanguage);
    if (!this.formData.fullName) this.formData.fullName = suggested.en;
    if (!this.formDataTa.fullName) this.formDataTa.fullName = suggested.ta;
  }
  this.updateLocationSearchText(lang);
}
private requiredWizardFields(index: number): StepField[] {
  const fields: StepField[] = [];
  const add = (key: string, labelEn: string, labelTa: string, value: unknown) =>
    fields.push({ key, labelEn, labelTa, value });
  if (index === 0) {
    add('fullName', 'Full Name', 'முழுப் பெயர்', this.formData.fullName || this.formDataTa.fullName);
    add('gender', 'Gender', 'பாலினம்', this.formData.gender);
    add('dob', 'Date of Birth', 'பிறந்த தேதி', this.isValidDob(this.formData.dob) ? this.formData.dob : '');
    add('maritalStatus', 'Marital Status', 'திருமண நிலை', this.formData.maritalStatus);
    add('mobile', 'Mobile', 'கைபேசி எண்', /^\d{10}$/.test(String(this.formData.mobile || '').trim()) ? this.formData.mobile : '');
    add('religion', 'Religion', 'மதம்', this.selectedReligionId);
    add('caste', 'Caste', 'சாதி', this.formData.caste === 'Other' ? this.formData.otherCaste : this.formData.caste);
  } else if (index === 2) {
    add('education', 'Education', 'கல்வித் தகுதி', this.formData.education === 'Other' ? this.formData.otherEducation : this.formData.education);
  } else if (index === 3) {
    add('address', 'Address', 'முகவரி', this.formData.address || this.formDataTa.address);
    add('country', 'Country', 'நாடு', this.selectedCountryId || this.countrySearch || this.formData.country);
    add('state', 'State', 'மாநிலம்', this.selectedStateId || this.stateSearch || this.formData.state);
    add('city', 'District', 'மாவட்டம்', this.selectedCityId || this.citySearch || this.formData.city);
  } else if (index === 4 && this.isHinduReligion()) {
    add('rasi', 'Rasi', 'ராசி', this.formData.rasi);
    add('nakshatra', 'Nakshatra', 'நட்சத்திரம்', this.formData.nakshatra);
  }
  return fields;
}
nextWizardStep(): void {
  if (this.isAdminBiodataMode() || this.activeStep >= this.wizardSteps.length - 1 || this.isSaving) return;
  const missing = firstMissingStepField(this.requiredWizardFields(this.activeStep));
  if (missing) {
    this.submitted = true;
    this.fieldErrors = { [missing.key]: true };
    this.snackbar.error(this.currentLang === 'ta'
      ? `${missing.labelTa} நிரப்பவும்` : `Please complete ${missing.labelEn}`);
    return;
  }
  this.submitted = false;
  this.fieldErrors = {};
  this.stopStepAudio();
  this.activeStep++;
  this.scrollToWizardTop();
}
previousWizardStep(): void {
  if (this.isAdminBiodataMode() || this.activeStep === 0 || this.isSaving) return;
  this.stopStepAudio();
  this.activeStep--;
  this.submitted = false;
  this.fieldErrors = {};
  this.scrollToWizardTop();
}
editWizardStep(index: number): void {
  if (!this.isAdminBiodataMode() && index >= 0 && index < this.activeStep) {
    this.stopStepAudio();
  this.activeStep = index;
    this.scrollToWizardTop();
  }
}
private scrollToWizardTop(): void {
  if (typeof window !== 'undefined') {
    window.requestAnimationFrame(() => document.getElementById('biodata-wizard-heading')?.scrollIntoView({behavior:'smooth',block:'start'}));
  }
}


rasiChart: string[] = Array(12).fill('');
amsamChart: string[] = Array(12).fill('');


  selectedProfileImage: File | null = null;
  profilePreviewUrl: string | null = null;
  additionalImages: File[] = [];
  additionalImagePreviews: string[] = [];

  selectedVideo: File | null = null;
  videoPreviewUrl: string | null = null;

  selectedHoroscopeFile: File | null = null;
  horoscopePreviewUrl: string | null = null;
  casteList: any[] = [];
  casteSearch = '';
showCasteDropdown = false;
filteredCasteList: any[] = [];
religionList: any[] = [];
genderList: any[] = [];
maritalStatusList: any[] = [];
colorList: any[] = [];
kudumbaNilaiList: any[] = [];
secondMarriageReasonList: any[] = [];
dhoshamDbList: any[] = [];
rasiDbList: any[] = [];
nakshatraDbList: any[] = [];
lagnamDbList: any[] = [];
thisaiIruppuList: any[] = [];
selectedThisaiIruppuId = '';
hisaiList: any[] = [];
allCastes: any[] = [];
selectedReligionId = '';
countryList: any[] = [];
countrySearch = '';
showCountryDropdown = false;
filteredCountryList: any[] = [];
allStates: any[] = [];
stateList: any[] = [];
stateSearch = '';
showStateDropdown = false;
filteredStateList: any[] = [];
allCities: any[] = [];
cityList: any[] = [];
citySearch = '';
showCityDropdown = false;
filteredCityList: any[] = [];
selectedCountryId = '';
selectedStateId = '';
selectedCityId = '';
isOtherCountrySelected(): boolean {
  const country = this.countryList.find(
    (c: any) => c._id === this.selectedCountryId
  );

  return country?.nameEn?.toLowerCase() === 'other';
}
/** Mobile displays DD-MM-YYYY, but MongoDB payload stores a validated ISO date. */
formatDob(event: Event): void {
  const input = event.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, '').slice(0, 8);
  this.mobileDobText = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean).join('-');
  input.value = this.mobileDobText;
  if (digits.length !== 8) {
    this.formData.dob = '';
    this.formData.age = '';
    return;
  }
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  const iso = `${year}-${month}-${day}`;
  this.formData.dob = this.isValidDob(iso) ? iso : '';
  this.onDobChange();
}

isValidDob(input: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  const [year, month, day] = input.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return year >= 1900 && parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 && parsed.getDate() === day && parsed <= today;
}

formatBirthTime(event: any): void {
  let value = event.target.value.toUpperCase();

  value = value.replace(/[^0-9APM: ]/g, '');

  this.formData.birthTime = value;
}

onBirthTimePick(event: any): void {
  const value = event.target.value;

  if (!value) return;

  const [hourStr, minute] = value.split(':');

  let hour = Number(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;
  hour = hour ? hour : 12;

  this.formData.birthTime =
    `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}
onMobileDatePick(event: any) {

  const value = event.target.value;

  if (!value) return;

  const [year, month, day] =
    value.split('-');

  this.formData.dob = `${year}-${month}-${day}`;
  this.onDobChange();
}
isOtherStateSelected(): boolean {
  const state = this.stateList.find(
    (s: any) => s._id === this.selectedStateId
  );

  return state?.nameEn?.toLowerCase() === 'other';
}

isOtherCitySelected(): boolean {
  const city = this.cityList.find(
    (c: any) => c._id === this.selectedCityId
  );

  return city?.nameEn?.toLowerCase() === 'other';
}

onCityChange(): void {
  const city = this.cityList.find(
    (c: any) => c._id === this.selectedCityId
  );

  this.formData.city = city?.nameEn || '';
}
educationList: any[] = [];
filteredEducationList: any[] = [];
professionList: any[] = [];
educationSearch = '';
showEducationDropdown = false;
 get currentLang(): 'en' | 'ta' {

  if (typeof window === 'undefined') {
    return 'en';
  }

  return (
    localStorage.getItem('tm_language') as 'en' | 'ta'
  ) || 'en';
}
addAdditionalMobile(): void {

  this.formData.additionalMobile.push('');

}
removeAdditionalMobile(index: number): void {

  if (this.formData.additionalMobile.length === 1) {
    this.formData.additionalMobile[0] = '';
    return;
  }

  this.formData.additionalMobile.splice(index, 1);
}
  get tr() {
    return this.translations[this.currentLang];
  }
isAdminTanglishEnabled(): boolean {
  return true;
}
allowEnglishAddress(event: any): void {
  let value = event.target.value;

  value = value.replace(/[^A-Za-z0-9\s,./\-#]/g, '');

  this.formData.address = value;
  event.target.value = value;
}

readonly horoscopeValueMap = horoscopeValueMap;
planetShortMap = planetShortMap;
horoscopeHints = [
  { no: 1, label: 'வியாழன்' },
  { no: 2, label: 'கேது' },
  { no: 3, label: 'லக்னம்' },
  { no: 4, label: 'செவ்வாய்' },
  { no: 5, label: 'புதன்' },
  { no: 6, label: 'சந்திரன்' },
  { no: 7, label: 'ராகு' },
  { no: 8, label: 'சனி' },
  { no: 9, label: 'சூரியன்' },
  { no: 10, label: 'சுக்கிரன்' },
  { no: 11, label: 'மாந்தி' },
  { no: 12, label: 'வகரம்' }
];
getTamilValue(

  type: 'rasi' | 'nakshatra' | 'lagnam' | 'dhosham',
  value: string
): string {

  if (this.currentLang !== 'ta') {
    return value;
  }

  if (type === 'lagnam') {
    return this.horoscopeValueMap.rasi[value] || value;
  }

  return this.horoscopeValueMap[type]?.[value] || value;
}
async translateText(
  text: string,
  target: 'ta' | 'en' = 'ta'
): Promise<string> {
  return text || '';
}
getTypedValue(field: keyof typeof this.formDataTa): string {
  if (this.currentLang === 'ta') {
    return this.formDataTa[field] || String((this.formData as any)[field] || '');
  }

  return String((this.formData as any)[field] || this.formDataTa[field] || '');
}
setTypedValue(field: keyof typeof this.formDataTa, value: string): void {
  if (this.currentLang === 'ta') {
    this.formDataTa[field] = value;
  } else {
    (this.formData as any)[field] = value;
  }
}

handleTyping(event: KeyboardEvent): void {
  if (this.currentLang === 'ta') {
    this.tamilKeypress(event);
  }
}
hidePoorvegamDropdown(): void {
  setTimeout(() => {
    this.showPoorvegamDropdown = false;
  }, 200);
}

hideIruppidamDropdown(): void {
  setTimeout(() => {
    this.showIruppidamDropdown = false;
  }, 200);
}
onCasteSearchChange(): void {
  const search = this.casteSearch.trim().toLowerCase();

  this.filteredCasteList = this.casteList.filter((caste: any) =>
    (caste.nameEn || '').toLowerCase().includes(search) ||
    (caste.nameTa || '').includes(this.casteSearch.trim())
  );

  const exact = this.casteList.find((caste: any) =>
    (caste.nameEn || '').toLowerCase() === search ||
    (caste.nameTa || '') === this.casteSearch.trim()
  );

  this.formData.caste = exact
    ? exact.nameEn
    : this.casteSearch.trim();

  this.formData.otherCaste = '';
  this.showCasteDropdown = true;
}

selectCaste(caste: any): void {
  this.casteSearch =
    this.currentLang === 'ta'
      ? (caste.nameTa || caste.nameEn)
      : caste.nameEn;

  this.formData.caste = caste.nameEn;
  this.formData.otherCaste = '';
  this.showCasteDropdown = false;
}

hideCasteDropdown(): void {
  setTimeout(() => {
    this.showCasteDropdown = false;
  }, 200);
}
onCountrySearchChange(): void {
  const search = this.countrySearch.trim().toLowerCase();

  this.filteredCountryList = this.countryList.filter((country: any) =>
    (country.nameEn || '').toLowerCase().includes(search) ||
    (country.nameTa || '').includes(this.countrySearch.trim())
  );

  const exact = this.countryList.find((country: any) =>
    (country.nameEn || '').toLowerCase() === search ||
    (country.nameTa || '') === this.countrySearch.trim()
  );

  if (exact) {
    this.selectedCountryId = exact._id;
    this.formData.country = exact.nameEn;
  } else {
    this.selectedCountryId = '';
    this.formData.country = this.countrySearch.trim();
  }

  this.showCountryDropdown = true;
}

selectCountry(country: any): void {
  this.selectedCountryId = country._id;

  this.countrySearch =
    this.currentLang === 'ta'
      ? (country.nameTa || country.nameEn)
      : country.nameEn;

  this.formData.country = country.nameEn;

  this.showCountryDropdown = false;

 
  this.onCountryChange();
  this.filteredStateList = [...this.stateList];
this.stateSearch = '';
}

hideCountryDropdown(): void {
  setTimeout(() => {
    this.showCountryDropdown = false;
  }, 200);
}
onStateSearchChange(): void {
  const search = this.stateSearch.trim().toLowerCase();

  this.filteredStateList = this.stateList.filter((state: any) =>
    (state.nameEn || '').toLowerCase().includes(search) ||
    (state.nameTa || '').includes(this.stateSearch.trim())
  );

  const exact = this.stateList.find((state: any) =>
    (state.nameEn || '').toLowerCase() === search ||
    (state.nameTa || '') === this.stateSearch.trim()
  );

  if (exact) {
    this.selectedStateId = exact._id;
    this.formData.state = exact.nameEn;
  } else {
    this.selectedStateId = '';
    this.formData.state = this.stateSearch.trim();
  }

  this.showStateDropdown = true;
}

selectState(state: any): void {
  this.selectedStateId = state._id;

  this.stateSearch =
    this.currentLang === 'ta'
      ? (state.nameTa || state.nameEn)
      : state.nameEn;

  this.formData.state = state.nameEn;

  this.showStateDropdown = false;

  this.onStateChange();
  this.filteredCityList = [...this.cityList];
this.citySearch = '';
}

hideStateDropdown(): void {
  setTimeout(() => {
    this.showStateDropdown = false;
  }, 200);
}
onCitySearchChange(): void {
  const search = this.citySearch.trim().toLowerCase();

  this.filteredCityList = this.cityList.filter((city: any) =>
    (city.nameEn || '').toLowerCase().includes(search) ||
    (city.nameTa || '').includes(this.citySearch.trim())
  );

  const exact = this.cityList.find((city: any) =>
    (city.nameEn || '').toLowerCase() === search ||
    (city.nameTa || '') === this.citySearch.trim()
  );

  if (exact) {
    this.selectedCityId = exact._id;
    this.formData.city = exact.nameEn;
  } else {
    this.selectedCityId = '';
    this.formData.city = this.citySearch.trim();
  }

  this.showCityDropdown = true;
}

selectCity(city: any): void {
  this.selectedCityId = city._id;

  this.citySearch =
    this.currentLang === 'ta'
      ? (city.nameTa || city.nameEn)
      : city.nameEn;

  this.formData.city = city.nameEn;
  this.showCityDropdown = false;

  this.onCityChange();
}

hideCityDropdown(): void {
  setTimeout(() => {
    this.showCityDropdown = false;
  }, 200);
}
updateLocationSearchText(lang: 'en' | 'ta'): void {
  const country = this.countryList.find(
    (c: any) => String(c._id) === String(this.selectedCountryId)
  );

  if (country) {
    this.countrySearch =
      lang === 'ta'
        ? (country.nameTa || country.nameEn)
        : country.nameEn;
  }

  const state = this.allStates.find(
    (s: any) => String(s._id) === String(this.selectedStateId)
  );

  if (state) {
    this.stateSearch =
      lang === 'ta'
        ? (state.nameTa || state.nameEn)
        : state.nameEn;
  }

  const city = this.allCities.find(
    (c: any) => String(c._id) === String(this.selectedCityId)
  );

  if (city) {
    this.citySearch =
      lang === 'ta'
        ? (city.nameTa || city.nameEn)
        : city.nameEn;
  }
}
toTitleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ');
}

setEnglishFromTanglish(
  field: 'fullName' | 'fatherName' | 'motherName',
  event: any
): void {
  if (!this.isAdminBiodataMode()) return;

  const value = event.target.value || '';
  (this.formData as any)[field] = this.toTitleCase(value);
}


captureEnglishName(
  field: 'fullName' | 'fatherName' | 'motherName',
  event: KeyboardEvent
): void {
  if (!this.isAdminBiodataMode()) return;

  const input = event.target as HTMLInputElement;
  let value = input.value;

  if (event.key.length === 1) {
    value += event.key;
  }

  if (event.key === 'Backspace') {
    value = value.slice(0, -1);
  }

  (this.formData as any)[field] = value.toUpperCase();
}

tamilKeypress(event: KeyboardEvent): void {
  const convertThis = (window as any).convertThis;

  if (typeof convertThis !== 'function') return;

  convertThis(event);

  setTimeout(() => {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    this.cdr.detectChanges();
  }, 0);
}
onTamilInputChange(
  field: keyof typeof this.formDataTa,
  value: string
): void {
  this.formDataTa[field] = value;
}
async prepareTamilValues(): Promise<void> {
  this.cdr.detectChanges();
}
getTamilEducationName(value: string): string {

  if (!value) return '';

  const edu = this.educationList.find(
    (e: any) => e.education_name === value
  );

  return edu?.education_name_ta || value;

}

async prepareEnglishValues(): Promise<void> {

const convert = async (taValue: string, enValue: string) => {
  return enValue || '';
};

  // this.formData.fullName =
  // this.formDataTa.fullName || this.formData.fullName;
  // this.formData.fatherName = await convert(this.formDataTa.fatherName, this.formData.fatherName);
  // this.formData.motherName = await convert(this.formDataTa.motherName, this.formData.motherName);
  this.formData.fatherOccupation = await convert(this.formDataTa.fatherOccupation, this.formData.fatherOccupation);
  this.formData.motherOccupation = await convert(this.formDataTa.motherOccupation, this.formData.motherOccupation);
  this.formData.siblings = await convert(this.formDataTa.siblings, this.formData.siblings);


this.formData.job =
  await convert(
    this.formDataTa.job,
    this.formData.job
  );
  // this.formData.job = await convert(this.formDataTa.job, this.formData.job);
  this.formData.company = await convert(this.formDataTa.company, this.formData.company);
  this.formData.workPlace =
  await convert(this.formDataTa.workPlace, this.formData.workPlace);
 if (this.currentLang === 'ta' && this.isAdminBiodataMode()) {
  this.formData.address = this.formDataTa.address || this.formData.address;
}
  this.formData.birthPlace = await convert(this.formDataTa.birthPlace, this.formData.birthPlace);
  this.formData.aboutMe = await convert(this.formDataTa.aboutMe, this.formData.aboutMe);
  this.formData.partnerExpectation = await convert(this.formDataTa.partnerExpectation, this.formData.partnerExpectation);
this.formData.salary = await convert(this.formDataTa.salary, this.formData.salary);

this.formData.gothram = await convert(this.formDataTa.gothram, this.formData.gothram);
this.formData.subCaste =
  await convert(
    this.formDataTa.subCaste,
    this.formData.subCaste
  );

this.formData.handicapDetails =
  await convert(
    this.formDataTa.handicapDetails,
    this.formData.handicapDetails
  );
this.formData.childrenDetails =
  await convert(
    this.formDataTa.childrenDetails,
    this.formData.childrenDetails
  );
this.formData.thisai =
  await convert(
    this.formDataTa.thisai,
    this.formData.thisai
  );

this.formData.thisaiIruppu =
  await convert(
    this.formDataTa.thisaiIruppu,
    this.formData.thisaiIruppu
  );

this.formData.paatham =
  await convert(
    this.formDataTa.paatham,
    this.formData.paatham
  );

this.formData.sothukal =
  await convert(
    this.formDataTa.sothukal,
    this.formData.sothukal
  );

this.formData.poorvegam =
  await convert(
    this.formDataTa.poorvegam,
    this.formData.poorvegam
  );

this.formData.iruppidam =
  await convert(
    this.formDataTa.iruppidam,
    this.formData.iruppidam
  );

this.formData.kuladeivam =
  await convert(
    this.formDataTa.kuladeivam,
    this.formData.kuladeivam
  );
  this.formData.kudumbaNilai =
  await convert(
    this.formDataTa.kudumbaNilai,
    this.formData.kudumbaNilai
  );
  this.formData.kalappuThirumanamDetails =
  await convert(
    this.formDataTa.kalappuThirumanamDetails,
    this.formData.kalappuThirumanamDetails
  );
  this.poorvegamSearch =
  this.formData.poorvegam || this.formDataTa.poorvegam;

this.iruppidamSearch =
  this.formData.iruppidam || this.formDataTa.iruppidam;
}
async onLanguageSwitch(lang: 'en' | 'ta'): Promise<void> {
  if (lang === 'en') {
    await this.prepareEnglishValues();
  }

  if (lang === 'ta') {
    await this.prepareAutoTamilValues();
  }

  this.app.currentLang = lang;

  this.updateLocationSearchText(lang);

  this.cdr.detectChanges();
}
async prepareAutoTamilValues(): Promise<void> {
  const convert = async (enValue: string, taValue: string) => {
    if (taValue && taValue.trim()) return taValue;
    if (!enValue || !enValue.trim()) return '';
    // Existing admins keep their legacy handling. User-entered English prose
    // is NOT a Tamil translation, so do not pretend it is one.
    return this.isAdminBiodataMode() ? enValue : '';
  };

  if (!this.isAdminBiodataMode() && !this.formDataTa.fullName?.trim()) {
    // Known-name offline suggestion only. Unknown spellings need the member's review.
    const suggestion = suggestBilingualName(this.formData.fullName || '');
    this.formDataTa.fullName = hasTamilScript(suggestion.ta) ? suggestion.ta : '';
    this.nameNeedsReview = !!this.formData.fullName && !this.formDataTa.fullName;
  } else if (this.isAdminBiodataMode()) {
    this.formDataTa.fullName = await convert(this.formData.fullName, this.formDataTa.fullName);
  }
  this.formDataTa.fatherName = await convert(this.formData.fatherName, this.formDataTa.fatherName);
  this.formDataTa.motherName = await convert(this.formData.motherName, this.formDataTa.motherName);
  this.formDataTa.fatherOccupation = await convert(this.formData.fatherOccupation, this.formDataTa.fatherOccupation);
  this.formDataTa.motherOccupation = await convert(this.formData.motherOccupation, this.formDataTa.motherOccupation);
  this.formDataTa.siblings = await convert(this.formData.siblings, this.formDataTa.siblings);

  this.formDataTa.job = await convert(this.formData.job, this.formDataTa.job);
  this.formDataTa.company = await convert(this.formData.company, this.formDataTa.company);
  this.formDataTa.workPlace =
  await convert(this.formData.workPlace, this.formDataTa.workPlace);
  this.formDataTa.address = await convert(this.formData.address, this.formDataTa.address);
  this.formDataTa.birthPlace = await convert(this.formData.birthPlace, this.formDataTa.birthPlace);
  this.formDataTa.aboutMe = await convert(this.formData.aboutMe, this.formDataTa.aboutMe);
  this.formDataTa.partnerExpectation = await convert(this.formData.partnerExpectation, this.formDataTa.partnerExpectation);
  this.formDataTa.salary = await convert(this.formData.salary, this.formDataTa.salary);

this.formDataTa.gothram = await convert(this.formData.gothram, this.formDataTa.gothram);
this.formDataTa.childrenDetails =
  await convert(this.formData.childrenDetails, this.formDataTa.childrenDetails);

this.formDataTa.handicapDetails =
  await convert(this.formData.handicapDetails, this.formDataTa.handicapDetails);

this.formDataTa.subCaste =
  await convert(this.formData.subCaste, this.formDataTa.subCaste);

this.formDataTa.kuladeivam =
  await convert(this.formData.kuladeivam, this.formDataTa.kuladeivam);

this.formDataTa.sothukal =
  await convert(this.formData.sothukal, this.formDataTa.sothukal);
this.formDataTa.kudumbaNilai =
  await convert(
    this.formData.kudumbaNilai,
    this.formDataTa.kudumbaNilai
  );
  this.formDataTa.kalappuThirumanamDetails =
  await convert(
    this.formData.kalappuThirumanamDetails,
    this.formDataTa.kalappuThirumanamDetails
  );
  this.poorvegamSearch =
  this.formDataTa.poorvegam || this.formData.poorvegam;

this.iruppidamSearch =
  this.formDataTa.iruppidam || this.formData.iruppidam;
}
async onFullNameChange(value: string) {
  this.formData.fullName = value;

  if (this.isAdminBiodataMode()) return;

  if (this.formData.nameTaManuallyEdited) return;

  clearTimeout(this.nameTranslateTimer);

  this.nameTranslateTimer = setTimeout(async () => {
    this.formDataTa.fullName = await this.googleTamilInput(value);
    this.cdr.detectChanges();
  }, 400);
}
async googleTamilInput(text: string): Promise<string> {
  if (!text || !text.trim()) return '';

  try {
    const url =
      'https://inputtools.google.com/request' +
      '?text=' + encodeURIComponent(text) +
      '&itc=ta-t-i0-und' +
      '&num=1';

    const response = await fetch(url);
    const data = await response.json();

    return data?.[1]?.[0]?.[1]?.[0] || text;
  } catch (error) {
    return text;
  }
}
async googleEnglishInput(text: string): Promise<string> {
  return text || '';
}

tamilToEnglishName(value: string): string {
  if (!value || !value.trim()) return '';

  const vowels: Record<string, string> = {
    'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ee',
    'உ': 'u', 'ஊ': 'oo', 'எ': 'e', 'ஏ': 'e',
    'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'o', 'ஔ': 'au'
  };

  const consonants: Record<string, string> = {
    'க்': 'k', 'ங்': 'ng', 'ச்': 'ch', 'ஞ்': 'nj',
    'ட்': 't', 'ண்': 'n', 'த்': 'th', 'ந்': 'n',
    'ப்': 'p', 'ம்': 'm', 'ய்': 'y', 'ர்': 'r',
    'ல்': 'l', 'வ்': 'v', 'ழ்': 'zh', 'ள்': 'l',
    'ற்': 'r', 'ன்': 'n',

    'க': 'ka', 'ங': 'nga', 'ச': 'sa', 'ஞ': 'nja',
    'ட': 'ta', 'ண': 'na', 'த': 'tha', 'ந': 'na',
    'ப': 'pa', 'ம': 'ma', 'ய': 'ya', 'ர': 'ra',
    'ல': 'la', 'வ': 'va', 'ழ': 'zha', 'ள': 'la',
    'ற': 'ra', 'ன': 'na',

    'ஜ': 'ja', 'ஷ': 'sha', 'ஸ': 'sa', 'ஹ': 'ha'
  };

  const signs: Record<string, string> = {
    'ா': 'a', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'oo',
    'ெ': 'e', 'ே': 'e', 'ை': 'ai', 'ொ': 'o', 'ோ': 'o',
    'ௌ': 'au', '்': ''
  };

  const base: Record<string, string> = {
    'க': 'k', 'ங': 'ng', 'ச': 'ch', 'ஞ': 'nj',
    'ட': 't', 'ண': 'n', 'த': 'th', 'ந': 'n',
    'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r',
    'ல': 'l', 'வ': 'v', 'ழ': 'zh', 'ள': 'l',
    'ற': 'r', 'ன': 'n',
    'ஜ': 'j', 'ஷ': 'sh', 'ஸ': 's', 'ஹ': 'h'
  };

  const convertWord = (word: string): string => {
    let out = '';

    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const next = word[i + 1];

      if (vowels[ch]) {
        out += vowels[ch];
        continue;
      }

      if (base[ch]) {
        if (next && signs[next] !== undefined) {
          out += base[ch] + signs[next];
          i++;
        } else {
          out += consonants[ch] || base[ch];
        }
        continue;
      }

      out += ch;
    }

    return out;
  };

  return value
    .trim()
    .split(/\s+/)
    .map(word => this.toTitleCase(convertWord(word)))
    .join(' ');
}

async transliterateTamilName(value: string): Promise<string> {
  if (!value || !value.trim()) {
    return '';
  }

  return await this.googleTamilInput(value);
}

onTamilNameInput(event: Event) {
  setTimeout(() => {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    this.formDataTa.fullName = value;

    clearTimeout(this.nameTranslateTimer);

    this.nameTranslateTimer = setTimeout(() => {
      this.formData.fullName = this.tamilToEnglishName(value);
      this.cdr.detectChanges();
    }, 100);
  }, 0);
}

onTamilNameChange(value: string) {
  this.formDataTa.fullName = value;
  this.formData.nameTaManuallyEdited = true;

  if (!this.isAdminBiodataMode()) return;

  clearTimeout(this.nameTranslateTimer);

  this.nameTranslateTimer = setTimeout(() => {
    this.formData.fullName = this.tamilToEnglishName(value);
    this.cdr.detectChanges();
  }, 300);
}

async onFatherNameChange(value: string) {
  this.formData.fatherName = value;

  if (this.isAdminBiodataMode()) return;

  if (this.formData.fatherNameTaManuallyEdited) return;

  clearTimeout(this.fatherNameTranslateTimer);

  this.fatherNameTranslateTimer = setTimeout(async () => {
    this.formDataTa.fatherName = await this.googleTamilInput(value);
    this.cdr.detectChanges();
  }, 400);
}

onTamilFatherNameInput(event: Event) {
  setTimeout(() => {
    const value = (event.target as HTMLInputElement).value;
    this.onTamilFatherNameChange(value);
  }, 0);
}

onTamilFatherNameChange(value: string) {
  this.formDataTa.fatherName = value;
  this.formData.fatherNameTaManuallyEdited = true;

  if (!this.isAdminBiodataMode()) return;

  clearTimeout(this.fatherNameTranslateTimer);

  this.fatherNameTranslateTimer = setTimeout(() => {
    this.formData.fatherName = this.tamilToEnglishName(value);
    this.cdr.detectChanges();
  }, 300);
}



async onMotherNameChange(value: string) {
  this.formData.motherName = value;

  if (this.isAdminBiodataMode()) return;

  if (this.formData.motherNameTaManuallyEdited) return;

  clearTimeout(this.motherNameTranslateTimer);

  this.motherNameTranslateTimer = setTimeout(async () => {
    this.formDataTa.motherName = await this.googleTamilInput(value);
    this.cdr.detectChanges();
  }, 400);
}
onTamilMotherNameInput(event: Event) {
  setTimeout(() => {
    const value = (event.target as HTMLInputElement).value;
    this.onTamilMotherNameChange(value);
  }, 0);
}

onTamilMotherNameChange(value: string) {
  this.formDataTa.motherName = value;
  this.formData.motherNameTaManuallyEdited = true;

  if (!this.isAdminBiodataMode()) return;

  clearTimeout(this.motherNameTranslateTimer);

  this.motherNameTranslateTimer = setTimeout(() => {
    this.formData.motherName = this.tamilToEnglishName(value);
    this.cdr.detectChanges();
  }, 300);
}

onChartInput(
  type: 'rasi' | 'amsam',
  index: number,
  event: Event
): void {

  const input = event.target as HTMLTextAreaElement;
  let value = input.value.trim();

  if (!value) {
    input.value = '';
    type === 'rasi'
      ? this.rasiChart[index] = ''
      : this.amsamChart[index] = '';
    return;
  }

  const tamilToNumber = Object.entries(this.planetShortMap)
    .sort((a, b) => b[1].length - a[1].length);

  tamilToNumber.forEach(([num, tamil]) => {
    value = value.replaceAll(tamil, num);
  });

  value = value.replace(/[^0-9/]/g, '');

  const finalValue = value
    .split('/')
    .map(v => v.trim())
    .map(num => num ? (this.planetShortMap[num] || num) : '')
    .join('/');

  input.value = finalValue;

  type === 'rasi'
    ? this.rasiChart[index] = finalValue
    : this.amsamChart[index] = finalValue;
}
onChartKeydown(
  type: 'rasi' | 'amsam',
  index: number,
  event: KeyboardEvent
): void {

  if (event.key !== 'Backspace' && event.key !== 'Delete') {
    return;
  }

  const input = event.target as HTMLTextAreaElement;
  const value = input.value;

  const start = input.selectionStart ?? value.length;
  const end = input.selectionEnd ?? value.length;

  // only handle normal single-cursor delete
  if (start !== end) return;

  const planetValues = Object.values(this.planetShortMap)
    .sort((a, b) => b.length - a.length);

  // BACKSPACE: delete full planet before cursor
  if (event.key === 'Backspace') {
    const beforeCursor = value.substring(0, start);

    const matched = planetValues.find(p => beforeCursor.endsWith(p));

    if (matched) {
      event.preventDefault();

      const newValue =
        value.substring(0, start - matched.length) +
        value.substring(start);

      input.value = newValue;

      if (type === 'rasi') this.rasiChart[index] = newValue;
      else this.amsamChart[index] = newValue;
    }
  }

  // DELETE: delete full planet after cursor
  if (event.key === 'Delete') {
    const afterCursor = value.substring(start);

    const matched = planetValues.find(p => afterCursor.startsWith(p));

    if (matched) {
      event.preventDefault();

      const newValue =
        value.substring(0, start) +
        value.substring(start + matched.length);

      input.value = newValue;

      if (type === 'rasi') this.rasiChart[index] = newValue;
      else this.amsamChart[index] = newValue;
    }
  }
}
  getPlanetShort(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return this.planetShortMap[String(value)] || '';
  }

  private safeText(value: any): string {
    return value && String(value).trim() !== '' ? String(value).trim() : '';
  }

  private safeNumber(value: any): number | null {
    if (!value || String(value).trim() === '') return null;
    const cleaned = String(value).replace(/[^0-9.]/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  private buildLocationQuery(): string {
    return [
      this.safeText(this.formData.address),
      this.safeText(this.formData.city),
      this.safeText(this.formData.state),
      this.safeText(this.formData.country)
    ]
      .filter((v) => v !== '')
      .join(', ');
  }

  private async getLatLngFromLocation(): Promise<{ lat: number | null; lng: number | null }> {
    const query = this.buildLocationQuery();

    if (!query) {
      return { lat: null, lng: null };
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        {
          headers: {
            Accept: 'application/json'
          }
        }
      );

      if (!response.ok) {
       
        return { lat: null, lng: null };
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const lat = Number(data[0]?.lat);
        const lng = Number(data[0]?.lon);

        return {
          lat: Number.isFinite(lat) ? lat : null,
          lng: Number.isFinite(lng) ? lng : null
        };
      }
    } catch (error) {
      
    }

    return { lat: null, lng: null };
  }
async loadRasiList(): Promise<void> {
  try {
    const res = await firstValueFrom(this.masterService.getRasis());
    this.rasiDbList = res.data || [];
  } catch {
    this.rasiDbList = [];
  }
}

async loadNakshatraList(): Promise<void> {
  try {
    const res = await firstValueFrom(this.masterService.getNakshatras());
    this.nakshatraDbList = res.data || [];
  } catch {
    this.nakshatraDbList = [];
  }
}

async loadLagnamList(): Promise<void> {
  try {
    const res = await firstValueFrom(this.masterService.getLagnams());
    this.lagnamDbList = res.data || [];
  } catch {
    this.lagnamDbList = [];
  }
}
async ngOnInit(): Promise<void> {

const editId = this.route.snapshot.queryParamMap.get('id');

if (editId && editId !== 'new') {
  this.isEditMode = true;
  this.editProfileId = editId;
}
  if (this.isBrowser) {
    (window as any).activeBiodataComponent = this;

    const adminCreatedUserId =
      localStorage.getItem('admin_created_user_id');

   const isAdminCreatePage =
  this.route.snapshot.queryParamMap.get('adminCreate') === 'true';

if (isAdminCreatePage) {

  if (!editId) {
    this.currentUserId = adminCreatedUserId || null;
  }

  this.isAdminCreated = true;

}
  }

await this.loadGenders();
await this.loadReligions();
await this.loadMaritalStatuses();
await this.loadColors();
await this.loadKudumbaNilai();
await this.loadSecondMarriageReasons();

await this.loadThisaiIruppu();
  await this.loadCastes();
  await this.loadCountries();
  await this.loadStates();
  await this.loadCities();

await this.loadDhoshamList();
await this.loadRasiList();
await this.loadNakshatraList();
await this.loadLagnamList();
  await this.loadExistingBiodata();


  if (this.currentLang === 'ta') {
    await this.prepareTamilValues();
  }
//   setTimeout(() => {
//   this.loadGoogleTamilTyping();
// }, 1000);
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
isRegisterFieldLocked(field: string): boolean {

  if (this.isAdminBiodataMode()) {
    return false;
  }

  const loggedInUser = this.getStoredLoggedInUser();

  if (!loggedInUser) {
    return false;
  }

  const lockedFields = [
    'fullName',
    'mobile',
    'email',
    'dob',
    'age',
    'gender',
    'religion',
    'location'
  ];

  return lockedFields.includes(field);
}
  private getAdminCreatedUserId(): string {
  if (!this.isBrowser) return '';
  return localStorage.getItem('admin_created_user_id') || '';
}
private async resolveCurrentUserId(): Promise<string | null> {
  if (this.currentUserId) {
    return this.currentUserId;
  }

  if (!this.isBrowser) {
    return null;
  }

  const token =
    localStorage.getItem('auth_token') ||
    localStorage.getItem('admin_token');

  if (!token) {
    return null;
  }

  const loggedInUser = this.getStoredLoggedInUser();

  return (
    loggedInUser?._id ||
    loggedInUser?.id ||
    loggedInUser?.userId ||
    loggedInUser?.user_id ||
    localStorage.getItem('user_id') ||
    localStorage.getItem('app_user_id') ||
    'mongo-user'
  );
}

async loadExistingBiodata(): Promise<void> {
  this.isLoadingProfile = true;

  if (this.isAdminCreated && !this.editProfileId) {
    this.isLoadingProfile = false;
    return;
  }

  try {
    let res: any;

    if (this.editProfileId) {
      res = await firstValueFrom(
        this.api.getAdminProfileById(this.editProfileId)
      );
    } else {
      res = await firstValueFrom(
        this.api.getMyProfile()
      );
    }

const data = res?.data;

if (!data) {
  const user = this.getStoredLoggedInUser();

  if (user) {
    this.formData.fullName = user.fullName || user.name || '';
    this.formData.mobile = user.mobile || '';
    this.formData.email = user.email || '';
    this.formData.gender = user.gender || '';
    this.formData.dob = user.dob || '';
    this.formData.age = user.age ? String(user.age) : '';
    this.formData.religion = user.religion || '';
const religion = this.religionList.find(
  (r: any) =>
    String(r.nameEn).trim().toLowerCase() ===
      String(user.religion).trim().toLowerCase() ||
    String(r.nameTa).trim() ===
      String(user.religion).trim()
);

if (religion) {
  this.selectedReligionId = religion._id;
  this.formData.religion = religion.nameEn;

  setTimeout(() => {
    this.onReligionChange();
    this.cdr.detectChanges();
  }, 0);
}
    this.formData.address = user.location || '';
    this.formData.city = user.location || '';

    if (this.formData.dob) {
      this.onDobChange();
    }
  }

  this.isLoadingProfile = false;
  return;
}

    this.isEditMode = true;

    this.formData.fullName =
  data.basic?.fullName?.en ||
  data.full_name ||
  '';

this.formDataTa.fullName =
  data.basic?.fullName?.ta ||
  data.full_name_ta ||
  '';

this.formData.gender = data.basic?.gender || '';
this.formData.dob = data.basic?.dob || '';
this.formData.age = String(data.basic?.age || '');
this.formData.mobile = data.basic?.mobile || '';
this.formData.email = data.basic?.email || '';
this.formData.birthTime = data.basic?.birthTime || '';
this.formData.additionalMobile =
  data.basic?.additionalMobile?.length
    ? data.basic.additionalMobile
    : [''];
    this.selectedReligionId =
  data.religion?.religionId?._id ||
  data.religion?.religionId ||
  '';

if (this.selectedReligionId) {
  this.onReligionChange();
}

this.formData.religion = data.religion?.religion || '';

this.formData.caste = data.religion?.caste || '';
this.formData.otherCaste = '';
this.casteSearch = this.formData.caste;

this.formData.noCastePreference =
  data.religion?.noCastePreference || false;

this.formData.subCaste = data.religion?.subCaste?.en || '';
this.formDataTa.subCaste = data.religion?.subCaste?.ta || '';

this.formData.gothram = data.religion?.gothram?.en || '';
this.formDataTa.gothram = data.religion?.gothram?.ta || '';

this.formData.fatherName = data.family?.fatherName?.en || '';
this.formDataTa.fatherName = data.family?.fatherName?.ta || '';

this.formData.motherName = data.family?.motherName?.en || '';
this.formDataTa.motherName = data.family?.motherName?.ta || '';

this.formData.fatherOccupation = data.family?.fatherOccupation?.en || '';
this.formDataTa.fatherOccupation = data.family?.fatherOccupation?.ta || '';

this.formData.motherOccupation = data.family?.motherOccupation?.en || '';
this.formDataTa.motherOccupation = data.family?.motherOccupation?.ta || '';

this.formData.marriedBrothers = data.family?.marriedBrothers || 0;
this.formData.unmarriedBrothers = data.family?.unmarriedBrothers || 0;
this.formData.marriedSisters = data.family?.marriedSisters || 0;
this.formData.unmarriedSisters = data.family?.unmarriedSisters || 0;

this.formData.kudumbaNilaiId = data.family?.kudumbaNilaiId || '';

this.formData.kudumbaNilai = data.family?.kudumbaNilai?.en || '';
this.formDataTa.kudumbaNilai = data.family?.kudumbaNilai?.ta || '';

this.formData.sothukal = data.family?.sothukal?.en || '';
this.formDataTa.sothukal = data.family?.sothukal?.ta || '';

this.formData.poorvegam = data.family?.poorvegam?.en || '';
this.formDataTa.poorvegam = data.family?.poorvegam?.ta || '';

this.formData.iruppidam = data.family?.iruppidam?.en || '';
this.formDataTa.iruppidam = data.family?.iruppidam?.ta || '';
this.poorvegamSearch =
  this.currentLang === 'ta'
    ? this.formDataTa.poorvegam
    : this.formData.poorvegam;

this.iruppidamSearch =
  this.currentLang === 'ta'
    ? this.formDataTa.iruppidam
    : this.formData.iruppidam;

    this.formData.kuladeivam = data.family?.kuladeivam?.en || '';
this.formDataTa.kuladeivam = data.family?.kuladeivam?.ta || '';

this.formDataTa.address =
  data.address?.address?.ta ||
  data.address?.addressTa ||
  '';
this.formData.country = data.address?.country || '';
this.formData.state = data.address?.state || '';
this.formData.city = data.address?.city || '';
this.countrySearch = this.formData.country;
this.stateSearch = this.formData.state;
this.citySearch = this.formData.city;
this.selectedCountryId =
  data.address?.countryId?._id ||
  data.address?.countryId ||
  '';

if (!this.selectedCountryId && this.formData.country) {
  const country = this.countryList.find(
    (x: any) => x.nameEn === this.formData.country || x.nameTa === this.formData.country
  );
  this.selectedCountryId = country?._id || '';
}

this.stateList = this.allStates.filter((s: any) => {
  const countryId = s.countryId?._id || s.countryId;
  return String(countryId) === String(this.selectedCountryId);
});

this.selectedStateId =
  data.address?.stateId?._id ||
  data.address?.stateId ||
  '';

if (this.formData.state) {
  const state = this.stateList.find(
    (x: any) => x.nameEn === this.formData.state || x.nameTa === this.formData.state
  );
  this.selectedStateId = state?._id || this.selectedStateId;
}

this.cityList = this.allCities.filter((c: any) => {
  const stateId = c.stateId?._id || c.stateId;
  return String(stateId) === String(this.selectedStateId);
});

this.selectedCityId =
  data.address?.cityId?._id ||
  data.address?.cityId ||
  '';

if (this.formData.city) {
  const city = this.cityList.find(
    (x: any) => x.nameEn === this.formData.city || x.nameTa === this.formData.city
  );
  this.selectedCityId = city?._id || this.selectedCityId;
}
const savedRasi =
  data.astrology?.rasiId?._id ||
  data.astrology?.rasiId ||
  '';

const matchedRasi = this.rasiDbList.find(
  (x: any) =>
    String(x._id) === String(savedRasi) ||
    String(x.nameEn).toLowerCase() === String(data.astrology?.rasi || '').toLowerCase() ||
    String(x.nameTa).toLowerCase() === String(data.astrology?.rasi || '').toLowerCase()
);

this.formData.rasi = matchedRasi?.nameEn || data.astrology?.rasi || '';
this.formData.nakshatra = data.astrology?.nakshatra || '';
this.formData.lagnam = data.astrology?.lagnam || '';
this.formData.dhosham = data.astrology?.dhosham || '';

this.formData.birthTime = data.basic?.birthTime || '';
this.formData.birthPlace = data.astrology?.birthPlace?.en || '';
this.formDataTa.birthPlace = data.astrology?.birthPlace?.ta || '';
this.formData.thisai = data.astrology?.thisai?.en || '';
this.formDataTa.thisai = data.astrology?.thisai?.ta || '';

this.formData.thisaiIruppu = data.astrology?.thisaiIruppu || '';
this.formData.thisaiYear = data.astrology?.thisaiYear || '';
this.formData.thisaiMonth = data.astrology?.thisaiMonth || '';
this.formData.thisaiDay = data.astrology?.thisaiDay || '';
this.formData.paatham = data.astrology?.paatham?.en || '';
this.formDataTa.paatham = data.astrology?.paatham?.ta || '';

this.formData.height = data.personal?.height || '';
this.formData.weight = data.personal?.weight || '';
const loadedColorId =
  typeof data.personal?.colorId === 'string'
    ? data.personal.colorId.trim()
    : data.personal?.colorId?._id || '';

this.formData.colorId = this.colorList.some(
  (color: any) => String(color._id) === String(loadedColorId)
)
  ? loadedColorId
  : '';
this.formData.maritalStatus = data.personal?.maritalStatus || '';
this.formData.secondMarriageReason = data.personal?.secondMarriageReason || '';
this.formData.childrenStatus = data.personal?.childrenStatus || 'No';
this.formData.handicapStatus = data.personal?.handicapStatus || 'No';
this.formData.kalappuThirumanam = data.personal?.kalappuThirumanam || 'No';

this.formData.childrenDetails = data.personal?.childrenDetails?.en || '';
this.formDataTa.childrenDetails = data.personal?.childrenDetails?.ta || '';

this.formData.handicapDetails = data.personal?.handicapDetails?.en || '';
this.formDataTa.handicapDetails = data.personal?.handicapDetails?.ta || '';

this.formData.kalappuThirumanamDetails =
  data.personal?.kalappuThirumanamDetails?.en || '';
this.formDataTa.kalappuThirumanamDetails =
  data.personal?.kalappuThirumanamDetails?.ta || '';

this.formData.address = data.address?.address?.en || '';
this.formDataTa.address = data.address?.address?.ta || '';

this.formData.education = data.educationCareer?.education || '';

this.formData.job = data.educationCareer?.job?.en || '';
this.formDataTa.job = data.educationCareer?.job?.ta || '';

this.formData.company = data.educationCareer?.company?.en || '';
this.formDataTa.company = data.educationCareer?.company?.ta || '';

this.formData.workPlace = data.educationCareer?.workPlace?.en || '';
this.formDataTa.workPlace = data.educationCareer?.workPlace?.ta || '';

this.formData.salary = data.educationCareer?.salary?.en || '';
this.formDataTa.salary = data.educationCareer?.salary?.ta || '';

this.formData.aboutMe = data.extras?.aboutMe?.en || '';
this.formDataTa.aboutMe = data.extras?.aboutMe?.ta || '';

this.formData.partnerExpectation = data.extras?.partnerExpectation?.en || '';
this.formDataTa.partnerExpectation = data.extras?.partnerExpectation?.ta || '';

this.rasiChart = data.astrology?.rasiChart?.length
  ? data.astrology.rasiChart
  : Array(12).fill('');

this.amsamChart = data.astrology?.amsamChart?.length
  ? data.astrology.amsamChart
  : Array(12).fill('');

this.existingProfileImageUrl = data.media?.profileImage || null;
this.existingVideoUrl = data.media?.video || null;
this.existingHoroscopeFileUrl = data.astrology?.horoscopeFile || null;

this.profilePreviewUrl = this.existingProfileImageUrl;
this.videoPreviewUrl = this.existingVideoUrl;
this.additionalImagePreviews = data.media?.gallery || [];

    if (this.formData.dob && !this.formData.age) {
      this.onDobChange();
    }

  } catch (error: any) {
    this.snackbar.error(
      error?.error?.message ||
      error?.message ||
      this.tr.alerts.profileLoadFailed
    );
  } finally {
    this.isLoadingProfile = false;
    this.cdr.detectChanges();
  }
}
async checkAdminDuplicate(): Promise<void> {
  console.log(
  'DUPLICATE CHECK',
  this.isAdminCreated,
  this.editProfileId,
  this.formData.mobile,
  this.formData.dob
);

  if (!this.isAdminCreated || this.editProfileId) {
    return;
  }

  const mobile = String(this.formData.mobile || '').trim();
  const dob = String(this.formData.dob || '').trim();

  if (!dob || !/^[6-9]\d{9}$/.test(mobile)) {
    this.duplicateProfileExists = false;
    return;
  }

  try {
    this.isCheckingDuplicate = true;

    const res: any = await firstValueFrom(
      this.api.checkAdminProfileExists(
        mobile,
        dob
      )
    );

    this.duplicateProfileExists =
      res?.exists === true;

 if (this.duplicateProfileExists) {
  this.snackbar.error(
    this.currentLang === 'ta'
      ? 'இந்த மொபைல் எண்ணில் ஏற்கனவே சுயவிவரம் உள்ளது'
      : 'Profile already exists with this mobile number'
  );
}

  } catch (error) {
    console.error(
      'Duplicate check error:',
      error
    );
  } finally {
    this.isCheckingDuplicate = false;
    this.cdr.detectChanges();
  }
}

  onDobChange(): void {
    // Normalize older DD-MM-YYYY entries before they reach the API.
    const legacy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(this.formData.dob || '');
    if (legacy) this.formData.dob = `${legacy[3]}-${legacy[2]}-${legacy[1]}`;
    if (!this.isValidDob(this.formData.dob)) {
      this.formData.age = '';
      return;
    }
    const [year, month, day] = this.formData.dob.split('-').map(Number);
    this.mobileDobText = `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month ||
        (today.getMonth() + 1 === month && today.getDate() < day)) age--;
    this.formData.age = String(Math.max(0, age));
  }

  onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedProfileImage = null;
      this.profilePreviewUrl = this.existingProfileImageUrl;
      return;
    }

    const file = input.files[0];
    this.selectedProfileImage = file;
    this.profilePreviewUrl = URL.createObjectURL(file);
  }

  removeProfileImage(): void {
    this.selectedProfileImage = null;
    this.profilePreviewUrl = null;
    this.existingProfileImageUrl = null;
  }

  onAdditionalImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);

    files.forEach((file) => {
      this.additionalImages.push(file);
      this.additionalImagePreviews.push(URL.createObjectURL(file));
    });

    input.value = '';
  }

  removeAdditionalImage(index: number): void {
    const preview = this.additionalImagePreviews[index];
    if (!preview) return;
    if (preview.startsWith('blob:')) {
      const fileIndex = this.additionalImagePreviews.slice(0, index).filter(url => url.startsWith('blob:')).length;
      this.additionalImages.splice(fileIndex, 1);
      URL.revokeObjectURL(preview);
    }
    this.additionalImagePreviews.splice(index, 1);
  }

  clearAdditionalImages(): void {
    this.additionalImages = [];
    this.additionalImagePreviews = [];
  }

  onVideoChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedVideo = null;
      this.videoPreviewUrl = this.existingVideoUrl;
      return;
    }

    const file = input.files[0];
    this.selectedVideo = file;
    this.videoPreviewUrl = URL.createObjectURL(file);
  }

  removeVideo(): void {
    this.selectedVideo = null;
    this.videoPreviewUrl = null;
    this.existingVideoUrl = null;
  }

  onHoroscopeFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedHoroscopeFile = null;
      this.horoscopePreviewUrl =
        this.existingHoroscopeFileUrl &&
        this.existingHoroscopeFileUrl.match(/\.(jpg|jpeg|png|webp)$/i)
          ? this.existingHoroscopeFileUrl
          : null;
      return;
    }

    const file = input.files[0];
    this.selectedHoroscopeFile = file;

    if (file.type.startsWith('image/')) {
      this.horoscopePreviewUrl = URL.createObjectURL(file);
    } else {
      this.horoscopePreviewUrl = null;
    }
  }

async extractHoroscopeData(): Promise<void> {
  if (!this.selectedHoroscopeFile) {
    this.snackbar.error(this.tr.alerts.uploadHoroscopeFirst);
    return;
  }

  this.isExtracting = true;

  try {
    const uploadData = new FormData();
    uploadData.append('file', this.selectedHoroscopeFile);

    const response = await fetch(`${environment.apiUrl}/horoscope/extract`, {
      method: 'POST',
      body: uploadData
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      this.snackbar.error(result.message || this.tr.alerts.horoscopeFailed);
      return;
    }

    const d = result.data || {};



if (Array.isArray(d.rasiChart) && d.rasiChart.length === 12) {
  this.rasiChart = d.rasiChart.map((x: any) => String(x || ''));
}

if (Array.isArray(d.amsamChart) && d.amsamChart.length === 12) {
  this.amsamChart = d.amsamChart.map((x: any) => String(x || ''));
}    

this.rasiChart = [...this.rasiChart];
this.amsamChart = [...this.amsamChart];
this.cdr.detectChanges();

    this.formDataTa.fullName = d.fullName || '';
    this.formData.fullName = d.fullName ? this.tamilToEnglishName(d.fullName) : this.formData.fullName;

    this.formData.gender = d.gender || this.formData.gender;
    this.formData.maritalStatus = d.maritalStatus || this.formData.maritalStatus;
 

this.formData.secondMarriageReason =
  d.secondMarriageReason || this.formData.secondMarriageReason;

this.formData.childrenStatus =
  d.childrenStatus || this.formData.childrenStatus;

this.formData.childrenDetails =
  d.childrenDetails || this.formData.childrenDetails;

this.formDataTa.childrenDetails =
  d.childrenDetails || this.formDataTa.childrenDetails;

    this.formData.dob = d.dob || this.formData.dob;
    this.onDobChange();

    this.formData.birthTime = d.birthTime || this.formData.birthTime;

    this.formData.mobile = d.mobile || this.formData.mobile;
    this.formData.additionalMobile =
      Array.isArray(d.additionalMobile) && d.additionalMobile.length
        ? d.additionalMobile
        : this.formData.additionalMobile;

    this.formData.religion = d.religion || this.formData.religion;

    const religion = this.religionList.find(
      (r: any) =>
        r.religion_name === d.religion ||
        r.religion_name_ta === d.religion
    );

    if (religion) {
      this.selectedReligionId = religion.religion_id;
      this.casteList = this.allCastes.filter(
        (c: any) => c.religion_id === this.selectedReligionId
      );
    }

    const extractedCaste = String(d.caste || '').trim();

    const matchedCaste = this.casteList.find(
      (c: any) =>
        String(c.caste_name || '').trim() === extractedCaste ||
        String(c.caste_name_ta || '').trim() === extractedCaste
    );

  if (matchedCaste) {
  this.formData.caste = matchedCaste.nameEn || matchedCaste.caste_name || extractedCaste;
} else if (extractedCaste) {
  this.formData.caste = extractedCaste;
  this.formData.otherCaste = '';
}

    this.formData.subCaste = d.subCaste || this.formData.subCaste;
    this.formDataTa.subCaste = d.subCaste || this.formDataTa.subCaste;

    this.formDataTa.fatherName = d.fatherName || '';
    this.formData.fatherName = d.fatherName ? this.tamilToEnglishName(d.fatherName) : this.formData.fatherName;

    this.formDataTa.motherName = d.motherName || '';
    this.formData.motherName = d.motherName ? this.tamilToEnglishName(d.motherName) : this.formData.motherName;

    this.formData.fatherOccupation = d.fatherOccupation || this.formData.fatherOccupation;
    this.formDataTa.fatherOccupation = d.fatherOccupation || this.formDataTa.fatherOccupation;

    this.formData.motherOccupation = d.motherOccupation || this.formData.motherOccupation;
    this.formDataTa.motherOccupation = d.motherOccupation || this.formDataTa.motherOccupation;

    this.formData.height = d.height || this.formData.height;
    this.formData.color = d.color || this.formData.color;

   const extractedEducation = String(d.education || '').trim();

const matchedEducation = this.educationList.find(
  (e: any) =>
    String(e.education_name || '').trim().toLowerCase() === extractedEducation.toLowerCase() ||
    String(e.education_name_ta || '').trim() === extractedEducation
);

if (matchedEducation) {
  this.formData.education = matchedEducation.education_name;
  this.formData.otherEducation = '';
} else if (extractedEducation) {
  this.formData.education = 'Other';
  this.formData.otherEducation = extractedEducation;
}
    this.formData.job = d.job || this.formData.job;
    this.formDataTa.job = d.job || this.formDataTa.job;

    this.formData.salary = d.salary || this.formData.salary;
    this.formDataTa.salary = d.salary || this.formDataTa.salary;

    this.formData.unmarriedBrothers = d.unmarriedBrothers || this.formData.unmarriedBrothers;
    this.formData.unmarriedSisters = d.unmarriedSisters || this.formData.unmarriedSisters;
    this.formData.marriedBrothers = d.marriedBrothers || this.formData.marriedBrothers;
    this.formData.marriedSisters = d.marriedSisters || this.formData.marriedSisters;

    this.formData.workPlace = d.workPlace || this.formData.workPlace;
    this.formDataTa.workPlace = d.workPlace || this.formDataTa.workPlace;

    this.formData.poorvegam = d.poorvegam || this.formData.poorvegam;
    this.formDataTa.poorvegam = d.poorvegam || this.formDataTa.poorvegam;
this.formData.thisai = d.thisai || this.formData.thisai;
this.formDataTa.thisai = d.thisai || this.formDataTa.thisai;

const thisaiIruppu = this.thisaiIruppuList.find(
(item:any)=>
String(item._id) === String(d.thisaiIruppuId)
);

this.selectedThisaiIruppuId =
  thisaiIruppu?._id || '';

this.formData.thisaiIruppu =
  thisaiIruppu?.nameEn || d.thisaiIruppu || '';

this.formDataTa.thisaiIruppu =
  thisaiIruppu?.nameTa || d.thisaiIruppu || '';

    this.poorvegamSearch = d.poorvegam || this.poorvegamSearch;

    this.formData.iruppidam = d.iruppidam || this.formData.iruppidam;
    this.formDataTa.iruppidam = d.iruppidam || this.formDataTa.iruppidam;
    this.iruppidamSearch = d.iruppidam || this.iruppidamSearch;

    this.formData.kuladeivam = d.kuladeivam || this.formData.kuladeivam;
    this.formDataTa.kuladeivam = d.kuladeivam || this.formDataTa.kuladeivam;

    this.formData.sothukal = d.sothukal || this.formData.sothukal;
    this.formDataTa.sothukal = d.sothukal || this.formDataTa.sothukal;

    this.formData.partnerExpectation = d.partnerExpectation || this.formData.partnerExpectation;
    this.formDataTa.partnerExpectation = d.partnerExpectation || this.formDataTa.partnerExpectation;

    this.formData.address = d.address || this.formData.address;
    this.formDataTa.address = d.address || this.formDataTa.address;

const rasi = this.rasiDbList.find(
  (x: any) => x.nameEn === d.rasi || x.nameTa === d.rasi
);

this.formData.rasi =
  rasi?.nameEn || d.rasi || this.formData.rasi;

const nakshatra = this.nakshatraDbList.find(
  (x: any) => x.nameEn === d.nakshatra || x.nameTa === d.nakshatra
);

this.formData.nakshatra =
  nakshatra?.nameEn || d.nakshatra || this.formData.nakshatra;

const lagnam = this.lagnamDbList.find(
  (x: any) => x.nameEn === d.lagnam || x.nameTa === d.lagnam
);

this.formData.lagnam =
  lagnam?.nameEn || d.lagnam || this.formData.lagnam;

    this.formData.paatham = d.paatham || this.formData.paatham;
    this.formDataTa.paatham = d.paatham || this.formDataTa.paatham;

    this.snackbar.success(this.tr.alerts.horoscopeFilled);
  } catch (error) {
    this.snackbar.error(this.tr.alerts.horoscopeFailed);
  } finally {
    this.isExtracting = false;
    this.cdr.detectChanges();
  }
}

  private getCompletionPercentage(): number {
    const completionFields = [
      this.formData.fullName,
      this.formData.gender,
      this.formData.dob,
      this.formData.mobile,
      this.formData.email,
      this.formData.religion,
      this.formData.caste,
      this.formData.education,
      this.formData.job,
      this.formData.city,
      this.formData.state,
      this.formData.country,
      this.formData.rasi,
      this.formData.nakshatra,
      this.formData.lagnam,
      this.formData.aboutMe,
      this.formData.partnerExpectation
    ];

    const filledCount = completionFields.filter(
      (value) => value && String(value).trim() !== ''
    ).length;

    return Math.round((filledCount / completionFields.length) * 100);
  }
private async uploadFile(file: File, folder: string): Promise<string | null> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res: any = await firstValueFrom(this.api.uploadFile(formData));
  return res?.url || res?.data?.url || null;
}

private uploadProfileImage(file: File) {
  return this.uploadFile(file, 'profiles');
}

private uploadVideo(file: File) {
  return this.uploadFile(file, 'videos');
}

private uploadHoroscope(file: File) {
  return this.uploadFile(file, 'horoscopes');
}

private async uploadAdditionalImages(): Promise<string[]> {
  const urls: string[] = [];

  for (const file of this.additionalImages) {
    const url = await this.uploadFile(file, 'additional-images');
    if (url) urls.push(url);
  }

  return urls;
}
isHinduReligion(): boolean {
  return String(this.formData.religion || '')
    .trim()
    .toLowerCase() === 'hindu';
}
private markRequiredErrors(): string | null {
  this.fieldErrors = {};

const v = (en: any, ta?: any) => {
  if (this.currentLang === 'ta') {
    return String(ta || '').trim();
  }

  return String(en || '').trim();
};

  const requiredFields: { key: string; label: string; value: any }[] = [
    { key: 'fullName', label: this.tr.labels.fullName, value: this.formData.fullName || this.formDataTa.fullName },
    { key: 'gender', label: this.tr.labels.gender, value: this.formData.gender },
    { key: 'dob', label: this.tr.labels.dob, value: this.isValidDob(this.formData.dob) ? this.formData.dob : '' },
    { key: 'maritalStatus', label: this.tr.labels.maritalStatus, value: this.formData.maritalStatus },
    { key: 'mobile', label: this.tr.labels.mobile, value: /^\d{10}$/.test(String(this.formData.mobile || '').trim()) ? this.formData.mobile : '' },
    { key: 'religion', label: this.tr.labels.religion, value: this.selectedReligionId },
    { key: 'caste', label: this.tr.labels.caste, value: this.formData.caste },
    { key: 'education', label: this.tr.labels.education, value: this.formData.education === 'Other' ? this.formData.otherEducation : this.formData.education },
    
    { key: 'address', label: this.tr.labels.address, value: this.formData.address || this.formDataTa.address },
{
  key: 'country',
  label: this.tr.labels.country,
  value: this.formData.country || this.countrySearch || this.selectedCountryId
},

{
  key: 'state',
  label: this.tr.labels.state,
  value: this.formData.state || this.stateSearch || this.selectedStateId
},

{
  key: 'city',
  label: this.tr.labels.city,
  value: this.formData.city || this.citySearch || this.selectedCityId
},

   
  ];
if (this.isHinduReligion()) {
  requiredFields.push(
    { key: 'rasi', label: this.tr.labels.rasi, value: this.formData.rasi },
    { key: 'nakshatra', label: this.tr.labels.nakshatra, value: this.formData.nakshatra }
  );
}
  for (const field of requiredFields) {
    if (!String(field.value || '').trim()) {
      this.fieldErrors[field.key] = true;
      this.cdr.detectChanges();
      return field.label;
    }
  }

  this.cdr.detectChanges();
  return null;
}
async onSubmit(): Promise<void> {
  if (this.isSaving || (!this.isAdminBiodataMode() && this.activeStep !== this.wizardSteps.length - 1)) return;


  this.submitted = true;
  this.fieldErrors = {};
// Do not erase loaded location values when the language changes or a search
// input is left empty. Canonical names are resolved from selected IDs below.
if (this.countrySearch.trim() && !this.selectedCountryId) this.formData.country = this.countrySearch.trim();
if (this.stateSearch.trim() && !this.selectedStateId) this.formData.state = this.stateSearch.trim();
if (this.citySearch.trim() && !this.selectedCityId) this.formData.city = this.citySearch.trim();

if (this.currentLang === 'ta') {
  this.formDataTa.poorvegam = this.poorvegamSearch.trim();
  this.formDataTa.iruppidam = this.iruppidamSearch.trim();

  // Preserve the previously entered English version, if any.
} else {
  this.formData.poorvegam = this.poorvegamSearch.trim();
  this.formData.iruppidam = this.iruppidamSearch.trim();

  // Preserve the previously entered Tamil version, if any.
}
 const missingField = this.markRequiredErrors();

if (missingField) {
  this.isSaving = false;

  this.snackbar.error(
    this.currentLang === 'ta'
      ? `${missingField} நிரப்பவும்`
      : `Please fill ${missingField}`
  );

  return;
}
const selectedCity = this.cityList.find(
  (x: any) => x._id === this.selectedCityId
);

 if (selectedCity) {
  this.formData.city = selectedCity?.nameEn || '';
}
const selectedGender = this.genderList.find(
  (x: any) => x.nameEn === this.formData.gender
);

const selectedMaritalStatus = this.maritalStatusList.find(
  (x: any) => x.nameEn === this.formData.maritalStatus
);
const selectedReligion = this.religionList.find(
  (x: any) => x._id === this.selectedReligionId
);

const enteredCaste = this.safeText(this.formData.caste);
const customCaste = this.safeText(this.formData.otherCaste);

const finalCaste =
  this.formData.caste === 'Other'
    ? customCaste
    : enteredCaste;

const selectedCaste = this.casteList.find(
  (x: any) =>
    String(x.nameEn || '').trim().toLowerCase() === enteredCaste.toLowerCase() ||
    String(x.nameTa || '').trim() === enteredCaste
);

const selectedCountry = this.countryList.find(
  (x: any) => x._id === this.selectedCountryId
);

const selectedState = this.stateList.find(
  (x: any) => x._id === this.selectedStateId
);

const selectedDhosham = this.dhoshamDbList.find(
  (x: any) => x.nameEn === this.formData.dhosham
);


const selectedRasi = this.rasiDbList.find(
  (x: any) => x.nameEn === this.formData.rasi
);

const selectedNakshatra = this.nakshatraDbList.find(
  (x: any) => x.nameEn === this.formData.nakshatra
);

const selectedLagnam = this.lagnamDbList.find(
  (x: any) => x.nameEn === this.formData.lagnam
);

const selectedColor = this.colorList.find(
  (x: any) => x._id === this.formData.colorId
);

const selectedKudumbaNilai = this.kudumbaNilaiList.find(
  (x: any) => x._id === this.formData.kudumbaNilaiId
);
this.isSaving = true;



if (!this.isAdminBiodataMode()) {
  await this.prepareEnglishValues();
}
   try {

        if (this.currentLang === 'en') {
          await this.prepareAutoTamilValues();
        }

let appUserId = this.currentUserId || '';
const profileImageUrl = this.selectedProfileImage
  ? await this.uploadProfileImage(this.selectedProfileImage)
  : this.existingProfileImageUrl;

const newGalleryUrls = this.additionalImages.length
  ? await this.uploadAdditionalImages()
  : [];

const existingGalleryUrls = this.additionalImagePreviews.filter(
  (url: string) => !url.startsWith('blob:')
);

const galleryUrls = [
  ...existingGalleryUrls,
  ...newGalleryUrls
];

const videoUrl = this.selectedVideo
  ? await this.uploadVideo(this.selectedVideo)
  : this.existingVideoUrl;

const horoscopeFileUrl = this.selectedHoroscopeFile
  ? await this.uploadHoroscope(this.selectedHoroscopeFile)
  : this.existingHoroscopeFileUrl;
const payload = {
  basic: {
    fullName: {
      en: this.safeText(this.formData.fullName),
      ta: this.safeText(this.formDataTa.fullName)
    },
    gender: this.safeText(this.formData.gender),
    dob: this.formData.dob || '',
    age: this.safeNumber(this.formData.age) || 0,
    birthTime: this.safeText(this.formData.birthTime),
    mobile: this.safeText(this.formData.mobile),
    additionalMobile: this.formData.additionalMobile
  .filter((x: string) => String(x || '').trim() !== ''),
    email: this.safeText(this.formData.email)
  },

  personal: {
    height: this.safeText(this.formData.height),
    weight: this.safeText(this.formData.weight),
    colorId: this.formData.colorId || null,
    color: selectedColor?.nameEn || '',
    maritalStatusId: selectedMaritalStatus?._id || null,
    maritalStatus: this.safeText(this.formData.maritalStatus),
    secondMarriageReason: this.safeText(this.formData.secondMarriageReason),
    childrenStatus: this.formData.childrenStatus || 'No',
    handicapStatus: this.formData.handicapStatus || 'No',
    kalappuThirumanam: this.formData.kalappuThirumanam || 'No',
childrenDetails: {
  en: this.safeText(this.formData.childrenDetails),
  ta: this.safeText(this.formDataTa.childrenDetails)
},
handicapDetails: {
  en: this.safeText(this.formData.handicapDetails),
  ta: this.safeText(this.formDataTa.handicapDetails)
},
kalappuThirumanamDetails: {
  en: this.safeText(this.formData.kalappuThirumanamDetails),
  ta: this.safeText(this.formDataTa.kalappuThirumanamDetails)
}
  },

  religion: {
    religionId: this.selectedReligionId || null,
    religion: selectedReligion?.nameEn || this.formData.religion,
casteId: this.formData.caste === 'Other' ? null : selectedCaste?._id || null,
caste: finalCaste,
otherCaste: this.formData.caste === 'Other' ? customCaste : '',
noCastePreference: this.formData.noCastePreference || false,
    subCaste: {
      en: this.safeText(this.formData.subCaste),
      ta: this.safeText(this.formDataTa.subCaste)
    },
    gothram: {
      en: this.safeText(this.formData.gothram),
      ta: this.safeText(this.formDataTa.gothram)
    }
  },

  family: {
    fatherName: {
      en: this.safeText(this.formData.fatherName),
      ta: this.safeText(this.formDataTa.fatherName)
    },
    motherName: {
      en: this.safeText(this.formData.motherName),
      ta: this.safeText(this.formDataTa.motherName)
    },
    fatherOccupation: {
      en: this.safeText(this.formData.fatherOccupation),
      ta: this.safeText(this.formDataTa.fatherOccupation)
    },
    motherOccupation: {
      en: this.safeText(this.formData.motherOccupation),
      ta: this.safeText(this.formDataTa.motherOccupation)
    },
    marriedBrothers: this.safeNumber(this.formData.marriedBrothers) || 0,
    unmarriedBrothers: this.safeNumber(this.formData.unmarriedBrothers) || 0,
    marriedSisters: this.safeNumber(this.formData.marriedSisters) || 0,
    unmarriedSisters: this.safeNumber(this.formData.unmarriedSisters) || 0,
kudumbaNilaiId: this.formData.kudumbaNilaiId || null,
kudumbaNilai: {
  en: selectedKudumbaNilai?.nameEn || '',
  ta: selectedKudumbaNilai?.nameTa || ''
},
sothukal: {
  en: this.safeText(this.formData.sothukal),
  ta: this.safeText(this.formDataTa.sothukal)
},
poorvegam: {
  en: this.safeText(this.formData.poorvegam),
  ta: this.safeText(this.formDataTa.poorvegam)
},
iruppidam: {
  en: this.safeText(this.formData.iruppidam),
  ta: this.safeText(this.formDataTa.iruppidam)
},
kuladeivam: {
  en: this.safeText(this.formData.kuladeivam),
  ta: this.safeText(this.formDataTa.kuladeivam)
}
  },

  educationCareer: {
    education: this.formData.education === 'Other'
      ? this.formData.otherEducation
      : this.formData.education,
    job: {
      en: this.formData.job === 'Other'
        ? this.formData.otherProfession
        : this.formData.job,
      ta: this.safeText(this.formDataTa.job)
    },
    company: {
      en: this.safeText(this.formData.company),
      ta: this.safeText(this.formDataTa.company)
    },
    workPlace: {
      en: this.safeText(this.formData.workPlace),
      ta: this.safeText(this.formDataTa.workPlace)
    },
    salary: {
      en: this.safeText(this.formData.salary),
      ta: this.safeText(this.formDataTa.salary)
    }
  },

address: {
  address: {
    en: this.safeText(this.formData.address),
    ta: this.safeText(this.formDataTa.address)
  },
  countryId: this.selectedCountryId || null,
  country: selectedCountry?.nameEn || this.formData.country,
  stateId: this.selectedStateId || null,
  state: selectedState?.nameEn || this.formData.state,
  cityId: this.selectedCityId || null,
  city: selectedCity?.nameEn || this.formData.city
},
  astrology: {
    horoscopeFile: horoscopeFileUrl,
    rasiId: selectedRasi?._id || null,
    rasi: this.safeText(this.formData.rasi),
    nakshatraId: selectedNakshatra?._id || null,
    nakshatra: this.safeText(this.formData.nakshatra),
    lagnamId: selectedLagnam?._id || null,
    lagnam: this.safeText(this.formData.lagnam),
    dhoshamId: selectedDhosham?._id || null,
    dhosham: this.safeText(this.formData.dhosham),
    birthPlace: {
      en: this.safeText(this.formData.birthPlace),
      ta: this.safeText(this.formDataTa.birthPlace)
    },
    thisai: {
  en: this.safeText(this.formData.thisai),
  ta: this.safeText(this.formDataTa.thisai)
},
thisaiIruppuId: this.selectedThisaiIruppuId || null,

thisaiIruppu: this.safeText(this.formData.thisaiIruppu),
thisaiYear: this.safeText(this.formData.thisaiYear),
thisaiMonth: this.safeText(this.formData.thisaiMonth),
thisaiDay: this.safeText(this.formData.thisaiDay),
paatham: {
  en: this.safeText(this.formData.paatham),
  ta: this.safeText(this.formDataTa.paatham)
},
    rasiChart: this.rasiChart,
    amsamChart: this.amsamChart
  },
media: {
  profileImage: profileImageUrl || '',
  gallery: galleryUrls || [],
  video: videoUrl || ''
},
  extras: {
    aboutMe: {
      en: this.safeText(this.formData.aboutMe),
      ta: this.safeText(this.formDataTa.aboutMe)
    },
    partnerExpectation: {
      en: this.safeText(this.formData.partnerExpectation),
      ta: this.safeText(this.formDataTa.partnerExpectation)
    }
  }
};

let response: any;

if (this.editProfileId) {
  response = await firstValueFrom(
    this.api.updateBiodataByAdmin(this.editProfileId, payload)
  );
} else if (this.isAdminCreated) {
  response = await firstValueFrom(
    this.api.createBiodataByAdmin(payload)
  );
} else {
  response = await firstValueFrom(
    this.api.updateBiodata(payload)
  );
}

this.snackbar.success('Biodata saved successfully');
// Submission changes the server-side approval flow. Never reuse an earlier
// status response from the short navigation cache.
this.auth.invalidateFlowStatus();
localStorage.removeItem(
  'biodata_pending'
);
this.isSubmitted = true;

if (this.isBrowser) {

  localStorage.setItem(
    'profile_status',
    'pending'
  );

  localStorage.setItem(
    'biodata_pending',
    'true'
  );

}

// Admin flow
if (this.isAdminCreated || this.editProfileId) {
  if (this.isBrowser) {
    localStorage.removeItem('admin_created_user_id');
  }

  await this.router.navigate(['/admin/profiles']);
  return;
}

// A completed Biodata must be reviewed by admin before matching or payment.
// Registration fees and full-detail memberships never precede this approval.
await this.flow.syncFromServer();
await this.router.navigate(['/approval-pending']);
    } catch (error: any) {
      
      this.snackbar.error(error?.message || 'Something went wrong while saving biodata');
    } finally {
  this.isSaving = false;
  this.cdr.detectChanges();
}
  }
async loadCastes(): Promise<void> {
  try {
    const res = await firstValueFrom(this.masterService.getCastes());
    this.allCastes = res.data || [];
  } catch (error) {
    this.allCastes = [];
  }
}
async loadColors() {
  try {
    const res = await firstValueFrom(this.masterService.getColors());
    this.colorList = res.data || [];
  } catch {
    this.colorList = [];
  }
}
async loadKudumbaNilai() {
  try {
    const res = await firstValueFrom(this.masterService.getKudumbaNilai());
    this.kudumbaNilaiList = res.data || [];
  } catch {
    this.kudumbaNilaiList = [];
  }
}
async loadSecondMarriageReasons(): Promise<void> {
  try {

    const res = await firstValueFrom(
      this.masterService.getSecondMarriageReasons()
    );

    this.secondMarriageReasonList = res.data || [];

  } catch(error) {

    console.error(
      "Second marriage reason load error",
      error
    );

    this.secondMarriageReasonList = [];

  }
}
onThisaiIruppuChange(): void {

  const selected = this.thisaiIruppuList.find(
    (item:any) => item._id === this.selectedThisaiIruppuId
  );

  if(selected){

    this.formData.thisaiIruppu = selected.nameEn;

    this.formDataTa.thisaiIruppu = selected.nameTa;

  } else {

    this.formData.thisaiIruppu = '';
    this.formDataTa.thisaiIruppu = '';

  }

}
async loadReligions(): Promise<void> {
  try {
    const res = await firstValueFrom(this.masterService.getReligions());
    this.religionList = res.data || [];
  } catch (error) {
    this.religionList = [];
  }
}
async loadMaritalStatuses(): Promise<void> {
  try {
    const res = await firstValueFrom(
      this.masterService.getMaritalStatuses()
    );

    this.maritalStatusList = res.data || [];
  } catch (error) {
    console.error(error);
    this.maritalStatusList = [];
  }
}
async loadGenders(): Promise<void> {
  try {
    const res = await firstValueFrom(this.masterService.getGenders());
    this.genderList = res.data || [];
  } catch (error) {
    console.error('Gender load error:', error);
    this.genderList = [];
  }
}
async loadThisaiIruppu(): Promise<void> {
  try {
    const res = await firstValueFrom(this.masterService.getThisaiIruppus());

    this.thisaiIruppuList = res.data || [];

    this.cdr.detectChanges();
  } catch {
    this.thisaiIruppuList = [];
  }
}
onReligionChange(): void {
  const selectedReligion = this.religionList.find(
    (r: any) => r._id === this.selectedReligionId
  );

  this.formData.religion = selectedReligion?.nameEn || '';
  this.formData.caste = '';

  this.casteList = this.allCastes.filter((c: any) => {
    const casteReligionId =
      typeof c.religionId === 'object'
        ? c.religionId?._id
        : c.religionId;

    return casteReligionId === this.selectedReligionId;
  });
  this.filteredCasteList = [...this.casteList];
this.casteSearch = '';
this.formData.caste = '';
this.formData.otherCaste = '';
this.cdr.detectChanges();
}
async loadCountries(): Promise<void> {
  try {
    const res = await firstValueFrom(this.masterService.getCountries());

    this.countryList = res.data || [];

    this.cdr.detectChanges();
  } catch (error) {
    this.countryList = [];
  }
}

async loadStates(): Promise<void> {
  try {
    const res = await firstValueFrom(this.masterService.getStates());

    this.allStates = res.data || [];

  } catch (error) {
    this.allStates = [];
  }
}

async loadCities(): Promise<void> {
  try {
    const res = await firstValueFrom(this.masterService.getCities());

    this.allCities = res.data || [];
    this.cityList = res.data || [];

    this.filteredPoorvegamList = [...this.allCities];
    this.filteredIruppidamList = [...this.allCities];

    this.cdr.detectChanges();
  } catch (error) {
    this.allCities = [];
    this.cityList = [];
    this.filteredPoorvegamList = [];
    this.filteredIruppidamList = [];
  }
}
onCountryChange(): void {
  const country = this.countryList.find(
    (c: any) => c._id === this.selectedCountryId
  );

  this.formData.country = country?.nameEn || '';
  this.formData.state = '';
  this.formData.city = '';

  this.selectedStateId = '';
  this.selectedCityId = '';

  if (this.isOtherCountrySelected()) {
    this.stateList = [];
    this.cityList = [];
    return;
  }

  this.stateList = this.allStates.filter((s: any) => {
    const countryId =
      typeof s.countryId === 'object'
        ? s.countryId?._id
        : s.countryId;

    return countryId === this.selectedCountryId;
  });

  this.cityList = [];
}
onStateChange(): void {
  const state = this.stateList.find(
    (s: any) => s._id === this.selectedStateId
  );

  this.formData.state = state?.nameEn || '';
  this.formData.city = '';

  this.selectedCityId = '';

  if (this.isOtherStateSelected()) {
    this.cityList = [];
    return;
  }

  this.cityList = this.allCities.filter((c: any) => {
    const stateId =
      typeof c.stateId === 'object'
        ? c.stateId?._id
        : c.stateId;

    return stateId === this.selectedStateId;
  });
}
async loadProfessionList() {
  try {
    const res = await firstValueFrom(this.masterService.getProfessions());
    this.professionList = res.data || [];
  } catch {
    this.professionList = [];
  }
}
async loadDhoshamList(): Promise<void> {
  try {
    const res = await firstValueFrom(this.masterService.getDhoshams());
    this.dhoshamDbList = res.data || [];
  } catch {
    this.dhoshamDbList = [];
  }
}
async loadEducationLevels() {
  try {
    const res = await firstValueFrom(this.masterService.getEducationLevels());
    this.educationList = res.data || [];
    this.filteredEducationList = [...this.educationList];
  } catch {
    this.educationList = [];
    this.filteredEducationList = [];
  }
}

onEducationSearchChange() {

  const term =
    this.educationSearch
      .toLowerCase()
      .trim();

  this.filteredEducationList =
    this.educationList.filter(
      (edu: any) =>
        String(edu.education_name || '')
          .toLowerCase()
          .includes(term)
    );

}
onEducationSelected() {
  this.formData.education = this.educationSearch.trim();
}

canShowAddEducationButton(): boolean {
  const name = this.educationSearch.trim().toLowerCase();

  if (!name) return false;

  return !this.educationList.some((edu: any) =>
    String(edu.education_name || '').trim().toLowerCase() === name
  );
}

async addEducationLevel() {
  const name = this.educationSearch.trim();

  if (!name) return;

  this.educationSearch = name;
  this.formData.education = name;
  this.filteredEducationList = [];
}
selectEducation(name: string) {
  this.educationSearch = name;
  this.formData.education = name;

  if (this.currentLang === 'ta') {
    const edu = this.educationList.find(
      (e: any) => e.education_name === name || e.education_name_ta === name
    );

    this.formData.education = edu?.education_name || name;
  }

  this.showEducationDropdown = false;
  this.filteredEducationList = [];
}
toggleEducationDropdown() {

  this.showEducationDropdown =
    !this.showEducationDropdown;

  if (this.showEducationDropdown) {

    this.educationSearch = '';

    this.filteredEducationList =
      [...this.educationList];

  }

}
trackByIndex(index: number): number {
  return index;
}
onPoorvegamSearchChange(): void {
  const search = this.poorvegamSearch.toLowerCase().trim();

  this.filteredPoorvegamList = this.allCities.filter((city: any) =>
    (city.nameEn || '').toLowerCase().includes(search) ||
    (city.nameTa || '').includes(this.poorvegamSearch)
  );

  this.showPoorvegamDropdown = true;
}

selectPoorvegam(city: any): void {
  if (city.nameEn === 'Other') {
    this.isOtherPoorvegam = true;
    this.poorvegamSearch = this.currentLang === 'ta' ? 'மற்றவை' : 'Other';
    this.formData.poorvegam = '';
    this.formDataTa.poorvegam = '';
  } else {
    this.isOtherPoorvegam = false;
    this.poorvegamSearch =
      this.currentLang === 'ta'
        ? (city.nameTa || city.nameEn)
        : city.nameEn;

    this.formData.poorvegam = city.nameEn;
    this.formDataTa.poorvegam = city.nameTa || city.nameEn;
  }

  this.showPoorvegamDropdown = false;
}

onIruppidamSearchChange(): void {
  const search = this.iruppidamSearch.toLowerCase().trim();

  this.filteredIruppidamList = this.allCities.filter((city: any) =>
    (city.nameEn || '').toLowerCase().includes(search) ||
    (city.nameTa || '').includes(this.iruppidamSearch)
  );

  this.showIruppidamDropdown = true;
}

selectIruppidam(city: any): void {
if (
  city.nameEn === 'Other' ||
  city.nameTa === 'மற்றவை'
) {
  this.isOtherIruppidam = true;

  this.iruppidamSearch = '';

  this.formData.iruppidam = '';
  this.formDataTa.iruppidam = '';

  this.showIruppidamDropdown = false;
  return;
}

this.isOtherIruppidam = false;

this.iruppidamSearch =
  this.currentLang === 'ta'
    ? (city.nameTa || city.nameEn)
    : city.nameEn;

this.formData.iruppidam = city.nameEn;
this.formDataTa.iruppidam =
  city.nameTa || city.nameEn;

this.showIruppidamDropdown = false;

}


}
