import {
  Component,
  OnInit,
  ChangeDetectorRef,
  NgZone,
  inject,
  PLATFORM_ID
} from '@angular/core';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient} from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
private platformId = inject(PLATFORM_ID);

private isBrowser = isPlatformBrowser(this.platformId);
  isLoading = true;

 stats = {
  totalProfiles: 0,
  maleProfiles: 0,
  femaleProfiles: 0,
  activeSubscriptions: 0,

  todayRevenue: 0,
  weekRevenue: 0,
  monthRevenue: 0,
  totalRevenue: 0
};
  recentProfiles: any[] = [];
constructor(
  private cd: ChangeDetectorRef,
  private ngZone: NgZone,
  private http: HttpClient
) {}
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
cityText(value: string): string {

  if (this.currentLang === 'en') {
    return value || '-';
  }

  const map: any = {
    Madurai: 'மதுரை',
    Chennai: 'சென்னை',
    Coimbatore: 'கோயம்புத்தூர்',
    Salem: 'சேலம்',
    Trichy: 'திருச்சி',
    'Abu Dhabi': 'அபுதாபி'
  };

  return map[value] || value || '-';
}
  async ngOnInit(): Promise<void> {
    await this.loadDashboardData();
  }

async loadDashboardData(): Promise<void> {

  this.isLoading = true;

  try {

    const res:any = await this.http
      .get(
        `${environment.apiUrl}/admin/dashboard`
      )
      .toPromise();


    const data = res?.data || {};


    this.stats = {
      totalProfiles: data.totalProfiles || 0,
      maleProfiles: data.maleProfiles || 0,
      femaleProfiles: data.femaleProfiles || 0,
      activeSubscriptions: data.activeSubscriptions || 0,
      todayRevenue: data.todayRevenue || 0,
      weekRevenue: data.weekRevenue || 0,
      monthRevenue: data.monthRevenue || 0,
      totalRevenue: data.totalRevenue || 0
    };


    this.recentProfiles = data.recentProfiles || [];

    this.isLoading = false;


  } catch(error){

    console.error(error);

    this.isLoading = false;

  }

}

}