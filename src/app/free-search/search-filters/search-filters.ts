import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicProfileValuePipe } from '../../shared/public-profile-value.pipe';
import { EMPTY_FILTERS, FilterOptions, FilterStringKey, HOBBIES, PublicProfile, SearchFilters, normalized } from '../models/search.models';

@Component({
  selector: 'app-public-search-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, PublicProfileValuePipe],
  templateUrl: './search-filters.html',
  styleUrl: './search-filters.scss'
})
export class PublicSearchFilters {
  @Input({required: true}) filters: SearchFilters = {...EMPTY_FILTERS, hobbies: []};
  @Input({required: true}) options!: FilterOptions;
  @Input() facetProfiles: readonly PublicProfile[] = [];
  @Input() lang: 'en' | 'ta' = 'en';
  @Input() hasHeights = false;
  @Input() hasHobbies = false;
  @Input() nearbyReady = false;
  @Input() nearbyError = '';
  @Output() filtersChange = new EventEmitter<SearchFilters>();
  @Output() nearbyRequested = new EventEmitter<void>();
  @Output() closeRequested = new EventEmitter<void>();
  readonly hobbies = HOBBIES;
  readonly ages = Array.from({length: 53}, (_,index) => index+18);
  readonly heights = Array.from({length: 22}, (_,index) => index*5+120);
  readonly distances = [5,10,25,50,100,200];
  text(en: string, ta: string): string {return this.lang === 'ta' ? ta : en;}
  values(field: FilterStringKey): string[] {
    // Dependent dropdowns avoid impossible combinations of city/state or caste/religion.
    if (field === 'district' && this.filters.state) {
      return this.distinct(this.facetProfiles.filter(p => normalized(p.state) === normalized(this.filters.state)).map(p => p.district));
    }
    if (field === 'city' && (this.filters.state || this.filters.district)) {
      return this.distinct(this.facetProfiles.filter(p =>
        (!this.filters.state || normalized(p.state) === normalized(this.filters.state)) &&
        (!this.filters.district || normalized(p.district) === normalized(this.filters.district))
      ).map(p => p.city));
    }
    if (field === 'caste' && this.filters.religion) {
      return this.distinct(this.facetProfiles.filter(p => normalized(p.religion) === normalized(this.filters.religion)).map(p => p.caste));
    }
    if (field === 'subCaste' && this.filters.caste) {
      return this.distinct(this.facetProfiles.filter(p => normalized(p.caste) === normalized(this.filters.caste)).map(p => p.subCaste));
    }
    return this.options?.[field] ?? [];
  }
  setValue(field: FilterStringKey, value: string): void {
    const f = {...this.filters, [field]:value};
    if (field === 'state') { f.district = ''; f.city = ''; }
    if (field === 'district') f.city = '';
    if (field === 'religion') { f.caste = ''; f.subCaste = ''; }
    if (field === 'caste') f.subCaste = '';
    this.emit(f);
  }
  private distinct(items: string[]): string[] { return Array.from(new Set(items.filter(Boolean))).sort((a,b)=>a.localeCompare(b)); }
  setNumber(field: 'ageFrom'|'ageTo'|'heightFrom'|'heightTo'|'nearbyKm', value: number | string | null): void {
    const num = value === '' || value === null ? null : Number(value);
    const next = {...this.filters, [field]: num !== null && Number.isFinite(num) ? num : null};
    if (field === 'ageFrom' && next.ageFrom !== null && next.ageTo !== null && next.ageFrom > next.ageTo) next.ageTo = next.ageFrom;
    if (field === 'ageTo' && next.ageTo !== null && next.ageFrom !== null && next.ageTo < next.ageFrom) next.ageFrom = next.ageTo;
    if (field === 'heightFrom' && next.heightFrom !== null && next.heightTo !== null && next.heightFrom > next.heightTo) next.heightTo = next.heightFrom;
    if (field === 'heightTo' && next.heightTo !== null && next.heightFrom !== null && next.heightTo < next.heightFrom) next.heightFrom = next.heightTo;
    this.emit(next);
  }
  setPhoto(checked: boolean): void { this.emit({...this.filters, photoOnly: checked}); }
  setHobby(value: string, checked: boolean): void {
    const hobbies = checked ? Array.from(new Set([...this.filters.hobbies, value])) : this.filters.hobbies.filter(v => v !== value);
    this.emit({...this.filters,hobbies,sharedHobbiesOnly: hobbies.length > 0});
  }
  isSelectedHobby(value: string): boolean {return this.filters.hobbies.includes(value);}
  clear(): void {this.emit({...EMPTY_FILTERS,hobbies:[]});}
  private emit(value: SearchFilters): void {this.filtersChange.emit(value);}
}
