import { Component, OnInit, OnDestroy, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { distinctUntilChanged, map, Subscription, timeout, catchError, throwError } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../environments/environment';
import { LanguageService } from '../core/services/language.service';
import { AuthService } from '../services/auth.service';
import { PublicProfile, toPublicProfile } from '../free-search/models/search.models';
import { PhotoLightbox } from '../shared/photo-lightbox/photo-lightbox';
import { PublicProfileValuePipe } from '../shared/public-profile-value.pipe';

@Component({selector:'app-public-profile',standalone:true,imports:[CommonModule,RouterLink,PublicProfileValuePipe,PhotoLightbox],templateUrl:'./public-profile.html',styleUrl:'./public-profile.scss'})
export class PublicProfilePreview implements OnInit, OnDestroy {
  private route=inject(ActivatedRoute);
  private http=inject(HttpClient);
  private language=inject(LanguageService);
  private auth=inject(AuthService);
  private readonly destroyRef=inject(DestroyRef);
  private request?: Subscription;
  profileCode = '';
  get returnState(): string {return this.route.snapshot.queryParamMap.get('s') || '';}
  get backRoute(): string {return this.route.snapshot.queryParamMap.get('source') === 'profiles' && this.loggedIn ? '/profiles' : '/free-search';}
  errorKind: 'timeout'|'network'|'server' = 'server';
  readonly origin=environment.apiUrl.replace(/\/api\/?$/,'');
  profile: PublicProfile|null=null;
  lightboxOpen = false;
  photoFailed = false;
  loading=true;
  error=false;
  get lang(){return this.language.currentLang;}
  get loggedIn(){return this.auth.isLoggedIn();}
  t(en:string,ta:string){return this.lang==='ta'?ta:en;}
  get displayName():string { return (this.lang==='ta' ? (this.profile?.nameTa || this.profile?.name) : (this.profile?.name || this.profile?.nameTa)) || this.t('Name not publicly available','பெயர் பொதுவில் இல்லை'); }
  get avatar(){
    const g=(this.profile?.gender||'').toLowerCase();
    return g.includes('female')||g.includes('பெண்') ? 'assets/avatars/female.svg':g.includes('male')||g.includes('ஆண்')?'assets/avatars/male.svg':'assets/avatars/person.svg';
  }
  onImageError(ev:Event){const img=ev.target as HTMLImageElement; this.photoFailed=true; if(!img.src.endsWith(this.avatar)) { img.onerror=null; img.src=this.avatar; }}
  get publicPhotos(): string[] { return [this.photoFailed ? this.avatar : (this.profile?.image || this.avatar)]; }
  openPhoto(): void { this.lightboxOpen = true; }
  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => params.get('code')?.trim() || ''),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(code => this.loadProfile(code));
  }
  ngOnDestroy(): void { this.request?.unsubscribe(); }
  retry(): void { this.loadProfile(this.profileCode); }

  private loadProfile(code: string): void {
    this.request?.unsubscribe();
    this.profileCode = code;
    this.profile = null;
    this.photoFailed = false;
    this.error = false;
    this.loading = !!code;
    if (!code) return;
    const singleUrl = `${environment.apiUrl}/profile/public/${encodeURIComponent(code)}`;
    this.request = this.http.get<{data?:unknown}>(singleUrl).pipe(
      timeout(12000),
      map(res => toPublicProfile(res?.data, this.origin)),
      catchError(err => {
        // Only fall back when the deployed server does not implement the route.
        const missingRoute = err instanceof HttpErrorResponse && err.status === 404;
        if (!missingRoute) return throwError(() => err);
        return this.http.get<{data?:unknown;profiles?:unknown}>(`${environment.apiUrl}/profile`).pipe(
          timeout(12000),
          map(res => {
            const records = Array.isArray(res?.data) ? res.data :
              Array.isArray(res?.profiles) ? res.profiles : [];
            return records.map(row => toPublicProfile(row, this.origin))
              .find((item):item is PublicProfile => !!item && item.code.toLowerCase() === code.toLowerCase()) || null;
          })
        );
      })
    ).subscribe({
      next: profile => { this.profile = profile; this.loading = false; },
      error: err => {
        this.loading = false; this.error = true;
        this.errorKind = err?.name === 'TimeoutError' ? 'timeout' :
          (err instanceof HttpErrorResponse && err.status === 0 ? 'network' : 'server');
      }
    });
  }
}
