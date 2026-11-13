
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicProfileValuePipe } from '../../shared/public-profile-value.pipe';

import {
  EMPTY_FILTERS,
  FilterOptions,
  FilterStringKey,
  HOBBIES,
  PublicProfile,
  SearchFilters,
  normalized
} from '../models/search.models';

@Component({
  selector: 'app-public-search-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PublicProfileValuePipe
  ],
  templateUrl: './search-filters.html',
  styleUrl: './search-filters.scss'
})
export class PublicSearchFilters {
  @Input()
  mode: 'public' | 'member' = 'public';

  @Input({ required: true })
  filters: SearchFilters = {
    ...EMPTY_FILTERS,
    hobbies: []
  };

  @Input({ required: true })
  options!: FilterOptions;

  @Input()
  facetProfiles: readonly PublicProfile[] = [];

  @Input()
  lang: 'en' | 'ta' = 'en';

  // Retained for compatibility with existing templates.
  @Input() hasHeights = false;
  @Input() hasHobbies = false;
  @Input() nearbyReady = false;
  @Input() nearbyError = '';

  @Output()
  filtersChange = new EventEmitter<SearchFilters>();

  @Output()
  nearbyRequested = new EventEmitter<void>();

  @Output()
  closeRequested = new EventEmitter<void>();

  readonly hobbies = HOBBIES;

  readonly ages = Array.from(
    { length: 53 },
    (_, index) => index + 18
  );

  text(en: string, ta: string): string {
    return this.lang === 'ta' ? ta : en;
  }

  // Enable only when the API explicitly includes
  // No Caste Preference information.
  get hasNoCastePreferenceData(): boolean {
    return this.facetProfiles.some(
      p => typeof p.noCastePreference === 'boolean'
    );
  }

  values(field: FilterStringKey): string[] {
    // State depends on selected country.
    if (
      field === 'state' &&
      this.filters.country
    ) {
      return this.distinct(
        this.facetProfiles
          .filter(
            p =>
              normalized(p.country) ===
              normalized(this.filters.country)
          )
          .map(p => p.state)
      );
    }

    // City depends on selected state.
    if (
      field === 'city' &&
      this.filters.state
    ) {
      return this.distinct(
        this.facetProfiles
          .filter(
            p =>
              normalized(p.state) ===
              normalized(this.filters.state)
          )
          .map(p => p.city)
      );
    }

    // Caste depends on selected religion.
    if (
      field === 'caste' &&
      this.filters.religion
    ) {
      return this.distinct(
        this.facetProfiles
          .filter(
            p =>
              normalized(p.religion) ===
              normalized(this.filters.religion)
          )
          .map(p => p.caste)
      );
    }

    // Sub Caste depends on selected caste.
    if (
      field === 'subCaste' &&
      this.filters.caste
    ) {
      return this.distinct(
        this.facetProfiles
          .filter(
            p =>
              normalized(p.caste) ===
              normalized(this.filters.caste)
          )
          .map(p => p.subCaste)
      );
    }

    return this.options?.[field] ?? [];
  }

  setValue(
    field: FilterStringKey,
    value: string
  ): void {
    const next: SearchFilters = {
      ...this.filters,
      [field]: value
    };

    if (field === 'country') {
      next.state = '';
      next.city = '';
      next.district = '';
    }

    if (field === 'state') {
      next.city = '';
      next.district = '';
    }

    if (field === 'religion') {
      next.caste = '';
      next.subCaste = '';
    }

    if (field === 'caste') {
      next.subCaste = '';
    }

    this.emit(next);
  }

  private distinct(items: string[]): string[] {
    return Array.from(
      new Set(items.filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
  }

  setNumber(
    field: 'ageFrom' | 'ageTo',
    value: number | string | null
  ): void {
    const num =
      value === '' || value === null
        ? null
        : Number(value);

    const next: SearchFilters = {
      ...this.filters,
      [field]:
        num !== null && Number.isFinite(num)
          ? num
          : null
    };

    if (
      field === 'ageFrom' &&
      next.ageFrom !== null &&
      next.ageTo !== null &&
      next.ageFrom > next.ageTo
    ) {
      next.ageTo = next.ageFrom;
    }

    if (
      field === 'ageTo' &&
      next.ageTo !== null &&
      next.ageFrom !== null &&
      next.ageTo < next.ageFrom
    ) {
      next.ageFrom = next.ageTo;
    }

    this.emit(next);
  }

  setPhoto(checked: boolean): void {
    this.emit({
      ...this.filters,
      photoOnly: checked
    });
  }

  setNoCastePreference(checked: boolean): void {
    if (
      checked &&
      !this.hasNoCastePreferenceData
    ) {
      return;
    }

    this.emit({
      ...this.filters,
      noCastePreferenceOnly: checked
    });
  }

  clear(): void {
    this.emit({
      ...EMPTY_FILTERS,
      hobbies: []
    });
  }

  private emit(next: SearchFilters): void {
    this.filtersChange.emit(next);
  }
}
