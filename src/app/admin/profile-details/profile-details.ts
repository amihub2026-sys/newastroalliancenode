import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-details.html',
  styleUrls: ['./profile-details.scss']
})
export class ProfileDetails implements OnInit, OnChanges {
  @Input() id = '';

  isLoading = true;
  profile: any = null;
//  pdfWithPhoto = false;
// pdfWithAddress = true;
showPrintOptions = false;
activeTab: 'profile' | 'other' | 'package' | 'views' = 'profile';

profileViewList: any[] = [];
private apiUrl = environment.apiUrl;
masterOptions: any = {
  cities: [],
  states: [],
  countries: [],
  religions: [],
  castes: [],
  colors: [],
  maritalStatuses: [],
  rasis: [],
  nakshatras: [],
  lagnams: [],
  thisaiIruppus: [],
  genders: [],
  kudumbaNilai: []
};
async loadMasters(): Promise<void> {
  try {
    const [
      cities,
        states,
countries,
      religions,
      castes,
      colors,
      maritalStatuses,
      rasis,
      nakshatras,
      lagnams,
      thisaiIruppus,
      genders,
      kudumbaNilai
    ] = await Promise.all([
      this.http.get(`${this.apiUrl}/masters/cities`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/states`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/countries`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/religions`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/castes`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/colors`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/marital-statuses`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/rasis`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/nakshatras`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/lagnams`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/thisai-iruppus`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/genders`).toPromise(),
      this.http.get(`${this.apiUrl}/masters/kudumba-nilai`).toPromise()
    ]);

    this.masterOptions.cities = (cities as any)?.data || [];
    this.masterOptions.states = (states as any)?.data || [];
    this.masterOptions.countries = (countries as any)?.data || [];
    this.masterOptions.religions = (religions as any)?.data || [];
    this.masterOptions.castes = (castes as any)?.data || [];
    this.masterOptions.colors = (colors as any)?.data || [];
    this.masterOptions.maritalStatuses = (maritalStatuses as any)?.data || [];
    this.masterOptions.rasis = (rasis as any)?.data || [];
    this.masterOptions.nakshatras = (nakshatras as any)?.data || [];
    this.masterOptions.lagnams = (lagnams as any)?.data || [];
    this.masterOptions.thisaiIruppus = (thisaiIruppus as any)?.data || [];
    this.masterOptions.genders = (genders as any)?.data || [];
    this.masterOptions.kudumbaNilai = (kudumbaNilai as any)?.data || [];

  } catch (error) {
    console.error('Failed to load master values', error);
  }
}
getMasterTamil(list: any[], englishValue: any): string {

  if (!englishValue) return '-';

  if (this.currentLang === 'en') {
    return englishValue;
  }

  const value = String(englishValue).trim().toLowerCase();

  const match = list.find((item: any) => {
    const nameEn = String(
      item?.nameEn ||
      item?.religion_name ||
      item?.caste_name ||
      ''
    ).trim().toLowerCase();

    return nameEn === value;
  });

  return match?.nameTa ||
         match?.religion_name_ta ||
         match?.caste_name_ta ||
         englishValue;
}
private getAdminHeaders() {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('admin_token') || ''
      : '';

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}
// pdfPhotoUrl = '/assets/default-avatar.png';
get currentLang(): 'en' | 'ta' {
  if (typeof window === 'undefined') {
    return 'en';
  }

  return (localStorage.getItem('tm_language') as 'en' | 'ta') || 'en';
}

txt(en: string, ta: string): string {
  return this.currentLang === 'ta' ? ta : en;
}

v(en: any, ta: any): string {
  if (this.currentLang === 'ta') {
    return ta || en || '-';
  }

  return en || '-';
}
masterText(en: any, ta: any): string {
  if (this.currentLang !== 'ta') {
    return en || '-';
  }

  if (ta) {
    return ta;
  }

  const map: any = {
    Dindigul: 'திண்டுக்கல்',
    Hindu: 'இந்து',
    Viswakarma: 'விஸ்வகர்மா',
    'First Marriage': 'முதல் திருமணம்',
    'Second Marriage': 'இரண்டாம் திருமணம்',
    'Middle Class': 'நடுத்தர வர்க்கம்',
    Fair: 'வெள்ளை நிறம்'
  };

  return map[en] || en || '-';
}
yesNo(value: any): string {
  if (value === true || value === 'Yes' || value === 'yes') {
    return this.currentLang === 'ta' ? 'ஆம்' : 'Yes';
  }

  if (value === false || value === 'No' || value === 'no') {
    return this.currentLang === 'ta' ? 'இல்லை' : 'No';
  }

  return '-';
}

isYes(value: any): boolean {
  return value === true || value === 'Yes' || value === 'yes';
}

formatHeight(): string {
  if (this.profile?.height_text) return this.v(this.profile.height_text, this.profile.height_text_ta);
  if (this.profile?.height_cm) return `${this.profile.height_cm} cm`;
  return '-';
}

formatWeight(): string {
  if (this.profile?.weight_text) return this.v(this.profile.weight_text, this.profile.weight_text_ta);
  if (this.profile?.weight_kg) return `${this.profile.weight_kg} kg`;
  return '-';
}

formatSalary(): string {
  if (this.profile?.salary_text || this.profile?.salary_text_ta) {
    return this.v(this.profile.salary_text, this.profile.salary_text_ta);
  }

  if (this.profile?.salary_amount) {
    return `${this.profile.salary_currency || 'INR'} ${this.profile.salary_amount}`;
  }

  return '-';
}
statusText(status: string): string {
  if (this.currentLang === 'en') {
    return status || 'Pending';
  }

  const map: any = {
    Pending: 'நிலுவையில்',
    Approved: 'ஒப்புதல்',
    Rejected: 'நிராகரிக்கப்பட்டது',
    Blocked: 'தடைசெய்யப்பட்டது',
    'Under Review': 'மதிப்பாய்வில்'
  };

  return map[status || 'Pending'] || status;
}
dateText(date: string): string {

  if (!date) {
    return '-';
  }

  const d = new Date(date);

  if (isNaN(d.getTime())) {
    return '-';
  }

  return d.toLocaleDateString(
    this.currentLang === 'ta' ? 'ta-IN' : 'en-IN',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  );
}
constructor(
  private cdr: ChangeDetectorRef,
  private router: Router,
  private http: HttpClient
) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') {
      return;
    }

    setTimeout(() => {
      this.loadFromRoute();
    }, 0);
  }
genderText(value: string): string {
  if (this.currentLang === 'en') {
    return value || '-';
  }

  const map: any = {
    Male: 'ஆண்',
    Female: 'பெண்',
    Other: 'மற்றவை'
  };

  return map[value] || value || '-';
}
dhoshamText(value: string): string {
  if (this.currentLang === 'en') {
    return value || '-';
  }

  const map: any = {
    Yes: 'உண்டு',
    No: 'இல்லை'
  };

  return map[value] || value || '-';
}
getRasiChart(): string[] {

  if (!this.profile?.rasi_chart) {
    return [];
  }

  try {

    return typeof this.profile.rasi_chart === 'string'
      ? JSON.parse(this.profile.rasi_chart)
      : this.profile.rasi_chart;

  } catch {

    return [];

  }

}

getAmsamChart(): string[] {

  if (!this.profile?.amsam_chart) {
    return [];
  }

  try {

    return typeof this.profile.amsam_chart === 'string'
      ? JSON.parse(this.profile.amsam_chart)
      : this.profile.amsam_chart;

  } catch {

    return [];

  }

}
async ngOnChanges(changes: SimpleChanges): Promise<void> {
  if (typeof window === 'undefined') return;

  if (changes['id'] && this.id) {
    await this.loadProfile(this.id);
  }
}

  async loadFromRoute(): Promise<void> {
    const urlParts = window.location.pathname.split('/');
    const urlId = urlParts[urlParts.length - 1];

    if (!urlId) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

   await this.loadMasters();
await this.loadProfile(urlId);

const params = new URLSearchParams(window.location.search);
const tab = params.get('tab');

if (tab === 'views') {
  this.activeTab = 'views';
  this.cdr.detectChanges();
}
  }

async loadProfile(id: string): Promise<void> {
  this.isLoading = true;
  this.cdr.detectChanges();

  try {
    const response: any = await this.http
      .get(`${this.apiUrl}/admin/profiles/${id}`, this.getAdminHeaders())
      .toPromise();

    const data = response?.data;
    let subscription: any = null;

if (data?.userId) {
  const subResponse: any = await this.http
    .get(
      `${this.apiUrl}/subscription/user/${data.userId}`,
      this.getAdminHeaders()
    )
    .toPromise();

  subscription = subResponse?.data;
}

// LOAD THIS USER VIEWED PROFILES

if (data?.userId) {

  const viewResponse: any = await this.http
    .get(
      `${this.apiUrl}/profile-views/user/${data.userId}`,
      this.getAdminHeaders()
    )
    .toPromise();

  this.profileViewList =
    viewResponse?.data || [];

}

    if (!data) {
      this.profile = null;
      return;
    }
    this.profile = {
      ...data,

      profile_id: data._id,
      profile_code: data.profileCode || '-',
      profile_status: data.profileStatus || 'pending',

full_name: data.basic?.fullName?.en || data.basic?.fullName || '-',
full_name_ta: data.basic?.fullName?.ta || '',
mobile: data.basic?.mobile || '-',
additional_mobile: Array.isArray(data.basic?.additionalMobile)
  ? data.basic.additionalMobile.join(', ')
  : '-',
email: data.basic?.email || '-',
dob: data.basic?.dob || '',
age: data.basic?.age || '',

gender_text: data.basic?.gender || '',
birth_time: data.basic?.birthTime || '',

height_text: data.personal?.height || '',
weight_text: data.personal?.weight || '',
color_text: data.personal?.color || '',
marital_status_text: data.personal?.maritalStatus || '',
second_marriage_reason: data.personal?.secondMarriageReason || '',
children_status: data.personal?.childrenStatus || '',
children_details: data.personal?.childrenDetails?.en || '',
children_details_ta: data.personal?.childrenDetails?.ta || '',
handicap_status: data.personal?.handicapStatus || '',
handicap_details: data.personal?.handicapDetails?.en || '',
handicap_details_ta: data.personal?.handicapDetails?.ta || '',
kalappu_thirumanam: data.personal?.kalappuThirumanam || '',
kalappu_thirumanam_details: data.personal?.kalappuThirumanamDetails?.en || '',
kalappu_thirumanam_details_ta: data.personal?.kalappuThirumanamDetails?.ta || '',

religion_text: data.religion?.religion || '',
caste_text: data.religion?.caste || '',
no_caste_preference: data.religion?.noCastePreference || false,
sub_caste_text: data.religion?.subCaste?.en || '',
sub_caste_text_ta: data.religion?.subCaste?.ta || '',
gothram: data.religion?.gothram?.en || '',
gothram_ta: data.religion?.gothram?.ta || '',

father_name: data.family?.fatherName?.en || '',
father_name_ta: data.family?.fatherName?.ta || '',
mother_name: data.family?.motherName?.en || '',
mother_name_ta: data.family?.motherName?.ta || '',
father_occupation: data.family?.fatherOccupation?.en || '',
father_occupation_ta: data.family?.fatherOccupation?.ta || '',
mother_occupation: data.family?.motherOccupation?.en || '',
mother_occupation_ta: data.family?.motherOccupation?.ta || '',
married_brothers: data.family?.marriedBrothers || 0,
unmarried_brothers: data.family?.unmarriedBrothers || 0,
married_sisters: data.family?.marriedSisters || 0,
unmarried_sisters: data.family?.unmarriedSisters || 0,
kudumba_nilai: data.family?.kudumbaNilai?.en || '',
kudumba_nilai_ta: data.family?.kudumbaNilai?.ta || '',
sothukal: data.family?.sothukal?.en || '',
sothukal_ta: data.family?.sothukal?.ta || '',
kuladeivam: data.family?.kuladeivam?.en || '',
kuladeivam_ta: data.family?.kuladeivam?.ta || '',
poorvegam: data.family?.poorvegam?.en || '',
poorvegam_ta: data.family?.poorvegam?.ta || '',
iruppidam: data.family?.iruppidam?.en || '',
iruppidam_ta: data.family?.iruppidam?.ta || '',

education_text: data.educationCareer?.education || '',
occupation_text: data.educationCareer?.job?.en || '',
occupation_text_ta: data.educationCareer?.job?.ta || '',
work_place: data.educationCareer?.workPlace?.en || '',
work_place_ta: data.educationCareer?.workPlace?.ta || '',
company_name: data.educationCareer?.company?.en || '',
company_name_ta: data.educationCareer?.company?.ta || '',
salary_text: data.educationCareer?.salary?.en || '',
salary_text_ta: data.educationCareer?.salary?.ta || '',

city_text: data.address?.city || '',
state_text: data.address?.state || '',
country_text: data.address?.country || '',
address_line: data.address?.address?.en || '',
address_line_ta: data.address?.address?.ta || '',

rasi_text: data.astrology?.rasi || '',
nakshatra_text: data.astrology?.nakshatra || '',
lagnam_text: data.astrology?.lagnam || '',
dhosham_text: data.astrology?.dhosham || '',
birth_place: data.astrology?.birthPlace?.en || '',
birth_place_ta: data.astrology?.birthPlace?.ta || '',
thisai: data.astrology?.thisai?.en || '',
thisai_ta: data.astrology?.thisai?.ta || '',
thisai_iruppu: data.astrology?.thisaiIruppu || '',
paatham: data.astrology?.paatham?.en || '',
paatham_ta: data.astrology?.paatham?.ta || '',
thisai_year: data.astrology?.thisaiYear || '0',
thisai_month: data.astrology?.thisaiMonth || '0',
thisai_day: data.astrology?.thisaiDay || '0',
rasi_chart: data.astrology?.rasiChart || [],
amsam_chart: data.astrology?.amsamChart || [],

partner_expectation: data.extras?.partnerExpectation?.en || '',
partner_expectation_ta: data.extras?.partnerExpectation?.ta || '',

profile_image_url: data.media?.profileImage || '',
additional_image_urls: data.media?.gallery || [],
video_url: data.media?.video || '',

package_name: subscription?.plan_name || subscription?.plan_id || '-',
payment_mode: subscription?.payment_mode || '-',
purchased_date: subscription?.start_date || null,
expired_date: subscription?.end_date || null,
limits: subscription?.total_contacts_allowed || 0,
contacts_taken: subscription?.contacts_used || 0,
views_count: subscription?.profile_views_used || 0,
profile_view_limit: subscription?.profile_view_limit || 0
    };

  } catch (err) {
    console.error('Load profile error:', err);
    this.profile = null;
  } finally {
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
openViewedProfile(profileId: string): void {
  if (!profileId || !this.profile?.profile_id) return;

  this.router.navigate(['/admin/profile', profileId], {
    queryParams: {
      fromProfile: this.profile.profile_id,
      fromTab: 'views'
    }
  });
}
goBack(): void {
  const params = new URLSearchParams(window.location.search);
  const fromProfile = params.get('fromProfile');
  const fromTab = params.get('fromTab');

  if (fromProfile) {
    this.router.navigate(['/admin/profile', fromProfile], {
      queryParams: {
        tab: fromTab || 'profile'
      }
    });
    return;
  }

  this.router.navigate(['/admin/profiles']);
}
goToPrint(withPhoto: boolean, withAddress: boolean): void {

  if (!this.profile?.profile_code) {
    return;
  }


  let type = '';

  if(withPhoto && withAddress){
    type = 'photo-address';
  }
  else if(!withPhoto && withAddress){
    type = 'address';
  }
  else if(withPhoto && !withAddress){
    type = 'photo';
  }
  else{
    type = 'normal';
  }


  const url = this.router.serializeUrl(
    this.router.createUrlTree(
      [
        '/generateReportwithoutaddress',
        type,
        this.profile.profile_code
      ]
    )
  );


  window.open(url, '_blank');

}
async updateStatus(status: string): Promise<void> {
  if (!this.profile) return;

  try {
    if (status.toLowerCase() === 'approved') {
      await this.http
        .put(
          `${this.apiUrl}/admin/profiles/${this.profile.profile_id}/approve`,
          {},
          this.getAdminHeaders()
        )
        .toPromise();
    } else if (status.toLowerCase() === 'pending') {
      await this.http
        .put(
          `${this.apiUrl}/admin/profiles/${this.profile.profile_id}/disapprove`,
          {},
          this.getAdminHeaders()
        )
        .toPromise();
    }

    this.profile.profile_status = status;
    this.cdr.detectChanges();

    alert(`Profile ${status}`);
  } catch (err: any) {
    alert(err?.error?.message || 'Failed to update status');
  }
}
}