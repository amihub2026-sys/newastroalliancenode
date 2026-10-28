import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { profileGalleryUrls, profileMediaUrl } from '../shared/profile-media';
import { PhotoLightbox } from '../shared/photo-lightbox/photo-lightbox';
import { LanguageService } from '../core/services/language.service';
import { publicDisplayValue } from '../shared/public-value-dictionary';

@Component({
  selector: 'app-my-biodata',
  standalone: true,
  imports: [CommonModule, PhotoLightbox],
  templateUrl: './my-biodata.html',
  styleUrls: ['./my-biodata.scss']
})
export class MyBiodataComponent implements OnInit {
  viewerOpen = false;
  viewerIndex = 0;
  get ownPhotos(): string[] { return [this.profile?.profile_image_url, ...(this.profile?.gallery_images || [])].filter(Boolean); }
  openOwnPhoto(index: number): void { this.viewerIndex=index; this.viewerOpen=true; }
  onProfilePhotoError(event: Event): void { const image=event.target as HTMLImageElement; if (!image.src.includes('default-profile.png')) image.src='assets/default-profile.png'; }
  onGalleryPhotoError(event: Event): void { (event.target as HTMLImageElement).style.display='none'; }
  loading = true;
  errorMessage = '';
  biodataNotFound = false;
  profile: any = null;
  isNavigating = false;
valueTaMap: Record<string, string> = {};
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

constructor(
  private router: Router,
  private cdr: ChangeDetectorRef,
  private zone: NgZone,
  public app: LanguageService,
  private http: HttpClient
) {}

apiUrl = environment.apiUrl;
async ngOnInit(): Promise<void> {
await this.loadMyBiodata();
}

private getStoredLoggedInUser(): any | null {
  try {
    const raw =
      localStorage.getItem('matrimony_user') ||
      localStorage.getItem('user') ||
      localStorage.getItem('loggedInUser');

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
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

  getPlanetShort(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    return this.planetShortMap[String(value)] || String(value);
  }
get currentLang(): 'en' | 'ta' {
  return this.app.currentLang || 'en';
}
showTextValue(enValue: any, taValue?: any): string {
  const en = String(enValue || '').trim();
  const ta = String(taValue || '').trim();

  if (this.currentLang === 'ta') {
    return ta || this.valueTaMap[en.toLowerCase()] || publicDisplayValue(en, 'ta') || '-';
  }

 return publicDisplayValue(en || ta, 'en') || '-';
}

showLangValue(enValue: any, taValue?: any): string {
  const en = String(enValue || '').trim();
  const ta = String(taValue || '').trim();

  if (this.currentLang === 'ta') {
    return ta || en || '-';
  }

  return en || ta || '-';
}

showValue(type: string, value: string): string {

  if (!value) return '-';

  if (this.currentLang !== 'ta') {
    return publicDisplayValue(value, 'en');
  }

  const map: any = {

    gender: {
      Male: 'ஆண்',
      Female: 'பெண்'
    },

    maritalStatus: {
      Unmarried: 'திருமணம் ஆகாதவர்',
      Divorced: 'விவாகரத்து',
      Widowed: 'விதவை / விதவன்'
    },

    dhosham: {
      No: 'இல்லை',
      Yes: 'உண்டு',
      'Dont Know': 'தெரியாது'
    },

  rasi: {
  Mesham: 'மேஷம்',
  Rishabam: 'ரிஷபம்',
  Mithunam: 'மிதுனம்',
  Kadagam: 'கடகம்',
  Simmam: 'சிம்மம்',
  Kanni: 'கன்னி',
  Thulam: 'துலாம்',
  Viruchigam: 'விருச்சிகம்',
  Dhanusu: 'தனுசு',
  Magaram: 'மகரம்',
  Kumbam: 'கும்பம்',
  Meenam: 'மீனம்'
},

nakshatra: {
  Ashwini: 'அஸ்வினி',
  Bharani: 'பரணி',
  Karthigai: 'கார்த்திகை',
  Rohini: 'ரோகிணி',
  Mirugasirisham: 'மிருகசீரிடம்',
  Thiruvathirai: 'திருவாதிரை',
  Punarpoosam: 'புனர்பூசம்',
  Poosam: 'பூசம்',
  Ayilyam: 'ஆயில்யம்',
  Magam: 'மகம்',
  Pooram: 'பூரம்',
  Uthiram: 'உத்திரம்',
  Hastham: 'ஹஸ்தம்',
  Chithirai: 'சித்திரை',
  Swathi: 'சுவாதி',
  Visakam: 'விசாகம்',
  Anusham: 'அனுஷம்',
  Kettai: 'கேட்டை',
  Moolam: 'மூலம்',
  Pooradam: 'பூராடம்',
  Uthiradam: 'உத்திராடம்',
  Thiruvonam: 'திருவோணம்',
  Avittam: 'அவிட்டம்',
  Sathayam: 'சதயம்',
  Poorattathi: 'பூரட்டாதி',
  Uthirattathi: 'உத்திரட்டாதி',
  Revathi: 'ரேவதி'
}

  };

  return map[type]?.[value] || publicDisplayValue(value, 'ta');

}
private normalizeProfile(data: any): any {

  return {

    profile_code: data.profileCode,
    profile_image_url: profileMediaUrl(data.media?.profileImage) || 'assets/default-profile.png',
    gallery_images: profileGalleryUrls(data.media?.gallery),
    video_url: profileMediaUrl(data.media?.video),
    
    full_name: data.basic?.fullName?.en,
    full_name_ta: data.basic?.fullName?.ta,

    gender_text: data.basic?.gender,
    age: data.basic?.age,

    mobile: data.basic?.mobile,
    email: data.basic?.email,
    birth_time: data.basic?.birthTime,

    religion_text: data.religion?.religion,
    caste_text: data.religion?.caste,

    sub_caste: data.religion?.subCaste?.en,
    sub_caste_ta: data.religion?.subCaste?.ta,

    gothram: data.religion?.gothram?.en,
    gothram_ta: data.religion?.gothram?.ta,

    height_text: data.personal?.height,
    weight_text: data.personal?.weight,

    marital_status_text: data.personal?.maritalStatus,

    children_status: data.personal?.childrenStatus,
    children_details: data.personal?.childrenDetails?.en || data.personal?.childrenDetails?.ta,
    children_details_ta: data.personal?.childrenDetails?.ta,

    handicap_status: data.personal?.handicapStatus,
    handicap_details: data.personal?.handicapDetails?.en || data.personal?.handicapDetails?.ta,

    handicap_details_ta: data.personal?.handicapDetails?.ta,

    kalappu_thirumanam: data.personal?.kalappuThirumanam,
    kalappu_thirumanam_details: data.personal?.kalappuThirumanamDetails?.en || data.personal?.kalappuThirumanamDetails?.ta,

    father_name: data.family?.fatherName?.en,
    father_name_ta: data.family?.fatherName?.ta,

    mother_name: data.family?.motherName?.en,
    mother_name_ta: data.family?.motherName?.ta,

    father_occupation_text: data.family?.fatherOccupation?.en,
    father_occupation_ta: data.family?.fatherOccupation?.ta,

    mother_occupation_text: data.family?.motherOccupation?.en,
    mother_occupation_ta: data.family?.motherOccupation?.ta,

    married_brothers: data.family?.marriedBrothers,
    unmarried_brothers: data.family?.unmarriedBrothers,

    married_sisters: data.family?.marriedSisters,
    unmarried_sisters: data.family?.unmarriedSisters,

    kudumba_nilai: data.family?.kudumbaNilai?.en,
    kudumba_nilai_ta: data.family?.kudumbaNilai?.ta,

    poorvegam: data.family?.poorvegam?.en,
    poorvegam_ta: data.family?.poorvegam?.ta,

    iruppidam: data.family?.iruppidam?.en,
    iruppidam_ta: data.family?.iruppidam?.ta,

    sothukal: data.family?.sothukal?.en,
    sothukal_ta: data.family?.sothukal?.ta,

    kuladeivam: data.family?.kuladeivam?.en,
    kuladeivam_ta: data.family?.kuladeivam?.ta,

    education_text: data.educationCareer?.education,

    occupation_text: data.educationCareer?.job?.en,
    occupation_text_ta: data.educationCareer?.job?.ta,

    company_name: data.educationCareer?.company?.en,
    company_name_ta: data.educationCareer?.company?.ta,

    work_place: data.educationCareer?.workPlace?.en,
    work_place_ta: data.educationCareer?.workPlace?.ta,

    salary_text: data.educationCareer?.salary?.ta || data.educationCareer?.salary?.en,

    address_line: data.address?.address?.en,
    address_line_ta: data.address?.address?.ta,

    city_text: data.address?.city,
    state_text: data.address?.state,
    country_text: data.address?.country,

    rasi_text: data.astrology?.rasi,
    nakshatra_text: data.astrology?.nakshatra,
    lagnam_text: data.astrology?.lagnam,
    dhosham_text: data.astrology?.dhosham,

    birth_place: data.astrology?.birthPlace?.en,
    birth_place_ta: data.astrology?.birthPlace?.ta,

thisai:
  data.astrology?.thisai?.en ||
  `${data.astrology?.thisaiYear || '00'} Y ${data.astrology?.thisaiMonth || '00'} M ${data.astrology?.thisaiDay || '00'} D`,

thisai_ta:
  data.astrology?.thisai?.ta ||
  `${data.astrology?.thisaiYear || '00'} வருடம் ${data.astrology?.thisaiMonth || '00'} மாதம் ${data.astrology?.thisaiDay || '00'} நாள்`,

    thisai_iruppu: data.astrology?.thisaiIruppu,

thisai_iruppu_ta: data.astrology?.thisaiIruppu,



    paatham: data.astrology?.paatham?.en,
    paatham_ta: data.astrology?.paatham?.ta,

    partner_expectation: data.extras?.partnerExpectation?.en,
    partner_expectation_ta: data.extras?.partnerExpectation?.ta,

    rasi_chart: this.toChartArray(data.astrology?.rasiChart),
    amsam_chart: this.toChartArray(data.astrology?.amsamChart)

  };

}
async loadMyBiodata(): Promise<void> {
  if (typeof localStorage === 'undefined') return; // Browser session is not available during SSR.
  this.loading = true;
  this.errorMessage = '';
  this.biodataNotFound = false;
  this.profile = null;
  this.cdr.detectChanges();

  try {
const token = localStorage.getItem('matrimony_token');
if (!token) {
  this.errorMessage = 'Please login first.';
  return;
}

    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/profile/me`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }).pipe(timeout({first: 12000}))
    );

    const data = res?.data;

    if (!data) {
      this.biodataNotFound = true;
      this.errorMessage = 'No biodata found. Please create your biodata first.';
      return;
    }

    this.zone.run(() => {
      this.profile = this.normalizeProfile(data);
      this.loading = false;
      this.cdr.detectChanges();
    });
  } catch (error: any) {
    this.biodataNotFound = error?.status === 404;
    this.errorMessage = this.biodataNotFound
      ? 'No biodata found. Please create your biodata first.'
      : error?.status === 401
        ? 'Your session has expired. Please login again.'
        : 'Could not load your Biodata. Check your connection and try again.';
  } finally {
    this.zone.run(() => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }
}

  editBiodata(): void {
    if (this.isNavigating) return;

    this.isNavigating = true;

    this.router.navigate(['/biodata']).finally(() => {
      this.isNavigating = false;
      this.cdr.markForCheck();
    });
  }
}