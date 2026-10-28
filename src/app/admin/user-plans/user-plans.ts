import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-plans',
  standalone: true,
 imports: [CommonModule, FormsModule],
  templateUrl: './user-plans.html',
  styleUrls: ['./user-plans.scss']
})
export class UserPlans implements OnInit {

  

  profileId = '';
  profileCode = '';


  plans: any[] = [];
  isLoading = false;
  isAssigning = false;
paymentMode = 'Cash';
selectedPlan: any = null;
showPaymentPopup = false;

paymentModes = [
  'Cash',
  'Razorpay',
  'Cheque',
  'UPI',
  'Bank Transfer'
];
constructor(
  private route: ActivatedRoute,
  public router: Router,
  private ngZone: NgZone,
  private cd: ChangeDetectorRef,
  private http: HttpClient
) {}

  async ngOnInit(): Promise<void> {
    this.profileId = this.route.snapshot.queryParamMap.get('profile_id') || '';
    this.profileCode = this.route.snapshot.queryParamMap.get('profile_code') || '';

    await this.loadPlans();
   
  }

async loadPlans(): Promise<void> {
  this.ngZone.run(() => {
    this.isLoading = true;
    this.plans = [];
    this.cd.detectChanges();
  });

  try {
    const res: any = await this.http
      .get(`${environment.apiUrl}/masters/plans`)
      .toPromise();

    this.plans = (res?.data || []).filter((p: any) => p.isActive !== false);

  } catch (err: any) {
    alert(err?.error?.message || 'Failed to load plans');
  } finally {
    this.ngZone.run(() => {
      this.isLoading = false;
      this.cd.detectChanges();
    });
  }
}

askPaymentMode(plan: any): void {
  this.selectedPlan = plan;
  this.paymentMode = 'Cash';
  this.showPaymentPopup = true;
}

closePaymentPopup(): void {
  this.showPaymentPopup = false;
  this.selectedPlan = null;
}

confirmPaymentMode(): void {
  if (!this.selectedPlan) {
    return;
  }

  this.showPaymentPopup = false;
  this.assignPlan(this.selectedPlan);
}
async assignPlan(plan: any): Promise<void> {
  if (!this.profileId) {
    alert('Profile id missing');
    return;
  }

  if (this.isAssigning) return;

  this.isAssigning = true;

  try {
    await this.http
      .post(`${environment.apiUrl}/subscription/admin-assign`, {
        profile_id: this.profileId,
        plan_id: plan._id,
        payment_mode: this.paymentMode
      })
      .toPromise();

    alert('Package assigned successfully');
    this.router.navigate(['/admin/profiles']);

  } catch (err: any) {
    alert(err?.error?.message || 'Package assign failed');
  } finally {
    this.isAssigning = false;
  }
}
}