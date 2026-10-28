
import {
  Component,
  OnInit,
  inject,
  DestroyRef,
  ChangeDetectorRef
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timeout, finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { environment } from '../../../environments/environment';
import { LanguageService } from '../../core/services/language.service';

import {
  PublicProfile,
  toPublicProfile
} from '../../free-search/models/search.models';

@Component({
  selector: 'app-home-discovery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-discovery.html',
  styleUrl: './home-discovery.scss'
})
export class HomeDiscovery implements OnInit {

  // ==========================
  // DEPENDENCIES
  // ==========================

  private readonly http = inject(HttpClient);
  private readonly language = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  // ==========================
  // COMPONENT STATE
  // ==========================

  activeProfileIndex = 0;

  profiles: PublicProfile[] = [];

  loading = true;
  error = false;

  readonly origin = environment.apiUrl.replace(/\/api\/?$/, '');

  // ==========================
  // LANGUAGE
  // ==========================

  get lang(): string {
    return this.language.currentLang;
  }

  t(en: string, ta: string): string {
    return this.lang === 'ta' ? ta : en;
  }

  // ==========================
  // INITIALIZATION
  // ==========================

  ngOnInit(): void {
    this.load();
  }

  // ==========================
  // EXPANDING CARD ANIMATION
  // ==========================

  setActiveProfile(index: number): void {
    if (index < 0 || index >= Math.min(this.profiles.length, 3)) {
      return;
    }

    this.activeProfileIndex = index;
    this.cdr.markForCheck();
  }

  // ==========================
  // PROFILE IMAGE FALLBACK
  // ==========================


  
onPhotoError(event: Event): void {
  const img = event.target as HTMLImageElement;
  const fallback = '/assets/matrimony-fallback.jpeg';

  if (img.dataset['fallbackApplied'] === 'true') {
    img.style.display = 'none';
    return;
  }

  img.dataset['fallbackApplied'] = 'true';
  img.src = fallback;
  img.alt = this.t(
    'Illustrative profile image',
    'மாதிரி சுயவிவரப் படம்'
  );
}


  // ==========================
  // LOAD APPROVED PROFILES
  // ==========================

  load(): void {

    this.loading = true;
    this.error = false;

    this.cdr.markForCheck();

    const url = `${environment.apiUrl}/profile`;

    console.log('[HomeDiscovery] Loading profiles:', url);

    this.http.get<unknown>(url)
      .pipe(
        timeout(12000),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({

        next: (response: unknown) => {

          console.log(
            '[HomeDiscovery] API response:',
            response
          );

          console.table(
  this.profiles.map(p => ({
    code: p.code,
    name: p.name,
    image: p.image
  }))
);

          const res = response as {
            data?: unknown;
            profiles?: unknown;
          } | null;

          const data = res?.data as {
            profiles?: unknown;
          } | null | undefined;

          // Support the existing API response structures.
          const raw: unknown[] =
            Array.isArray(res?.data)
              ? res.data
              : Array.isArray(data?.profiles)
                ? data.profiles
                : Array.isArray(res?.profiles)
                  ? res.profiles
                  : Array.isArray(response)
                    ? response
                    : [];

          // Convert backend data into the safe public profile model.
          // toPublicProfile() allows only approved, published members.
          this.profiles = raw
            .map((item: unknown) =>
              toPublicProfile(item, this.origin)
            )
            .filter(
              (profile: PublicProfile | null):
                profile is PublicProfile =>
                profile !== null
            )
            .sort(
              (a: PublicProfile, b: PublicProfile) =>
                (Date.parse(b.updatedAt) || 0) -
                (Date.parse(a.updatedAt) || 0)
            )
            .slice(0, 8);

          // First card expanded by default.
          this.activeProfileIndex = 0;

          this.error = false;

          console.log(
            '[HomeDiscovery] Approved profiles:',
            this.profiles.length
          );

          this.cdr.markForCheck();
        },

        error: (err: unknown) => {

          console.error(
            '[HomeDiscovery] Failed to load profiles:',
            err
          );

          this.error = true;
          this.profiles = [];
          this.activeProfileIndex = 0;

          this.cdr.markForCheck();
        }

      });
  }
}
