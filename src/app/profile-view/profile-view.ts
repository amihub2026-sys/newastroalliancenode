import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LanguageService } from '../core/services/language.service';
import { AstroService } from '../services/astro.service';
import { SnackbarService } from '../shared/snackbar.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { profileGalleryUrls, profileMediaUrl } from '../shared/profile-media';
import { PhotoLightbox } from '../shared/photo-lightbox/photo-lightbox';
import { publicDisplayValue, categoryKey } from '../shared/public-value-dictionary';
type LangText = {
  en: string;
  ta: string;
};

interface ProfileViewItem {
  id: string;
  profileImage: string;
  galleryImages: string[];
  videoUrl: string;

  fullName: LangText;
  gender: LangText;
  dob: string;
  age: number;
  maritalStatus: LangText;
childrenStatus: string;
childrenDetails: string;
kalappuThirumanam: string;
kalappuThirumanamDetails: LangText;
handicapStatus: string;
handicapDetails: LangText;
subCaste: LangText;
  mobile: string;
  additionalMobile: string;
  email: string;
  height: string;
  weight: string;
  religion: LangText;
  caste: LangText;

fatherName: LangText;
motherName: LangText;
fatherOccupation: LangText;
motherOccupation: LangText;
siblings: LangText;
marriedBrothers: string;
unmarriedBrothers: string;
marriedSisters: string;
unmarriedSisters: string;
kudumbaNilai: LangText;
poorvegam: LangText;
iruppidam: LangText;
  education: LangText;
  job: LangText;
  company: LangText;
  workPlace: LangText;
  salary: string;

  address: LangText;
  city: LangText;
  state: LangText;
  country: LangText;

  horoscopeImage: string;
  rasi: LangText;
  nakshatra: LangText;
  lagnam: LangText;
  gothram: LangText;
  dhosham: LangText;
  birthTime: string;
  birthPlace: LangText;
thisai: LangText;
thisaiIruppu: LangText;
paatham: LangText;
sothukal: LangText;
kuladeivam: LangText;
  about: LangText;
  partnerExpectation: LangText;
noCastePreference: boolean;
  rasiChart: string[];
  amsamChart: string[];
}

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, PhotoLightbox],
  templateUrl: './profile-view.html',
  styleUrls: ['./profile-view.scss']
})
export class ProfileView implements OnInit {
  app = inject(LanguageService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  astroService = inject(AstroService);
snackbar = inject(SnackbarService);
http = inject(HttpClient);
apiUrl = environment.apiUrl;
  unlocked = false;
  showHoroscope = false;
  selectedPlan = '';
  selectedProfileId = '';
  isLoading = false;
openFullPhoto = false;
get permittedPhotos(): string[] { return [this.profile?.profileImage, ...(this.profile?.galleryImages || [])].filter((x):x is string=>!!x); }
selectedPhotoUrl = '';
openGalleryPopup = false;
currentGalleryIndex = 0;
openVideoFull = false;
  profile: ProfileViewItem | null = null;
  astroMatch: any = null;
  loadedProfileRow: any = null;
alreadySent = false;
alreadyShortlisted = false;
interestStatus = '';
planetShortMap: Record<string, string> = {
    '1': 'வி',
    '2': 'கே',
    '3': 'ல',
    '4': 'செ',
    '5': 'பு',
    '6': 'சந்',
    '7': 'ரா',
    '8': 'ச',
    '9': 'சூ',
    '10': 'சுக்',
    '11': 'மா',
    '12': 'வ'
  };
openPhoto(photoUrl?: string) {
  const images = this.permittedPhotos;
  const chosen = photoUrl ? images.indexOf(photoUrl) : 0;
  this.currentGalleryIndex = Math.max(0, chosen);
  this.openGalleryPopup = false;
  this.openFullPhoto = images.length > 0;
}
closePhoto() {
  this.openFullPhoto = false;
  this.selectedPhotoUrl = '';
}
openAdditionalPhotos() {
  this.openGalleryPopup = true;
}

closeAdditionalPhotos() {
  this.openGalleryPopup = false;
}
openVideoPopup() {
  this.openVideoFull = true;
}

closeVideoPopup() {
  this.openVideoFull = false;
}
openPhotoFromGallery(photoUrl: string) {
  this.openPhoto(photoUrl);
}
showNextPhoto() {

  if (!this.profile?.galleryImages?.length) return;

  const images = this.profile.galleryImages;

  this.currentGalleryIndex =
    (this.currentGalleryIndex + 1) % images.length;

  this.selectedPhotoUrl =
    images[this.currentGalleryIndex];

  this.cdr.detectChanges();
}

showPrevPhoto() {

  if (!this.profile?.galleryImages?.length) return;

  const images = this.profile.galleryImages;

  this.currentGalleryIndex =
    (this.currentGalleryIndex - 1 + images.length) %
    images.length;

  this.selectedPhotoUrl =
    images[this.currentGalleryIndex];

  this.cdr.detectChanges();
}
  get currentLang(): 'en' | 'ta' {
    return this.app.currentLang;
  }

  async ngOnInit(): Promise<void> {
    const params = this.route.snapshot.queryParamMap;

    // URL query parameters must never grant access to premium details.
    this.unlocked = false;
   
    this.selectedPlan = params.get('selectedPlan') || '';
    this.selectedProfileId = (params.get('profileId') || '').trim();
    await this.loadProfile();
   if (typeof window !== 'undefined') {
  (window as any).activeProfileViewComponent = this;
}
  }

private asLangText(value: string | null | undefined): LangText {
  const text = value?.trim() || '';

  return {
    en: text,
    ta: text
  };
}

getPlanetShort(value: any): string {
    if (value === null || value === undefined || value === '') return '';

    const parts = String(value)
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);

    if (!parts.length) return '';

    return parts
      .map(v => this.planetShortMap[v] || v)
      .join(' ');
  }

  private formatHeight(row: any): string {
    if (row?.height_text) return row.height_text;
    if (row?.height_cm) return `${row.height_cm} cm`;
    return '';
  }

  private formatWeight(row: any): string {
    if (row?.weight_text) return row.weight_text;
    if (row?.weight_kg) return `${row.weight_kg} kg`;
    return '';
  }

  private formatSalary(row: any): string {
    if (row?.salary_text) return row.salary_text;
    if (row?.salary_amount) {
      return `${row.salary_currency || 'INR'} ${row.salary_amount}`;
    }
    return '';
  }

  private toChartArray(value: any): string[] {
    if (Array.isArray(value)) {
      return Array.from({ length: 12 }, (_, i) => String(value[i] ?? ''));
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return Array.from({ length: 12 }, (_, i) => String(parsed[i] ?? ''));
        }
      } catch {
        return Array(12).fill('');
      }
    }

    return Array(12).fill('');
  }

private normalizeGalleryImages(row: any): string[] {

  // additional_image_urls
  if (Array.isArray(row?.additional_image_urls)) {
    return row.additional_image_urls
      .filter((item: any) => !!item)
      .map((item: any) => String(item));
  }

  // additional_image_urls string JSON
  if (typeof row?.additional_image_urls === 'string') {
    try {
      const parsed = JSON.parse(row.additional_image_urls);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((item: any) => !!item)
          .map((item: any) => String(item));
      }
    } catch {}
  }

  // gallery_images
  if (Array.isArray(row?.gallery_images)) {
    return row.gallery_images
      .filter((item: any) => !!item)
      .map((item: any) => String(item));
  }

  // additional_images
  if (Array.isArray(row?.additional_images)) {
    return row.additional_images
      .filter((item: any) => !!item)
      .map((item: any) => String(item));
  }

  // image_urls
  if (Array.isArray(row?.image_urls)) {
    return row.image_urls
      .filter((item: any) => !!item)
      .map((item: any) => String(item));
  }

  // image_urls string JSON
  if (typeof row?.image_urls === 'string') {
    try {
      const parsed = JSON.parse(row.image_urls);

      if (Array.isArray(parsed)) {
        return parsed
          .filter((item: any) => !!item)
          .map((item: any) => String(item));
      }
    } catch {}
  }

  return [];
}

  private formatDateForApi(dateStr: string): string {
    const value = String(dateStr || '').trim();
    if (!value) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const slashParts = value.split('/');
    if (slashParts.length === 3) {
      const [dd, mm, yyyy] = slashParts.map(part => part.trim());
      if (yyyy && mm && dd) {
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      }
    }

    const dashParts = value.split('-');
    if (dashParts.length === 3) {
      const [dd, mm, yyyy] = dashParts.map(part => part.trim());
      if (yyyy && yyyy.length === 4 && mm && dd) {
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      }
    }

    return value;
  }

  private normalizePlaceForApi(value: string | null | undefined): string {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return '';
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  private normalizeTimeForApi(value: string | null | undefined): string {
    const text = String(value || '').trim();
    if (!text) return '';

    const parts = text.split(':');
    if (parts.length >= 2) {
      const hh = String(parts[0] || '').padStart(2, '0');
      const mm = String(parts[1] || '').padStart(2, '0');
      return `${hh}:${mm}`;
    }

    return text;
  }
private textValue(value: any): string {
  if (!value) return '';

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    return value.ta || value.en || '';
  }

  return '';
}
  private mapRowToProfile(row: any): ProfileViewItem {
    return {
      id: String(row.profile_code || row.user_id || row.profile_id || ''),
profileImage: profileMediaUrl(row.media?.profileImage || row.profile_image_url) || 'assets/default-avatar.png',
galleryImages: profileGalleryUrls(row.media?.gallery?.length ? row.media.gallery : this.normalizeGalleryImages(row)),
videoUrl: profileMediaUrl(row.media?.video || row.video_url),

      fullName: {
  en: row.basic?.fullName?.en || row.full_name || '',
  ta: row.basic?.fullName?.ta || row.full_name_ta || row.basic?.fullName?.en || ''
},
gender: {
  en: row.basic?.gender || row.gender_text || '',
  ta: (row.basic?.gender || row.gender_text) === 'Male'
    ? 'ஆண்'
    : (row.basic?.gender || row.gender_text) === 'Female'
      ? 'பெண்'
      : row.basic?.gender || row.gender_text || ''
},
dob: row.basic?.dob || row.dob || '',
age: Number(row.basic?.age || row.age || 0),
maritalStatus: {
  en: row.personal?.maritalStatus || row.marital_status_text || '',
  ta: row.personal?.maritalStatus || row.marital_status_text_ta || row.marital_status_text || ''
},
childrenStatus: row.personal?.childrenStatus ?? row.children_status ?? false,
childrenDetails:
  row.personal?.childrenDetails?.ta ||
  row.personal?.childrenDetails?.en ||
  row.children_details ||
  '',
kalappuThirumanam: row.personal?.kalappuThirumanam ?? row.kalappu_thirumanam ?? false,
kalappuThirumanamDetails: {
  en: row.personal?.kalappuThirumanamDetails?.en || row.kalappu_thirumanam_details || '',
  ta: row.personal?.kalappuThirumanamDetails?.ta || row.kalappu_thirumanam_details_ta || row.kalappu_thirumanam_details || ''
},
handicapStatus: row.personal?.handicapStatus ?? row.handicap_status ?? row.handicap ?? false,
handicapDetails: {
  en: row.personal?.handicapDetails?.en || row.handicap_details || '',
  ta: row.personal?.handicapDetails?.ta || row.handicap_details_ta || row.handicap_details || ''
},
subCaste: {
  en: this.textValue(row.religion?.subCaste),
  ta: this.textValue(row.religion?.subCaste)
},
height: this.textValue(row.personal?.height) || this.formatHeight(row),
weight: this.textValue(row.personal?.weight) || this.formatWeight(row),

mobile: row.basic?.mobile || row.mobile || '',
additionalMobile: Array.isArray(row.basic?.additionalMobile)
  ? row.basic.additionalMobile.join(', ')
  : row.basic?.additionalMobile || row.additional_mobile || '',
email: row.basic?.email || row.email || '',
religion: {
  en: row.religion?.religion || row.religion_text || '',
  ta: row.religion?.religion || row.religion_text_ta || row.religion_text || ''
},

caste: {
  en: row.religion?.caste || row.caste_text || '',
  ta: row.religion?.caste || row.caste_text_ta || row.caste_text || ''
},

fatherName: {
  en: row.family?.fatherName?.en || row.father_name || '',
  ta: row.family?.fatherName?.ta || row.father_name_ta || row.family?.fatherName?.en || row.father_name || ''
},

motherName: {
  en: row.family?.motherName?.en || row.mother_name || '',
  ta: row.family?.motherName?.ta || row.mother_name_ta || row.family?.motherName?.en || row.mother_name || ''
},

fatherOccupation: {
  en: this.textValue(row.family?.fatherOccupation),
  ta: this.textValue(row.family?.fatherOccupation)
},
motherOccupation: {
  en: this.textValue(row.family?.motherOccupation),
  ta: this.textValue(row.family?.motherOccupation)
},

siblings: { en: '', ta: '' },

marriedBrothers: row.family?.marriedBrothers ?? '',
unmarriedBrothers: row.family?.unmarriedBrothers ?? '',
marriedSisters: row.family?.marriedSisters ?? '',
unmarriedSisters: row.family?.unmarriedSisters ?? '',

kudumbaNilai: {
  en: row.family?.kudumbaNilai?.en || '',
  ta: row.family?.kudumbaNilai?.ta || row.family?.kudumbaNilai?.en || ''
},

poorvegam: {
  en: row.family?.poorvegam?.en || row.poorvegam || '',
  ta: row.family?.poorvegam?.ta || row.poorvegam_ta || row.family?.poorvegam?.en || row.poorvegam || ''
},

iruppidam: {
  en: row.family?.iruppidam?.en || row.iruppidam || '',
  ta: row.family?.iruppidam?.ta || row.iruppidam_ta || row.family?.iruppidam?.en || row.iruppidam || ''
},
education: {
  en: row.educationCareer?.education || row.education_text || '',
  ta: row.educationCareer?.education || row.education_text_ta || row.education_text || ''
},
job: {
  en: this.textValue(row.educationCareer?.job || row.occupation_text),
  ta: this.textValue(row.educationCareer?.job || row.occupation_text)
},
company: {
  en: this.textValue(row.educationCareer?.company),
  ta: this.textValue(row.educationCareer?.company)
},
workPlace: {
  en: this.textValue(row.educationCareer?.workPlace),
  ta: this.textValue(row.educationCareer?.workPlace)
},
salary:
  row.educationCareer?.salary?.ta ||
  row.educationCareer?.salary?.en ||
  this.formatSalary(row),
address: {
  en: row.address?.address?.en || row.address_line || '',
  ta: row.address?.address?.ta || row.address?.address?.en || row.address_line_ta || ''
},

city: {
  en: row.address?.city || row.city_text || '',
  ta: row.address?.city || row.city_text_ta || row.city_text || ''
},

state: {
  en: row.address?.state || row.state_text || '',
  ta: row.address?.state || row.state_text_ta || row.state_text || ''
},

country: {
  en: row.address?.country || row.country_text || '',
  ta: row.address?.country || row.country_text_ta || row.country_text || ''
},
horoscopeImage: row.astrology?.horoscopeFile || row.horoscope_file_url || '',

rasi: {
  en: row.astrology?.rasi || row.rasi_text || '',
  ta: row.astrology?.rasi || row.rasi_text_ta || row.rasi_text || ''
},

nakshatra: {
  en: row.astrology?.nakshatra || row.nakshatra_text || '',
  ta: row.astrology?.nakshatra || row.nakshatra_text_ta || row.nakshatra_text || ''
},

lagnam: {
  en: row.astrology?.lagnam || row.lagnam_text || '',
  ta: row.astrology?.lagnam || row.lagnam_text_ta || row.lagnam_text || ''
},

gothram: {
  en: row.religion?.gothram?.en || row.gothram || '',
  ta: row.religion?.gothram?.ta || row.gothram_ta || row.gothram || ''
},

dhosham: {
  en: row.astrology?.dhosham || row.dhosham_text || '',
  ta: row.astrology?.dhosham || row.dhosham_text_ta || row.dhosham_text || ''
},

birthTime: row.basic?.birthTime || row.birth_time || '',

birthPlace: {
  en: this.textValue(row.astrology?.birthPlace || row.birth_place),
  ta: this.textValue(row.astrology?.birthPlace || row.birth_place)
},

thisai: {
  en:
    this.textValue(row.astrology?.thisai) ||
    (
      row.astrology?.thisaiYear ||
      row.astrology?.thisaiMonth ||
      row.astrology?.thisaiDay
        ? `${row.astrology?.thisaiYear || '00'} Y ${row.astrology?.thisaiMonth || '00'} M ${row.astrology?.thisaiDay || '00'} D`
        : ''
    ),
  ta:
    this.textValue(row.astrology?.thisai) ||
    (
      row.astrology?.thisaiYear ||
      row.astrology?.thisaiMonth ||
      row.astrology?.thisaiDay
        ? `${row.astrology?.thisaiYear || '00'} வருடம் ${row.astrology?.thisaiMonth || '00'} மாதம் ${row.astrology?.thisaiDay || '00'} நாள்`
        : ''
    )
},

thisaiIruppu: {
  en: row.astrology?.thisaiIruppu || row.thisai_iruppu || '',
  ta: row.astrology?.thisaiIruppu || row.thisai_iruppu_ta || row.thisai_iruppu || ''
},

paatham: {
  en: row.astrology?.paatham?.en || row.paatham || '',
  ta: row.astrology?.paatham?.ta || row.paatham_ta || row.astrology?.paatham?.en || row.paatham || ''
},

sothukal: {
  en: row.family?.sothukal?.en || row.sothukal || '',
  ta: row.family?.sothukal?.ta || row.sothukal_ta || row.family?.sothukal?.en || row.sothukal || ''
},

kuladeivam: {
  en: row.family?.kuladeivam?.en || row.kuladeivam || '',
  ta: row.family?.kuladeivam?.ta || row.kuladeivam_ta || row.family?.kuladeivam?.en || row.kuladeivam || ''
},
about: {
  en: row.extras?.aboutMe?.en || row.about_me || '',
  ta: row.extras?.aboutMe?.ta || row.about_me_ta || row.extras?.aboutMe?.en || row.about_me || ''
},

partnerExpectation: {
  en: this.textValue(row.extras?.partnerExpectation || row.partner_expectation),
  ta: this.textValue(row.extras?.partnerExpectation || row.partner_expectation)
},

noCastePreference:
  row.religion?.noCastePreference === true ||
  row.no_caste_preference === true ||
  row.no_caste_preference === 'true' ||
  row.no_caste_preference === 'Yes',

rasiChart: this.toChartArray(row.astrology?.rasiChart || row.rasi_chart),
amsamChart: this.toChartArray(row.astrology?.amsamChart || row.amsam_chart)
    };
  }

  private isNumericValue(value: string): boolean {
    return /^[0-9]+$/.test(value);
  }

  private isUuidValue(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

private getStoredLoggedInUser(): any | null {
  try {
    const raw =
      localStorage.getItem('matrimony_user') ||
      localStorage.getItem('user') ||
      localStorage.getItem('loggedInUser');

    if (!raw) return null;

    const user = JSON.parse(raw);

    const userId =
      user.user_id ||
      user._id ||
      user.id ||
      user.userId ||
      user.data?._id ||
      user.data?.id ||
      user.data?.user_id;

    return {
      ...user,
      user_id: userId
    };
  } catch {
    return null;
  }
}

  private normalizeGender(value: string | null | undefined): string {
    return String(value || '').trim().toLowerCase();
  }

  private hasRequiredAstroData(row: any): boolean {
    return !!(
      row &&
      String(row.dob || '').trim() &&
      String(row.birth_time || '').trim() &&
      String(row.birth_place || '').trim()
    );
  }

// async loadAstroMatch(): Promise<void> {
//   try {
//     this.astroMatch = null;

//     const loggedInUser = this.getStoredLoggedInUser();

//     if (!loggedInUser?.user_id) {
//       console.log('NO LOGGED USER');
//       return;
//     }

//     if (!this.loadedProfileRow) {
//       console.log('NO VIEWED PROFILE');
//       return;
//     }

//       .from('user_profiles')
//       .select('*')
//       .eq('user_id', loggedInUser.user_id)
//       .maybeSingle();

//     if (error) throw error;

//     if (!myProfile) {
//       console.log('MY PROFILE NOT FOUND');
//       return;
//     }

//     const myGender = this.normalizeGender(myProfile.gender_text);
//     const targetGender = this.normalizeGender(this.loadedProfileRow.gender_text);

//     console.log('MY GENDER:', myGender);
//     console.log('TARGET GENDER:', targetGender);

//     if (!myGender || !targetGender) {
//       this.snackbar.error('Gender missing for astrology match');
//       return;
//     }

//     if (myGender === targetGender) {
//       this.snackbar.error('Astrology match needs one male and one female profile');
//       return;
//     }

//     if (!this.hasRequiredAstroData(myProfile)) {
//       console.log('MY PROFILE ASTRO DATA MISSING', myProfile);
//       return;
//     }

//     if (!this.hasRequiredAstroData(this.loadedProfileRow)) {
//       console.log('VIEWED PROFILE ASTRO DATA MISSING', this.loadedProfileRow);
//       this.snackbar.error('Viewed profile DOB, Birth Time or Birth Place is missing');
//       return;
//     }

//     const maleProfile =
//       myGender === 'male' ? myProfile : this.loadedProfileRow;

//     const femaleProfile =
//       myGender === 'female' ? myProfile : this.loadedProfileRow;

//     const malePayload = {
//       date_of_birth: this.formatDateForApi(maleProfile.dob),
//       time_of_birth: this.normalizeTimeForApi(maleProfile.birth_time),
//       place: this.normalizePlaceForApi(maleProfile.birth_place)
//     };

//     const femalePayload = {
//       date_of_birth: this.formatDateForApi(femaleProfile.dob),
//       time_of_birth: this.normalizeTimeForApi(femaleProfile.birth_time),
//       place: this.normalizePlaceForApi(femaleProfile.birth_place)
//     };

//     console.log('MALE PAYLOAD:', malePayload);
//     console.log('FEMALE PAYLOAD:', femalePayload);

//     const result = await this.astroService.getMatch(
//       malePayload,
//       femalePayload
//     );

//     console.log('PROKERALA RESULT:', result);

//     this.astroMatch = result || null;
//     this.cdr.detectChanges();

//   } catch (error) {
//     console.error('PROKERALA ERROR:', error);
//     this.snackbar.error('Failed to load astrology match');
//     this.astroMatch = null;
//     this.cdr.detectChanges();
//   }
// }

  contactUnlocked = false;
  unlockingContact = false;
  async unlockContact(): Promise<void> {
    if (this.unlockingContact) return;
    this.unlockingContact = true;
    try {
      const user = this.getStoredLoggedInUser();
      await firstValueFrom(this.http.post(`${this.apiUrl}/profile-access/contact`, {
        viewerUserId: user?.user_id, viewedProfileId: this.loadedProfileRow?._id
      }));
      await this.loadProfile();
    } catch (error: any) { this.snackbar.error(error?.error?.message || 'Unable to unlock contact'); }
    finally { this.unlockingContact = false; this.cdr.detectChanges(); }
  }
  async loadProfile(): Promise<void> {
    this.isLoading = true;
    this.profile = null;
    this.astroMatch = null;
    this.loadedProfileRow = null;
    this.cdr.detectChanges();

    try {
      // if (!this.unlocked) {
      //   alert('Profile access not allowed');
      //   this.router.navigate(['/profiles']);
      //   return;
      // }

      if (!this.selectedProfileId) {
        this.snackbar.error('Profile ID missing');
        this.router.navigate(['/profiles']);
        return;
      }

const res: any = await firstValueFrom(
 this.http.get(`${this.apiUrl}/profile/view/${this.selectedProfileId}`)
);

let data: any = res?.profile || res?.data || res;

      if (!data) {
        this.snackbar.error('Profile ID missing');
        this.router.navigate(['/profiles']);
        return;
      }

this.loadedProfileRow = data;

this.profile = this.mapRowToProfile(data);

this.unlocked = true;
this.contactUnlocked = !!data.contact_unlocked;
// await this.loadAstroMatch();
await this.checkInterest();
await this.checkShortlist();
    } catch (error: any) {

  if (
    error?.status === 403 &&
    (
      !error?.error?.code || error?.error?.code === 'NO_ACTIVE_PLAN' ||
      error?.error?.code === 'PROFILE_LIMIT_REACHED' ||
      error?.error?.code === 'PLAN_EXPIRED'
    )
  ) {

    this.snackbar.error(error?.error?.message || 'Premium details are locked. The basic profile is free to view.');

    // Paid endpoint rejected access: fall back to the non-paid basic preview.
    this.router.navigate(['/free-profile', this.selectedProfileId]);
    return;
  }

  this.snackbar.error(error?.error?.message || 'Failed to load full profile');
  // Preserve the chosen profile rather than sending the user to the old search page.
  this.router.navigate(this.selectedProfileId
    ? ['/free-profile', this.selectedProfileId]
    : ['/profiles']);
}finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  get fullLocation(): string {
    if (!this.profile) return '';

    return [
      this.getText(this.profile.city),
      this.getText(this.profile.state),
      this.getText(this.profile.country)
    ]
      .filter(Boolean)
      .join(', ');
  }

getText(value: string | LangText): string {
  if (typeof value === 'string') return value || '-';

  if (this.currentLang === 'ta') {
    return value?.ta || value?.en || '-';
  }

  return value?.en || value?.ta || '-';
}
getCategoryText(value: string | LangText): string {
  return publicDisplayValue(this.getText(value), this.currentLang);
}
isPreviouslyMarried(value: string | LangText): boolean {
  return ['divorced', 'widowed'].includes(categoryKey(this.getText(value)));
}
yesNo(value: any): string {
  const isYes =
    value === true ||
    value === 'true' ||
    value === 'Yes' ||
    value === 'yes';

  return isYes
    ? (this.currentLang === 'ta' ? 'ஆம்' : 'Yes')
    : (this.currentLang === 'ta' ? 'இல்லை' : 'No');
}

isYes(value: any): boolean {
  return (
    value === true ||
    value === 'true' ||
    value === 'Yes' ||
    value === 'yes'
  );
}
  goBack(): void {
    this.router.navigate(['/profiles']);
  }

goToPlans(): void {
  if (!this.profile || !this.loadedProfileRow) return;

  this.router.navigate(['/plans'], { 
    queryParams: {
      from: 'profiles',
      profileId: this.selectedProfileId,
      profileCode: this.loadedProfileRow.profile_code,
      profileName: this.getText(this.profile.fullName)
    }
  });
}


goToLoginOrRegister(): void {
  const loggedInUser = this.getStoredLoggedInUser();

  if (!loggedInUser?.user_id) {
    this.snackbar.error(
      this.currentLang === 'ta'
        ? 'முதலில் லாகின் செய்யவும் அல்லது ரிஜிஸ்டர் செய்யவும்'
        : 'Please login or register first'
    );

    this.router.navigate(['/login'], {
      queryParams: {
        from: 'profile-view',
        profileId: this.selectedProfileId
      }
    });

    return;
  }

  this.goToPlans();
}
async sendInterest(): Promise<void> {
  if (!this.profile || !this.loadedProfileRow) return;

  const loggedInUser = this.getStoredLoggedInUser();

  if (!loggedInUser?.user_id) {
    this.snackbar.error('Please login first');
    this.router.navigate(['/login']);
    return;
  }

  try {
    await firstValueFrom(
this.http.post(`${this.apiUrl}/interests`, {
  fromUserId: loggedInUser.user_id,
  toUser:
    this.loadedProfileRow.userId ||
    this.loadedProfileRow.user_id
})
    );

    this.alreadySent = true;
    this.interestStatus = 'pending';
    this.snackbar.success('Interest sent successfully');
    this.cdr.detectChanges();
  } catch (error: any) {
    this.alreadySent = true;
    this.snackbar.error(error?.error?.message || 'You already sent interest to this profile');
    this.cdr.detectChanges();
  }
}
async shortlistProfile(): Promise<void> {
  if (!this.profile || !this.loadedProfileRow) return;

  const loggedInUser = this.getStoredLoggedInUser();

  if (!loggedInUser?.user_id) {
    this.snackbar.error('Please login first');
    this.router.navigate(['/login']);
    return;
  }

  try {
    await firstValueFrom(
      this.http.post(`${this.apiUrl}/shortlists`, {
        userId: loggedInUser.user_id,
        profileId: this.loadedProfileRow._id
      })
    );

    this.alreadyShortlisted = true;
    this.snackbar.success('Profile shortlisted successfully');
    this.cdr.detectChanges();
  } catch (error: any) {
    this.alreadyShortlisted = true;
    this.snackbar.error(error?.error?.message || 'This profile is already shortlisted');
    this.cdr.detectChanges();
  }
}
async checkInterest() {
  const user = this.getStoredLoggedInUser();
  if (!user?.user_id || !this.loadedProfileRow?._id) return;

  const res: any = await firstValueFrom(
    this.http.get(`${this.apiUrl}/interests/check`, {
params: {
  fromUserId: user.user_id,
  toUser:
    this.loadedProfileRow.userId ||
    this.loadedProfileRow.user_id
}
    })
  );

  this.alreadySent = !!res?.exists;
  this.interestStatus = res?.status || '';
  this.cdr.detectChanges();
}
async checkShortlist() {
  const user = this.getStoredLoggedInUser();
  if (!user?.user_id || !this.loadedProfileRow?._id) return;

  const res: any = await firstValueFrom(
    this.http.get(`${this.apiUrl}/shortlists/check`, {
      params: {
        userId: user.user_id,
        profileId: this.loadedProfileRow._id
      }
    })
  );

  this.alreadyShortlisted = !!res?.exists;
  this.cdr.detectChanges();
}
async downloadProfile() {
  if (!this.unlocked) {
    this.snackbar.error('Please unlock this profile to download');
    return;
  }

  const html2canvas = await import('html2canvas');
  const jsPDF = await import('jspdf');

  const element = document.querySelector('.profile-view-page') as HTMLElement;

  if (!element) {
    this.snackbar.error('Profile not found');
    return;
  }

  element.classList.add('pdf-mode');
  this.showHoroscope = true;
this.cdr.detectChanges();

await new Promise(resolve => setTimeout(resolve, 300));

  const canvas = await html2canvas.default(element, {
    scale: 2,
    useCORS: true,
    scrollY: 0
  });

  element.classList.remove('pdf-mode');

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF.default('p', 'mm', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10;

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);

  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  // Watermark on every page
// Watermark on every page
const totalPages = pdf.getNumberOfPages();

for (let i = 1; i <= totalPages; i++) {
  pdf.setPage(i);

  // Watermark
  pdf.setFontSize(34);
  pdf.setTextColor(220, 220, 220);

  pdf.text('ASTRO ALLIANCE', 105, 150, {
    align: 'center',
    angle: 35
  });

  // Footer Details
//   pdf.setFontSize(9);
//   pdf.setTextColor(90, 90, 90);

//   pdf.text('Astro Alliance', 105, pageHeight - 18, {
//     align: 'center'
//   });

//   pdf.text(
//     'Email: support@astroalliance.in | Contact: +91 9876543210',
//     105,
//     pageHeight - 13,
//     {
//       align: 'center'
//     }
//   );

// pdf.text(
//   'Website: www.astroalliance.in',
//   105,
//   pageHeight - 8,
//   {
//     align: 'center'
//   }
// );
}

const fileName =
  `${this.getText(this.profile?.fullName || 'profile')}-Astro-Alliance.pdf`;

pdf.save(fileName.replace(/[^\w\-]+/g, '_'));

this.snackbar.success('Profile downloaded successfully');
}
}
