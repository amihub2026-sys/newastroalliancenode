import {
  Component,
  OnInit,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MasterService } from '../../services/master.service';
import {
  Plan,
  PlanPayload
} from '../../interfaces/master/plan.interface';

declare const convertThis: any;

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plans.html',
  styleUrls: ['./plans.scss']
})
export class Plans implements OnInit {

  isLoading = true;
  isSaving = false;

  plans: Plan[] = [];

  showPlanModal = false;
  editingPlan: Plan | null = null;

  planForm = {
    planNameEn: '',
    planNameTa: '',
    descriptionEn: '',
    descriptionTa: '',
    price: null as any,
    durationInDays: null as any,
    contactLimit: null as any,
    profileViewLimit: null as any,
    featuresEnText: '',
    featuresTaText: ''
  };

  constructor(
    private masterService: MasterService,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef
  ) {}

  get currentLang(): 'en' | 'ta' {
    if (typeof window === 'undefined') return 'en';
    return (localStorage.getItem('tm_language') as 'en' | 'ta') || 'en';
  }

  txt(en: string, ta: string): string {
    return this.currentLang === 'ta' ? ta : en;
  }

  tamilTyping(event: KeyboardEvent): void {
    convertThis(event, 4);

    setTimeout(() => {
      const input = event.target as HTMLInputElement | HTMLTextAreaElement;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, 0);
  }

  syncPlanNameTa(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.planForm.planNameTa = input.value;
  }

  syncDescriptionTa(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.planForm.descriptionTa = input.value;
  }

  syncFeaturesTa(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.planForm.featuresTaText = input.value;
  }

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.isLoading = true;

    this.masterService.getPlans().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.plans = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Plan load error:', err);
        this.ngZone.run(() => {
          this.plans = [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      }
    });
  }

  openAddPlan(): void {
    this.editingPlan = null;

    this.planForm = {
      planNameEn: '',
      planNameTa: '',
      descriptionEn: '',
      descriptionTa: '',
      price: null as any,
      durationInDays: null as any,
      contactLimit: null as any,
      profileViewLimit: null as any,
      featuresEnText: '',
      featuresTaText: ''
    };

    this.showPlanModal = true;
  }

  editPlan(plan: Plan): void {
    this.editingPlan = plan;

    this.planForm = {
      planNameEn: plan.planNameEn || '',
      planNameTa: plan.planNameTa || '',
      descriptionEn: plan.descriptionEn || '',
      descriptionTa: plan.descriptionTa || '',
      price: plan.price ?? null,
      durationInDays: plan.durationInDays ?? null,
      contactLimit: plan.contactLimit ?? null,
      profileViewLimit: plan.profileViewLimit ?? null,
      featuresEnText: (plan.featuresEn || []).join('\n'),
      featuresTaText: (plan.featuresTa || []).join('\n')
    };

    this.showPlanModal = true;
  }

  savePlan(): void {
    if (this.isSaving) return;

    if (
      !this.planForm.planNameEn.trim() ||
      !this.planForm.planNameTa.trim() ||
      this.planForm.price === null ||
      this.planForm.durationInDays === null
    ) {
      alert(this.txt('Please fill required fields', 'தேவையான விவரங்களை நிரப்பவும்'));
      return;
    }

    const payload: PlanPayload = {
      planNameEn: this.planForm.planNameEn.trim(),
      planNameTa: this.planForm.planNameTa.trim(),
      descriptionEn: this.planForm.descriptionEn.trim(),
      descriptionTa: this.planForm.descriptionTa.trim(),
      price: Number(this.planForm.price),
      durationInDays: Number(this.planForm.durationInDays),
      contactLimit: Number(this.planForm.contactLimit || 0),
      profileViewLimit: Number(this.planForm.profileViewLimit || 0),
      featuresEn: this.planForm.featuresEnText
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean),
      featuresTa: this.planForm.featuresTaText
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean)
    };

    this.isSaving = true;

    const request = this.editingPlan
      ? this.masterService.updatePlan(this.editingPlan._id, payload)
      : this.masterService.createPlan(payload);

    request.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.showPlanModal = false;
          this.loadPlans();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Save plan error:', err);
        this.isSaving = false;
        alert(
          err?.error?.message ||
          this.txt('Failed to save plan', 'திட்டத்தை சேமிக்க முடியவில்லை')
        );
      }
    });
  }

  deletePlan(plan: Plan): void {
    if (!confirm(this.txt('Disable this plan?', 'இந்த திட்டத்தை முடக்கவா?'))) return;

    this.masterService.deletePlan(plan._id).subscribe({
      next: () => this.loadPlans(),
      error: (err) => {
        console.error('Delete plan error:', err);
        alert(err?.error?.message || 'Failed to disable plan');
      }
    });
  }
}