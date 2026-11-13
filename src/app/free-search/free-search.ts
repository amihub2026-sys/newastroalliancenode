
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  debounceTime,
  finalize,
  Subject,
  timeout
} from 'rxjs';

import { environment } from '../../environments/environment';
import { LanguageService } from '../core/services/language.service';
import { PublicSearchFilters } from './search-filters/search-filters';
import { PublicCard } from '../shared/public-card/public-card';

import {
  EMPTY_FILTERS,
  FilterOptions,
  PublicProfile,
  SearchFilters,
  countFilters,
  makeOptions,
  matchesProfile,
  toPublicProfile
} from './models/search.models';

@Component({
  selector: 'app-free-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    PublicSearchFilters,
    PublicCard
  ],
  templateUrl: './free-search.html',
  styleUrl: './free-search.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class FreeSearch implements OnInit {

  private readonly http = inject(HttpClient);

  // Public profile requests do not need login headers.
  private readonly publicHttp = new HttpClient(
    inject(HttpBackend)
  );

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly language = inject(LanguageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly searchChanges = new Subject<void>();

  private readonly apiOrigin =
    environment.apiUrl.replace(/\/api\/?$/, '');

  // ==========================================
  // PAGINATION
  // ==========================================

  readonly pageSize = 12;
  displayed = this.pageSize;

  // ==========================================
  // INFINITE SCROLL — AUTO LOAD 12 PROFILES
  // ==========================================

  private profileObserver: IntersectionObserver | null = null;

  @ViewChild('autoLoadTrigger')
  set autoLoadTrigger(
    element: ElementRef<HTMLElement> | undefined
  ) {
    this.profileObserver?.disconnect();
    this.profileObserver = null;

    if (
      !element ||
      !isPlatformBrowser(this.platformId)
    ) {
      return;
    }

    this.profileObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          !entry?.isIntersecting ||
          this.loading ||
          this.isLoadingMore ||
          !this.hasMoreProfiles
        ) {
          return;
        }

        // Load the next 12 profiles automatically.
        this.showMoreProfiles();
      },
      {
        root: null,
        rootMargin: '0px 0px 320px 0px',
        threshold: 0
      }
    );

    this.profileObserver.observe(element.nativeElement);
  }

  get visibleResults(): PublicProfile[] {
    return this.results.slice(0, this.displayed);
  }

  get hasMoreProfiles(): boolean {
    return this.displayed < this.results.length;
  }

  // ==========================================
  // INFINITE SCROLL — 2 SECOND LOADING DELAY
  // ==========================================

  isLoadingMore = false;

  private loadMoreTimer:
    ReturnType<typeof setTimeout> | null = null;

  showMoreProfiles(): void {
    if (
      this.loading ||
      this.isLoadingMore ||
      !this.hasMoreProfiles
    ) {
      return;
    }

    // Show loading animation immediately.
    this.isLoadingMore = true;
    this.cdr.markForCheck();

    // Wait 2 seconds before showing next 12 profiles.
    this.loadMoreTimer = setTimeout(() => {
      this.displayed = Math.min(
        this.displayed + this.pageSize,
        this.results.length
      );

      this.isLoadingMore = false;
      this.loadMoreTimer = null;

      this.cdr.markForCheck();
    }, 2000);
  }

  // Compatibility with existing loadMore() calls.
  loadMore(): void {
    this.showMoreProfiles();
  }

  // ==========================================
  // PROFILE DATA
  // ==========================================

  readonly initialOptions = makeOptions([]);

  options: FilterOptions = this.initialOptions;

  profiles: PublicProfile[] = [];
  results: PublicProfile[] = [];

  filters: SearchFilters = {
    ...EMPTY_FILTERS
  };

  loading = true;
  error = false;

  search = '';

  sortBy: 'recent' | 'ageAsc' | 'ageDesc' = 'recent';

  mobileFilterOpen = false;
  hasHeights = false;

  // ==========================================
  // LANGUAGE
  // ==========================================

  get lang(): 'en' | 'ta' {
    return this.language.currentLang;
  }

  text(en: string, ta: string): string {
    return this.lang === 'ta' ? ta : en;
  }

  get activeFilters(): number {
    return (
      countFilters(this.filters) +
      (this.search.trim() ? 1 : 0)
    );
  }

  // ==========================================
  // MEMBER PROFILE MATCHING
  // ==========================================

  memberGender = '';
  memberReligion = '';
  memberCaste = '';
  memberUserId = '';
  memberProfileId = '';

  // ==========================================
  // INITIALIZATION
  // ==========================================

  async ngOnInit(): Promise<void> {
    this.restoreState(
      this.route.snapshot.queryParamMap.get('s')
    );

    this.searchChanges
      .pipe(
        debounceTime(250),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.refresh();
        this.persistState();
      });

    this.load();
  }

  // ==========================================
  // RETURN STATE
  // ==========================================

  get returnState(): string {
    return JSON.stringify({
      filters: this.filters,
      q: this.search,
      sort: this.sortBy,
      visible: this.displayed
    });
  }

  private restoreState(raw: string | null): void {
    if (!raw || raw.length > 4500) {
      return;
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      if (
        !parsed ||
        typeof parsed !== 'object'
      ) {
        return;
      }

      const state = parsed as Record<string, unknown>;

      if (
        state['filters'] &&
        typeof state['filters'] === 'object' &&
        !Array.isArray(state['filters'])
      ) {
        const incoming =
          state['filters'] as Record<string, unknown>;

        const next: SearchFilters = {
          ...EMPTY_FILTERS
        };

        for (
          const key of Object.keys(next) as
            (keyof SearchFilters)[]
        ) {
          const val = incoming[key];

          if (
            key === 'hobbies' ||
            key === 'sharedHobbiesOnly'
          ) {
            // Ignore old hobby filters from saved URLs.
            continue;
          } else if (
            key === 'photoOnly' ||
            key === 'noCastePreferenceOnly'
          ) {
            (
              next as unknown as Record<string, unknown>
            )[key] = val === true;
          } else if (typeof next[key] === 'string') {
            (
              next as unknown as Record<string, unknown>
            )[key] =
              typeof val === 'string'
                ? val.slice(0, 150)
                : '';
          } else {
            (
              next as unknown as Record<string, unknown>
            )[key] =
              typeof val === 'number' &&
              Number.isFinite(val)
                ? val
                : null;
          }
        }

        this.filters = next;
      }

      this.search =
        typeof state['q'] === 'string'
          ? state['q'].slice(0, 120)
          : '';

      const sort = state['sort'];

      if (
        sort === 'recent' ||
        sort === 'ageAsc' ||
        sort === 'ageDesc'
      ) {
        this.sortBy = sort;
      }

      const visible = state['visible'];

      if (
        typeof visible === 'number' &&
        Number.isInteger(visible)
      ) {
        this.displayed = Math.max(
          this.pageSize,
          Math.min(240, visible)
        );
      }
    } catch {
      // Ignore invalid saved state.
    }
  }

  private persistState(): void {
    const s = this.returnState;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { s },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // ==========================================
  // LOAD APPROVED PROFILES
  // ==========================================

  load(): void {
    this.loading = true;
    this.error = false;

    this.publicHttp
      .get<unknown>(`${environment.apiUrl}/profile`)
      .pipe(
        timeout(30000),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          const data = response as {
            data?: unknown;
            profiles?: unknown;
          };

          const raw = Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.profiles)
              ? data.profiles
              : [];

          // The public mapper filters out profiles
          // that are not approved and published.
          this.profiles = raw
            .map(record =>
              toPublicProfile(
                record,
                this.apiOrigin
              )
            )
            .filter(
              (p): p is PublicProfile => p !== null
            );

          // Check whether the existing API provides
          // No Caste Preference information.
          const hasNoCastePreferenceData = this.profiles.some(
            profile =>
              typeof profile.noCastePreference === 'boolean'
          );

          // Disable the active preference filter if the
          // API does not provide the required information.
          if (
            !hasNoCastePreferenceData &&
            this.filters.noCastePreferenceOnly
          ) {
            this.filters = {
              ...this.filters,
              noCastePreferenceOnly: false
            };

            this.persistState();
          }

          this.options = makeOptions(this.profiles);

          this.hasHeights = this.profiles.some(
            p => p.heightCm !== null
          );

          // Preserve the restored visible count.
          this.refresh(false);

          this.cdr.markForCheck();
          this.restoreScrollPosition();
        },

        error: (err) => {
          console.error(
            'Unable to load public profiles:',
            err
          );

          this.error = true;
          this.profiles = [];
          this.results = [];
          this.options = makeOptions([]);

          this.cdr.markForCheck();
        }
      });
  }

  // ==========================================
  // RESTORE SEARCH SCROLL POSITION
  // ==========================================

  private restoreScrollPosition(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const saved = Number(
        sessionStorage.getItem('astro_search_scroll')
      );

      sessionStorage.removeItem('astro_search_scroll');

      if (
        Number.isFinite(saved) &&
        saved > 0
      ) {
        setTimeout(() => {
          window.scrollTo({
            top: saved,
            behavior: 'auto'
          });
        }, 120);
      }
    } catch {
      // Ignore restricted session storage.
    }
  }

  // ==========================================
  // SEARCH AND SORTING
  // ==========================================

  onSearchChange(): void {
    this.searchChanges.next();
  }

  onSortChange(): void {
    this.refresh();
    this.persistState();
  }

  changeFilters(next: SearchFilters): void {
    this.filters = {
      ...next
    };

    this.refresh();
    this.persistState();
  }

  private refresh(resetPage = true): void {
    const items = this.profiles.filter(
      p => matchesProfile(
        p,
        this.filters,
        this.search,
        null
      )
    );

    this.results = [...items].sort((a, b) => {
      switch (this.sortBy) {
        case 'ageAsc':
          return (
            (a.age ?? 999) -
            (b.age ?? 999)
          );

        case 'ageDesc':
          return (
            (b.age ?? 0) -
            (a.age ?? 0)
          );

        default:
          return (
            (Date.parse(b.updatedAt) || 0) -
            (Date.parse(a.updatedAt) || 0)
          );
      }
    });

    // Reset pagination only when filters or
    // sorting change, not on Show More.
    if (resetPage) {
      this.displayed = this.pageSize;
    }

    this.cdr.markForCheck();
  }

  // ==========================================
  // RESET ALL FILTERS
  // ==========================================

  reset(): void {
    this.search = '';
    this.sortBy = 'recent';

    this.filters = {
      ...EMPTY_FILTERS
    };

    this.refresh();
    this.persistState();
  }
}
