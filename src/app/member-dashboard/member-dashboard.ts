import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { LanguageService } from '../core/services/language.service';
import { PublicProfile, toPublicProfile } from '../free-search/models/search.models';
import { PublicCard } from '../shared/public-card/public-card';

interface DashboardMember {
  fullName?: string;
  gender?: string;
  location?: string;
  profile_code?: string;
}

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PublicCard],
  templateUrl: './member-dashboard.html',
  styleUrl: './member-dashboard.scss'
})
export class MemberDashboard implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  private readonly apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');
  currentUser: DashboardMember = {};
  recommended: PublicProfile[] = [];
  recentlyJoined: PublicProfile[] = [];
  nearby: PublicProfile[] = [];
  loading = true;
  error = false;
  recordingError = false;
  activeMembership: { en: string; ta: string; expiry: string } | null = null;
  audio: HTMLAudioElement | null = null;

  get lang() { return this.language.currentLang; }
  t(en: string, ta: string) { return this.lang === 'ta' ? ta : en; }
  get name() { return this.currentUser.fullName || this.t('Member', 'உறுப்பினர்'); }

  private genderKind(input: string): 'male' | 'female' | '' {
    const value = String(input || '').trim().toLowerCase();
    if (['female', 'woman', 'bride', 'பெண்', 'மணமகள்'].includes(value)) return 'female';
    if (['male', 'man', 'groom', 'ஆண்', 'மணமகன்'].includes(value)) return 'male';
    return '';
  }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      try { this.currentUser = JSON.parse(localStorage.getItem('matrimony_user') || '{}') || {}; }
      catch { this.currentUser = {}; }
    }
    this.loadMatches();
    this.loadMembership();
  }

  /** Display only backend-confirmed membership; selecting a plan is not activation. */
  private loadMembership(): void {
    if (typeof localStorage === 'undefined') return;
    let userId = '';
    try {
      const user = JSON.parse(localStorage.getItem('matrimony_user') || '{}');
      userId = String(user.user_id || user._id || user.id || '').trim();
    } catch { return; }
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) return;
    this.http.get<{success?: boolean;data?: {plan_name?: string;plan_name_ta?: string;end_date?: string;is_active?: boolean}}>(
      `${environment.apiUrl}/subscription/user/${encodeURIComponent(userId)}`
    ).pipe(timeout(7000), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        const data = response?.data;
        if (response?.success && data && data.is_active === true &&
            (!data.end_date || Date.parse(data.end_date) > Date.now())) {
          this.activeMembership = {
            en: String(data.plan_name || 'Active membership'),
            ta: String(data.plan_name_ta || data.plan_name || 'செயலில் உள்ள திட்டம்'),
            expiry: String(data.end_date || '')
          };
        }
      },
      error: () => { /* Basic dashboard must keep working even if subscription API is slow. */ }
    });
  }

  /** Calculate once per response, not on every Angular view check. */
  private setMatches(profiles: PublicProfile[]): void {
    const member = this.currentUser;
    const own = this.genderKind(member.gender || '');
    const required = own === 'male' ? 'female' : own === 'female' ? 'male' : '';
    const eligible = required ? profiles.filter(p =>
      this.genderKind(p.gender) === required && p.code !== member.profile_code
    ) : [];
    const city = String(member.location || '').trim().toLowerCase();
    const date = new Date().toISOString().slice(0, 10);
    const seed = `${date}|${member.profile_code || member.fullName || ''}`;
    const hash = (s: string) => Array.from(s).reduce((h, ch) => Math.imul(h, 31) + ch.charCodeAt(0) | 0, 0);
    this.recommended = [...eligible].sort((a, b) => {
      const am = city && a.city.trim().toLowerCase() === city ? 1 : 0;
      const bm = city && b.city.trim().toLowerCase() === city ? 1 : 0;
      if (am !== bm) return bm - am;
      return (hash(seed + a.code) >>> 0) - (hash(seed + b.code) >>> 0);
    }).slice(0, 5);
    this.recentlyJoined = [...eligible].sort((a, b) =>
      (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0)
    ).slice(0, 5);
    this.nearby = city
      ? eligible.filter(p => p.city.trim().toLowerCase() === city).slice(0, 5)
      : [];
  }

  loadMatches(): void {
    this.loading = true;
    this.error = false;
    this.http.get<any>(`${environment.apiUrl}/profile`).pipe(
      timeout({ first: 12_000 }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: res => {
        const raw: unknown[] = Array.isArray(res?.data) ? res.data
          : Array.isArray(res?.profiles) ? res.profiles : [];
        const profiles = raw.map(x => toPublicProfile(x, this.apiOrigin))
          .filter((x): x is PublicProfile => !!x);
        this.setMatches(profiles);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  async listen(): Promise<void> {
    this.stop(); this.recordingError = false;
    if (typeof Audio === 'undefined') return;
    const player = new Audio(`assets/voice-guide/${this.lang}/dashboard.mp3`);
    this.audio = player;
    player.onerror = () => { this.recordingError = true; this.stop(); };
    try { await player.play(); } catch { this.recordingError = true; }
  }
  stop(): void {
    if (this.audio) { this.audio.pause(); this.audio.currentTime = 0; this.audio = null; }
  }
  ngOnDestroy(): void { this.stop(); }
}
