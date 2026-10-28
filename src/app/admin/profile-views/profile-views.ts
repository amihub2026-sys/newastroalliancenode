import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile-views',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './profile-views.html',
  styleUrls: ['./profile-views.scss']
})
export class ProfileViews
implements OnInit, OnChanges {

  views: any[] = [];

  searchTerm = '';

  selectedHistory: any[] = [];

  selectedViewer: any = null;

  isLoading = false;

constructor(
  private ngZone: NgZone,
  private cdr: ChangeDetectorRef,
  private http: HttpClient
) {}
get currentLang(): 'en' | 'ta' {

  if (typeof window === 'undefined') {
    return 'en';
  }

  const lang =
    localStorage.getItem('tm_language');

  return lang === 'ta'
    ? 'ta'
    : 'en';
}

v(en: any, ta: any): string {

  if (this.currentLang === 'ta') {

    return ta || en || '-';
  }

  return en || '-';
}
  async ngOnInit(): Promise<void> {

    await this.loadViews();
  }

  ngOnChanges(
    changes: SimpleChanges
  ): void {

   

    this.cdr.detectChanges();
  }

  openHistory(item: any): void {

    this.ngZone.run(() => {

      this.selectedViewer = item;

      this.selectedHistory =
        this.views.filter(v =>

          v.viewer?.profile_code ===
          item.viewer?.profile_code
        );

      this.cdr.detectChanges();
    });
  }

get filteredViews() {
  const term = this.searchTerm.trim().toLowerCase();

  if (!term) return this.views;

  return this.views.filter(item =>
    String(item.viewer?.full_name || '').toLowerCase().includes(term) ||
    String(item.viewer?.profile_code || '').toLowerCase().includes(term) ||
    String(item.viewed?.full_name || '').toLowerCase().includes(term) ||
    String(item.viewed?.profile_code || '').toLowerCase().includes(term)
  );
}
async loadViews(): Promise<void> {
  this.isLoading = true;

  try {
    const res: any = await this.http
      .get(`${environment.apiUrl}/profile-views/all`)
      .toPromise();

    this.views = res?.data || [];

  } catch (err) {
    console.error('Profile views load error:', err);
    this.views = [];
  } finally {
    this.ngZone.run(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }
}
}