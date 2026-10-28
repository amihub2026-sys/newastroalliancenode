import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, finalize, Subject, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { LanguageService } from '../core/services/language.service';
import { PublicSearchFilters } from './search-filters/search-filters';
import { PublicCard } from '../shared/public-card/public-card';
import {
  EMPTY_FILTERS, FilterOptions, GeoPoint, PublicProfile, SearchFilters,
  countFilters, makeOptions, matchesProfile, sharedHobbyCount, toPublicProfile
} from './models/search.models';

/**
 * Guest search is display-only. The API MUST return only approved, published,
 * public fields; hiding data in Angular is NOT an authorization boundary.
 */
@Component({
  selector:'app-free-search', standalone:true,
  imports:[CommonModule,FormsModule,RouterLink,PublicSearchFilters,PublicCard],
  templateUrl:'./free-search.html', styleUrl:'./free-search.scss',
  changeDetection:ChangeDetectionStrategy.Default
})
export class FreeSearch implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly language = inject(LanguageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchChanges = new Subject<void>();
  readonly memberMode = this.route.snapshot.data['memberMode'] === true;

  // Profile filtering is a display convenience; the API must independently
  // enforce approval, publication, ownership and premium field permissions.
  get requiredGender(): 'male' | 'female' | '' {
    if (!this.memberMode || typeof localStorage === 'undefined') return '';
    try {
      const user = JSON.parse(localStorage.getItem('matrimony_user') || '{}');
      const raw = String(user?.gender || user?.gender_text || '').trim().toLowerCase();
      if (['male', 'man', 'groom', 'ஆண்', 'மணமகன்'].includes(raw)) return 'female';
      if (['female', 'woman', 'bride', 'பெண்', 'மணமகள்'].includes(raw)) return 'male';
    } catch { /* no usable gender in session */ }
    return '';
  }
  private isEligibleMemberProfile(profile: PublicProfile): boolean {
    if (!this.memberMode) return true;
    const raw = String(profile.gender || '').trim().toLowerCase();
    const gender = ['female', 'woman', 'bride', 'பெண்', 'மணமகள்'].includes(raw) ? 'female'
      : ['male', 'man', 'groom', 'ஆண்', 'மணமகன்'].includes(raw) ? 'male' : '';
    return !!this.requiredGender && gender === this.requiredGender;
  }
  private readonly apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');
  readonly pageSize = 12;
  readonly initialOptions = makeOptions([]);
  options: FilterOptions = this.initialOptions;
  profiles: PublicProfile[] = [];
  results: PublicProfile[] = [];
  filters: SearchFilters = {...EMPTY_FILTERS,hobbies:[]};
  loading = true;
  error = false;
  search = '';
  sortBy: 'recent'|'ageAsc'|'ageDesc'|'hobbies' = 'recent';
  displayed = this.pageSize;
  /** Serialized, validated filter state carried through the profile URL. */
  get returnState(): string { return JSON.stringify({filters:this.filters,q:this.search,sort:this.sortBy,visible:this.displayed}); }
  mobileFilterOpen = false;
  hasHobbies = false;
  hasHeights = false;
  nearPosition: GeoPoint|null = null;
  nearbyError = '';
  get lang(): 'en'|'ta' {return this.language.currentLang;}
  get activeFilters(): number {return countFilters(this.filters) + (this.search.trim()?1:0);}
  text(en:string,ta:string):string {return this.lang==='ta'?ta:en;}
  ngOnInit():void {
    this.restoreState(this.route.snapshot.queryParamMap.get('s'));
    this.searchChanges.pipe(debounceTime(250),takeUntilDestroyed(this.destroyRef))
      .subscribe(()=>{this.refresh();this.persistState();});
    this.load();
  }
  private restoreState(raw: string | null): void {
    if (!raw || raw.length > 4500) return;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;
      const state = parsed as Record<string,unknown>;
      if (state['filters'] && typeof state['filters'] === 'object' && !Array.isArray(state['filters'])) {
        const incoming = state['filters'] as Record<string, unknown>;
        const next: SearchFilters = {...EMPTY_FILTERS,hobbies:[]};
        for (const key of Object.keys(next) as (keyof SearchFilters)[]) {
          const val = incoming[key];
          if (key === 'hobbies') next.hobbies = Array.isArray(val) ? val.filter((x):x is string => typeof x === 'string').slice(0,16) : [];
          else if (key === 'sharedHobbiesOnly' || key === 'photoOnly') (next as unknown as Record<string,unknown>)[key] = val === true;
          else if (typeof next[key] === 'string') (next as unknown as Record<string,unknown>)[key] = typeof val === 'string' ? val.slice(0,150) : '';
          else (next as unknown as Record<string,unknown>)[key] = typeof val === 'number' && Number.isFinite(val) ? val : null;
        }
        this.filters=next;
      }
      this.search=typeof state['q']==='string' ? state['q'].slice(0,120) : '';
      const sort=state['sort'];
      if (sort==='ageAsc'||sort==='ageDesc'||sort==='recent'||sort==='hobbies') this.sortBy=sort;
      const visible=state['visible'];
      if (typeof visible==='number' && Number.isInteger(visible)) this.displayed=Math.max(this.pageSize,Math.min(240,visible));
    } catch { /* ignore invalid/old bookmark */ }
  }
  private persistState(): void {
    const s=this.returnState;
    // replaceUrl keeps typing/filtering from filling the browser history.
    void this.router.navigate([], {relativeTo:this.route,queryParams:{s},queryParamsHandling:'merge',replaceUrl:true});
  }
  load():void{
    this.loading=true; this.error=false;
    this.http.get<unknown>(`${environment.apiUrl}/profile`).pipe(timeout(12000),takeUntilDestroyed(this.destroyRef),finalize(()=>{this.loading=false;this.cdr.markForCheck();}))
      .subscribe({
        next: response => {
          const data = response as {data?:unknown;profiles?:unknown};
          const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data?.profiles) ? data.profiles : [];
          this.profiles = raw.map(record => toPublicProfile(record,this.apiOrigin))
            .filter((p):p is PublicProfile => p !== null)
            .filter(profile => this.isEligibleMemberProfile(profile));
          this.options = makeOptions(this.profiles);
          this.hasHobbies = this.profiles.some(p=>p.hobbies.length>0);
          this.hasHeights = this.profiles.some(p=>p.heightCm !== null);
          this.refresh(false);
          this.restoreScrollPosition();
        },
        error: () => {this.error=true;this.profiles=[];this.results=[];this.options=makeOptions([]);}
      });
  }
  private restoreScrollPosition():void {
    if (typeof window === 'undefined') return;
    try {
      const saved = Number(sessionStorage.getItem('astro_search_scroll'));
      sessionStorage.removeItem('astro_search_scroll');
      if (Number.isFinite(saved) && saved > 0 && this.returnState) {
        // Angular must render restored result cards before positioning the page.
        setTimeout(() => window.scrollTo({top:saved,behavior:'auto'}), 120);
      }
    } catch { /* storage or window access may be restricted */ }
  }
  onSearchChange():void{this.searchChanges.next();}
  onSortChange():void{this.refresh();this.persistState();}
  changeFilters(next:SearchFilters):void{
    // Defensive guard when backend doesn't expose these attributes.
    this.filters = {...next,hobbies:[...next.hobbies]};
    this.refresh();
    this.persistState();
  }
  private refresh(resetPage=true):void{
    const items=this.profiles.filter(p=>matchesProfile(p,this.filters,this.search,this.nearPosition));
    this.results=[...items].sort((a,b)=>{
      switch(this.sortBy){
        case 'ageAsc':return (a.age??999)-(b.age??999);
        case 'ageDesc':return (b.age??0)-(a.age??0);
        case 'hobbies':return sharedHobbyCount(b,this.filters.hobbies)-sharedHobbyCount(a,this.filters.hobbies);
        default:return (Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0);
      }
    });
    if (resetPage) this.displayed=this.pageSize;
  }
  reset():void{this.search='';this.sortBy='recent';this.filters={...EMPTY_FILTERS,hobbies:[]};this.nearPosition=null;this.refresh();this.persistState();}
  get visibleResults():PublicProfile[]{return this.results.slice(0,this.displayed);}
  loadMore():void{this.displayed+=this.pageSize;this.persistState();}
  hobbyCount(p:PublicProfile):number{return sharedHobbyCount(p,this.filters.hobbies);}
  enableNearby():void{
    if(typeof navigator==='undefined'||!navigator.geolocation){this.nearbyError=this.text('Location not supported by this device.','இந்தச் சாதனத்தில் இருப்பிட வசதி இல்லை.');return;}
    this.nearbyError='';
    navigator.geolocation.getCurrentPosition(
      pos=>{this.nearPosition={lat:pos.coords.latitude,lng:pos.coords.longitude};this.cdr.markForCheck();this.refresh();this.persistState();},
      ()=>{this.nearbyError=this.text('Location permission denied. You can filter by city instead.','இருப்பிட அனுமதி இல்லை. நகரத்தைத் தேர்வு செய்யலாம்.');this.cdr.markForCheck();},
      {enableHighAccuracy:false,timeout:8000,maximumAge:300000}
    );
  }
}
