import {
  Component,
OnInit,
AfterViewInit,
ViewChild,
ElementRef,
  inject,
  PLATFORM_ID,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { SnackbarService } from '../../shared/snackbar.service';
import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';@Component({
  selector: 'app-profiles',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule
],
  templateUrl: './profiles.html',
  styleUrls: ['./profiles.scss']
})
export class Profiles implements OnInit, AfterViewInit {
private platformId = inject(PLATFORM_ID);
private isBrowser = isPlatformBrowser(this.platformId);
constructor(
  private ngZone: NgZone,
  private cd: ChangeDetectorRef,
  private router: Router,
  private snackbar: SnackbarService,
  private http: HttpClient
) {}
  isLoading = true;
@ViewChild('tableWrap') tableWrap!: ElementRef<HTMLDivElement>;
@ViewChild('topScroll') topScroll!: ElementRef<HTMLDivElement>;
@ViewChild('scrollWidth') scrollWidth!: ElementRef<HTMLDivElement>;
  searchTerm = '';

  profileCodeFilter = '';
nameFilter = '';
phoneFilter = '';
cityFilter = '';
religionFilter = '';
casteFilter = '';
genderFilter = '';
maritalStatusFilter = '';
cityOptions: any[] = [];
religionOptions: any[] = [];
casteOptions: any[] = [];
maritalStatusOptions: any[] = [];
  statusFilter = 'All';

  profiles: any[] = [];
  private apiUrl = environment.apiUrl;
private getAdminHeaders() {
  const token = this.isBrowser
    ? localStorage.getItem('admin_token') || ''
    : '';

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}
  userPlans: any[] = [];

  currentPage = 1;
itemsPerPage = 5;

get currentLang(): 'en' | 'ta' {

  if (!this.isBrowser) {
    return 'en';
  }

  return (
    localStorage.getItem('tm_language') as 'en' | 'ta'
  ) || 'en';

}


labels: any = {
  en: {
    title: 'Manage Profiles',
    subtitle: 'Approve, reject, block and review matrimony profiles',
    refresh: 'Refresh',
    search: 'Search by name, profile code, city, gender, status...',
    profileCode: 'Profile Code',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    city: 'City',
    maritalStatus: 'Marital Status',
    status: 'Status',
    joined: 'Joined',
    actions: 'Actions',
    approve: 'Approve',
    review: 'Review',
    reject: 'Reject',
    block: 'Block',
    noProfiles: 'No profiles found',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    loading: 'Loading profiles...',
    all: 'All',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    blocked: 'Blocked',
    underReview: 'Under Review'
  },
  ta: {
    title: 'சுயவிவரங்களை நிர்வகிக்கவும்',
    subtitle: 'திருமண சுயவிவரங்களை ஒப்புதல், நிராகரிப்பு, தடை மற்றும் மதிப்பாய்வு செய்யவும்',
    refresh: 'புதுப்பிக்கவும்',
    search: 'பெயர், சுயவிவர குறியீடு, நகரம், பாலினம், நிலை மூலம் தேடவும்...',
    profileCode: 'சுயவிவர குறியீடு',
    name: 'பெயர்',
    age: 'வயது',
    gender: 'பாலினம்',
    city: 'நகரம்',
    maritalStatus: 'திருமண நிலை',
    status: 'நிலை',
    joined: 'இணைந்த தேதி',
    actions: 'செயல்கள்',
    approve: 'ஒப்புதல்',
    review: 'மதிப்பாய்வு',
    reject: 'நிராகரி',
    block: 'தடை செய்',
    noProfiles: 'மேட்ச்சஸ் இல்லை',
    previous: 'முந்தையது',
    next: 'அடுத்தது',
    page: 'பக்கம்',
    of: '/',
    loading: 'மேட்ச்சஸ் ஏற்றப்படுகின்றன...',
    all: 'அனைத்தும்',
    pending: 'நிலுவையில்',
    approved: 'ஒப்புதல்',
    rejected: 'நிராகரிக்கப்பட்டது',
    blocked: 'தடைசெய்யப்பட்டது',
    underReview: 'மதிப்பாய்வில்'
  }
};


txt(key: string): string {
  return this.labels[this.currentLang][key] || key;
}

statusText(status: string): string {
  const value = status || 'Pending';

  if (this.currentLang === 'en') {
    return value;
  }

  const map: any = {
    Pending: 'நிலுவையில்',
    Approved: 'ஒப்புதல்',
    Rejected: 'நிராகரிக்கப்பட்டது',
    Blocked: 'தடைசெய்யப்பட்டது',
    'Under Review': 'மதிப்பாய்வில்'
  };

  return map[value] || value;
}
  statuses = [
    'All',
    'Pending',
    'Approved',
    'Rejected',
    'Blocked',
    'Under Review'
  ];
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

maritalText(value: string): string {

  if (this.currentLang === 'en') {
    return value || '-';
  }

  const map: any = {
    Unmarried: 'திருமணம் ஆகாதவர்',
    Married: 'திருமணமானவர்',
    Divorced: 'விவாகரத்து பெற்றவர்',
    Widow: 'விதவை',
    Widower: 'மனைவியை இழந்தவர்'
  };

  return map[value] || value || '-';
}

cityText(value: string): string {

  if (!value) return '-';

  if (this.currentLang === 'en') {
    return value;
  }

  const city = this.cityOptions.find(
    (item: any) => item.city_name === value
  );

  return city?.city_name_ta || value;
}

dateText(date: string): string {

  if (!date) {
    return '-';
  }

  return new Date(date).toLocaleDateString(
    this.currentLang === 'ta' ? 'ta-IN' : 'en-IN',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  );
}
async ngOnInit(): Promise<void> {
  if (!this.isBrowser) return;

  await this.loadMaritalStatuses();
  await this.loadCities();
  await this.loadProfiles();
}
async loadCities(): Promise<void> {

  try {

    const response: any = await this.http
      .get(
        `${this.apiUrl}/masters/cities`,
        this.getAdminHeaders()
      )
      .toPromise();

    this.cityOptions = (response?.data || []).map((city: any) => ({
      city_name: city.nameEn,
      city_name_ta: city.nameTa
    }));

  } catch (error) {

    console.error('Failed to load cities', error);

    this.cityOptions = [];

  }
}
async loadMaritalStatuses(): Promise<void> {

  try {

    const response:any = await this.http
      .get(
        `${this.apiUrl}/masters/marital-statuses`,
        this.getAdminHeaders()
      )
      .toPromise();

    this.maritalStatusOptions = response?.data || [];

  } catch(error) {

    console.error(
      'Failed to load marital statuses',
      error
    );

    this.maritalStatusOptions = [];

  }

}
getStatus(profile: any): string {
  const status = String(profile?.profile_status || 'pending')
    .trim()
    .toLowerCase();

  if (status === 'draft') {
    return 'pending';
  }

  return status;
}
async loadProfiles(): Promise<void> {
  this.ngZone.run(() => {
    this.isLoading = true;
    this.cd.detectChanges();
  });

  try {
    const response: any = await this.http
     .get(`${this.apiUrl}/admin/profiles`, this.getAdminHeaders())
      .toPromise();

    const data = response?.data || [];

    this.userPlans = [];

    this.profiles = (data || [])
      .map((profile: any) => ({
        ...profile,

        profile_id: profile._id,
        profile_code: profile.profileCode || '-',
        profile_status: profile.profileStatus || 'pending',

        full_name: profile.basic?.fullName?.en || profile.basic?.fullName || '-',
        full_name_ta: profile.basic?.fullName?.ta || '',

        mobile: profile.basic?.mobile || '-',
        dob: profile.basic?.dob || '',

gender_text: profile.basic?.gender || '',

marital_status_id:
  profile.personal?.maritalStatusId || '',

marital_status:
  profile.personal?.maritalStatus || '',

city_text: profile.address?.city || '',
religion_text: profile.religion?.religion || '',
caste_text: profile.religion?.caste || '',

        profile_image_url:
          profile.media?.profileImage ||
          profile.media?.profileImageUrl ||
          '',

        created_at: profile.createdAt,

package_name: profile.subscription?.plan_id || '-',
payment_mode: profile.subscription?.payment_mode || '-',
purchased_date: profile.subscription?.start_date || null,
expired_date: profile.subscription?.end_date || null,
limits: profile.subscription
  ? `${profile.subscription.contacts_used || 0}/${profile.subscription.total_contacts_allowed || 0}`
  : '-',
views_count: profile.subscription?.profile_views_used || 0
      }))
      .sort((a: any, b: any) => {
        const aPending = this.getStatus(a) === 'pending';
        const bPending = this.getStatus(b) === 'pending';

        if (aPending && !bPending) return -1;
        if (!aPending && bPending) return 1;

        return String(b.profile_code || '').localeCompare(
          String(a.profile_code || ''),
          undefined,
          { numeric: true }
        );
      });

    this.loadFilterOptions();

  } catch (err: any) {
    console.error('Load profiles error:', err);
    this.snackbar.error(err?.error?.message || 'Failed to load profiles');
    this.profiles = [];
  } finally {
    this.ngZone.run(() => {
      this.isLoading = false;
      this.cd.detectChanges();

      setTimeout(() => {
        this.syncTableScroll();
      }, 300);
    });
  }
}

loadFilterOptions(): void {


  this.religionOptions = [
    ...new Map(
      this.profiles
        .filter(p => p.religion_text)
        .map(p => [
          p.religion_text,
          {
            religion_name: p.religion_text,
            religion_name_ta: p.religion_ta
          }
        ])
    ).values()
  ];

  this.casteOptions = [
    ...new Map(
      this.profiles
        .filter(p => p.caste_text)
        .map(p => [
          p.caste_text,
          {
            caste_name: p.caste_text,
            caste_name_ta: p.caste_ta
          }
        ])
    ).values()
  ];
}

async refresh(): Promise<void> {
  this.searchTerm = '';

  this.profileCodeFilter = '';
  this.nameFilter = '';
  this.phoneFilter = '';
  this.cityFilter = '';
  this.religionFilter = '';
  this.casteFilter = '';
  this.genderFilter = '';
  this.maritalStatusFilter = '';
  this.statusFilter = 'All';

  this.currentPage = 1;

  await this.loadProfiles();
}
get filteredProfiles(): any[] {

  return this.profiles.filter(profile => {

    const matchesCode =
      !this.profileCodeFilter ||
      String(profile.profile_code || '')
        .toLowerCase()
        .includes(this.profileCodeFilter.toLowerCase());

    const matchesName =
      !this.nameFilter ||
      String(profile.full_name || '')
        .toLowerCase()
        .includes(this.nameFilter.toLowerCase());

    const matchesPhone =
  !this.phoneFilter ||
  String(profile.mobile || profile.phone || profile.phone_number || '')
    .toLowerCase()
    .includes(this.phoneFilter.toLowerCase());

    const matchesCity =
      !this.cityFilter ||
      profile.city_text === this.cityFilter;

    const matchesReligion =
      !this.religionFilter ||
      profile.religion_text === this.religionFilter;

    const matchesCaste =
      !this.casteFilter ||
      profile.caste_text === this.casteFilter;

    const matchesGender =
      !this.genderFilter ||
      profile.gender_text === this.genderFilter;

      const matchesMaritalStatus =
  !this.maritalStatusFilter ||
  String(profile.marital_status_id) === String(this.maritalStatusFilter);

    return (
  matchesCode &&
  matchesName &&
  matchesPhone &&
  matchesCity &&
  matchesReligion &&
  matchesCaste &&
  matchesGender &&
matchesMaritalStatus
);
  });
}

get paginatedProfiles(): any[] {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.filteredProfiles.slice(start, start + this.itemsPerPage);
}

get totalPages(): number {
  return Math.ceil(this.filteredProfiles.length / this.itemsPerPage) || 1;
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
  }
}

prevPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}

resetPage(): void {
  this.currentPage = 1;
}

calculateAge(dob: string): number | string {

  if (!dob) return '-';

  const birthDate = new Date(dob);
  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const month =
    today.getMonth() -
    birthDate.getMonth();

  if (
    month < 0 ||
    (
      month === 0 &&
      today.getDate() < birthDate.getDate()
    )
  ) {
    age--;
  }

  return age;
}
getProfileImage(profile: any): string {
  if (profile?.profile_image_url) {
    return profile.profile_image_url;
  }

  const gender = String(profile?.gender_text || '').toLowerCase();

  if (gender === 'male' || gender === 'ஆண்') {
    return 'assets/mat-02.jpg';
  }

  return 'assets/mat-03.jpg';
}


viewProfile(profile: any, event?: Event): void {
  event?.stopPropagation();

  this.router.navigate(['/admin/profile', profile.profile_id]);
}

editProfile(profile: any, event?: Event): void {
  event?.stopPropagation();

  if (!profile?.profile_id) {
    this.snackbar.error('Profile id missing');
    return;
  }

this.router.navigate(['/admin/create-biodata'], {
  queryParams: {
    edit: 'true',
    id: profile.profile_id,
    adminCreate: 'true'
  }
});
}
async approveProfile(profile: any, event?: Event): Promise<void> {
  event?.stopPropagation();

  try {
    await this.http
      .put(
  `${this.apiUrl}/admin/profiles/${profile.profile_id}/approve`,
  {},
  this.getAdminHeaders()
)
      .toPromise();

    profile.profile_status = 'approved';
    this.snackbar.success('Profile approved successfully');
    await this.loadProfiles();

  } catch (err: any) {
    this.snackbar.error(err?.error?.message || 'Approve failed');
  }
}

async disapproveProfile(profile: any, event?: Event): Promise<void> {
  event?.stopPropagation();

  try {
    await this.http
      .put(
  `${this.apiUrl}/admin/profiles/${profile.profile_id}/disapprove`,
  {},
  this.getAdminHeaders()
)
      .toPromise();

    profile.profile_status = 'pending';
    this.snackbar.success('Profile disapproved successfully');
    await this.loadProfiles();

  } catch (err: any) {
    this.snackbar.error(err?.error?.message || 'Disapprove failed');
  }
}
addPackage(profile: any, event?: Event): void {
  event?.stopPropagation();

  this.router.navigate(['/admin/user-plans'], {
    queryParams: {
      profile_id: profile.profile_id,
      profile_code: profile.profile_code
    }
  });
}

async deleteProfile(profile: any, event?: Event): Promise<void> {
  event?.stopPropagation();

  const confirmDelete = confirm(
    `Are you sure you want to permanently delete ${profile.full_name || profile.profile_code}?`
  );

  if (!confirmDelete) return;

  try {
    await this.http
     .delete(
  `${this.apiUrl}/admin/profiles/${profile.profile_id}`,
  this.getAdminHeaders()
)
      .toPromise();

    this.snackbar.success('Profile deleted successfully');
    await this.loadProfiles();

  } catch (err: any) {
    this.snackbar.error(err?.error?.message || 'Delete failed');
  }
}
allowOnlyNumbers(event: KeyboardEvent): void {

  const charCode = event.which
    ? event.which
    : event.keyCode;

  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}
sanitizePhoneFilter(): void {

  this.phoneFilter =
    (this.phoneFilter || '')
      .replace(/\D/g, '');

}
ngAfterViewInit(): void {
  if (!this.isBrowser) return;

  setTimeout(() => {
    this.syncTableScroll();
  }, 500);
}
private isSyncingScroll = false;

syncTableScroll(): void {
  if (!this.isBrowser) return;

  setTimeout(() => {
    const table = this.tableWrap?.nativeElement?.querySelector('table') as HTMLElement;

    if (!table || !this.scrollWidth?.nativeElement) return;

   this.scrollWidth.nativeElement.style.width = table.scrollWidth + 'px';
  }, 100);
}

onTopScroll(): void {
  if (this.isSyncingScroll) return;

  this.isSyncingScroll = true;
  this.tableWrap.nativeElement.scrollLeft =
    this.topScroll.nativeElement.scrollLeft;
  this.isSyncingScroll = false;
}

onBottomScroll(): void {
  if (this.isSyncingScroll) return;

  this.isSyncingScroll = true;
  this.topScroll.nativeElement.scrollLeft =
    this.tableWrap.nativeElement.scrollLeft;
  this.isSyncingScroll = false;
}
shareWelcomeWhatsapp(profile: any, event?: Event): void {
  event?.stopPropagation();

  const profileLink =
    `https://astroalliance.vercel.app/profile/${profile.profile_id}`;
const message = `
வணக்கம்
Astro Alliance Matrimony-க்கு உங்களை அன்புடன் வரவேற்கிறோம்.
உங்கள் திருமண ப்ரொபைல் வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது.
ப்ரொபைல் எண் : ${profile.profile_code || '-'}
பெயர் : ${profile.full_name || '-'}
கைபேசி எண் : ${profile.mobile || '-'}
பிறந்த தேதி : ${profile.dob || '-'}
உங்களுக்கு பொருத்தமான வாழ்க்கைத் துணையை கண்டுபிடிக்க எங்கள் மனமார்ந்த வாழ்த்துக்கள்.
உங்கள் ப்ரொபைல் பார்க்க:
${profileLink}
உதவி தேவைப்பட்டால் எங்களை தொடர்பு கொள்ளவும்.
நன்றி
Astro Alliance Matrimony
98421 34672, 99433 15331
`;
const phone = String(profile.mobile || '')
  .replace(/\D/g, '');

const whatsappUrl =
  `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

window.open(whatsappUrl, '_blank');
}
shareProfileWhatsapp(profile: any, event?: Event): void {
  event?.stopPropagation();

  const profileLink =
    `https://astroalliance.vercel.app/profiles?id=${profile.profile_id}`;

  const message = `
 வணக்கம்
Astro Alliance Matrimony மூலம் உங்களுக்கு பொருத்தமான ப்ரொபைல்ஸ் பகிரப்படுகிறது.
ப்ரொபைல் எண் : ${profile.profile_code || '-'}
பெயர் : ${profile.full_name || '-'}
இந்த ப்ரொபைல்ஸ் உங்களுக்கு பொருத்தமாக இருந்தால், மேலும் தகவல்களுக்கு எங்களை தொடர்பு கொள்ளவும்.
ப்ரொபைல் பார்க்க:
${profileLink}
நன்றி
Astro Alliance Matrimony - 98421 34672,99433 15331
`;

  const phone = String(profile.mobile || '').replace(/\D/g, '');

  const whatsappUrl =
    `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');
}
}
