import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { LanguageService } from '../core/services/language.service';
import { environment } from '../../environments/environment';

interface CurrentMembership { plan_id:string; plan_name:string; plan_name_ta?:string; duration_days?:number; payment_mode?:string; is_active:boolean; end_date:string; }
@Component({
  selector:'app-plan-success', standalone:true, imports:[CommonModule],
  templateUrl:'./plan-success.html', styleUrl:'./plan-success.scss'
})
export class PlanSuccess implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly language = inject(LanguageService);
  private readonly cdr = inject(ChangeDetectorRef);
  profileId = '';
  membership: CurrentMembership | null = null;
  loading = true;
  error = '';
  navigating = false;
  get isTamil(): boolean { return this.language.currentLang === 'ta'; }
  get displayName(): string {
    return this.isTamil ? (this.membership?.plan_name_ta || this.membership?.plan_name || '') : (this.membership?.plan_name || '');
  }
  async ngOnInit(): Promise<void> {
    this.profileId = (this.route.snapshot.queryParamMap.get('profileId') || '').trim();
    await this.loadMembership();
  }
  async loadMembership(): Promise<void> {
    if (this.navigating) return;
    this.loading = true;
    this.error = '';
    try {
      const response: any = await firstValueFrom(this.http.get(`${environment.apiUrl}/subscription/current`).pipe(timeout(12000)));
      const value = response?.data as CurrentMembership | undefined;
      if (!response?.success || !value || !value.is_active || new Date(value.end_date).getTime() <= Date.now()) {
        throw new Error('No active membership has been confirmed by the backend.');
      }
      this.membership = value;
    } catch (err: any) {
      this.membership = null;
      this.error = err?.error?.message || err?.message || 'Membership could not be verified. Please try again.';
    } finally { this.loading=false; this.cdr.detectChanges(); }
  }
  viewProfile(): void {
    if (!this.membership || this.navigating) return;
    this.navigating = true;
    void this.router.navigate(this.profileId ? ['/profile-view'] : ['/free-search'], {
      queryParams: this.profileId ? {profileId:this.profileId, selectedPlan:this.membership.plan_name} : {}
    }).finally(()=>{this.navigating=false;});
  }
  backToPlans(): void {
    if (this.navigating) return;
    this.navigating=true;
    void this.router.navigate(['/plans'], {queryParams:this.profileId ? {from:'profiles',profileId:this.profileId} : {}})
      .finally(()=>{this.navigating=false;});
  }
}
