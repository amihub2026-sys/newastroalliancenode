import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';

export type FlowMode = 'NORMAL' | 'BIODATA_EDIT';

@Injectable({
  providedIn: 'root'
})
export class UserFlowService {

  private storageKey = 'user_flow_state';

  private state = {
    mode: 'NORMAL' as FlowMode,
    user_id: '',
    gender: '',
    biodata_completed: false,
    payment_done: false,
    admin_approved: false,
    plan_active: false,
    profile_status: '',
    next_route: '/biodata',
    active_plan_code: '',
    contacts_used: 0,
    total_contacts_allowed: 0
  };

  constructor(
    private authService: AuthService
  ) {
    this.loadFromStorage();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' &&
           typeof localStorage !== 'undefined';
  }

  getState() {
    return this.state;
  }

  getNextRoute(): string {
    return this.state.next_route || '/biodata';
  }

  setState(data: Partial<typeof this.state>) {
    this.state = {
      ...this.state,
      ...data
    };

    this.saveToStorage();
  }

  setMode(mode: FlowMode) {
    this.state.mode = mode;
    this.saveToStorage();
  }

  isBiodataCompleted(): boolean {
    return this.state.biodata_completed;
  }

  isPaymentDone(): boolean {
    return this.state.payment_done;
  }

  isAdminApproved(): boolean {
    return this.state.admin_approved;
  }

  isEditMode(): boolean {
    return this.state.mode === 'BIODATA_EDIT';
  }

  isMale(): boolean {
    const gender = String(this.state.gender || '').toLowerCase();
    return gender === 'male' || gender === 'ஆண்';
  }

  isFemale(): boolean {
    const gender = String(this.state.gender || '').toLowerCase();
    return gender === 'female' || gender === 'பெண்';
  }

  hasPlanLimit(): boolean {
    return Number(this.state.total_contacts_allowed || 0) > 0;
  }

  isPlanCountOver(): boolean {
    return (
      Number(this.state.total_contacts_allowed || 0) > 0 &&
      Number(this.state.contacts_used || 0) >=
      Number(this.state.total_contacts_allowed || 0)
    );
  }

  async syncFromServer(): Promise<typeof this.state> {
    if (!this.isBrowser()) {
      return this.state;
    }

    const token = localStorage.getItem('matrimony_token');

    if (!token) {
      this.resetFlow();
      return this.state;
    }

    try {
      const response: any = await firstValueFrom(
        this.authService.getUserFlowStatus()
      );

      const flow = response?.data;

      if (!flow) {
        this.resetFlow();
        return this.state;
      }

      this.state = {
        ...this.state,

        user_id: this.getCurrentUserId(),
        gender: flow.gender || '',

        biodata_completed:
          flow.hasProfile === true &&
          flow.profileStatus !== 'draft' &&
          flow.profileStatus !== 'not_created',

        payment_done:
          flow.hasRegistrationPayment === true,

        admin_approved:
          flow.profileStatus === 'approved' &&
          flow.isPublished === true,

        plan_active:
          flow.hasRegistrationPayment === true,

        profile_status:
          flow.profileStatus || '',

        next_route:
          flow.nextRoute || '/biodata',

        active_plan_code: '',
        contacts_used: 0,
        total_contacts_allowed: 0
      };

      this.saveToStorage();

      return this.state;

    } catch (error) {
      console.error('User flow sync error:', error);
      return this.state;
    }
  }

  private getCurrentUserId(): string {
    if (!this.isBrowser()) return '';

    try {
      const rawUser = localStorage.getItem('matrimony_user');
      const user = rawUser ? JSON.parse(rawUser) : null;

      return (
        user?.user_id ||
        localStorage.getItem('app_user_id') ||
        ''
      );
    } catch {
      return localStorage.getItem('app_user_id') || '';
    }
  }

  resetFlow(): void {
    this.state = {
      mode: 'NORMAL',
      user_id: '',
      gender: '',
      biodata_completed: false,
      payment_done: false,
      admin_approved: false,
      plan_active: false,
      profile_status: '',
      next_route: '/biodata',
      active_plan_code: '',
      contacts_used: 0,
      total_contacts_allowed: 0
    };

    this.saveToStorage();
  }

  private saveToStorage(): void {
    if (!this.isBrowser()) return;

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.state)
    );
  }

  private loadFromStorage(): void {
    if (!this.isBrowser()) return;

    const data = localStorage.getItem(this.storageKey);

    if (data) {
      try {
        this.state = {
          ...this.state,
          ...JSON.parse(data)
        };
      } catch {
        console.log('Flow state parse error');
      }
    }
  }
}