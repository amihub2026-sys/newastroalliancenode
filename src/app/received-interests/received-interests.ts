import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
@Component({
  selector: 'app-received-interests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './received-interests.html',
  styleUrls: ['./received-interests.scss']
})
export class ReceivedInterests implements OnInit {
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  http = inject(HttpClient);
  authService = inject(AuthService);
  apiUrl = environment.apiUrl;
  isBrowser = isPlatformBrowser(this.platformId);

  isLoading = false;
  interests: any[] = [];

async ngOnInit(): Promise<void> {
  if (!this.isBrowser) return;

  await this.loadReceivedInterests();
}
  private showMessage(message: string): void {
    if (this.isBrowser) {
      window.alert(message);
    } else {

    }
  }

  private getStoredLoggedInUser(): any | null {
    if (!this.isBrowser) return null;

    try {
      const raw = localStorage.getItem('matrimony_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/default-avatar.png';
  }

async loadReceivedInterests(): Promise<void> {
  this.isLoading = true;
  this.interests = [];
  this.cdr.detectChanges();

  try {
    const loggedUserId = this.authService.getCurrentUserId();

    if (!loggedUserId) {
      this.showMessage('User not found');
      return;
    }

    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/interests/received/${loggedUserId}`)
    );

    this.interests = res?.data || [];

  } catch (err: any) {
    this.showMessage(err?.error?.message || 'Unable to load received interests');

  } finally {
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}
viewProfile(item: any): void {
  if (!item?.sender?.profile_code) {
    this.showMessage('Profile code missing');
    return;
  }

  this.router.navigate(['/free-profile', item.sender.profile_code]);
}
async updateStatus(item: any, statusCode: 'accepted' | 'rejected'): Promise<void> {
  try {
    const url =
      statusCode === 'accepted'
        ? `${this.apiUrl}/interests/accept`
        : `${this.apiUrl}/interests/reject`;

    await firstValueFrom(
      this.http.post(url, {
        interestId: item.id || item._id
      })
    );

    item.status_code = statusCode;
    this.cdr.detectChanges();
  } catch {
    this.showMessage('Failed to update interest');
  }
}
}