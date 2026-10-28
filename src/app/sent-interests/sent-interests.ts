import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-sent-interests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sent-interests.html',
  styleUrls: ['./sent-interests.scss']
})
export class SentInterests implements OnInit {
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  http = inject(HttpClient);
apiUrl = environment.apiUrl;
  isBrowser = isPlatformBrowser(this.platformId);

  isLoading = false;
  interests: any[] = [];
 

async ngOnInit(): Promise<void> {
  if (!this.isBrowser) return;

  setTimeout(async () => {
    await this.loadSentInterests();
  }, 0);
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

async loadSentInterests(): Promise<void> {
  this.isLoading = true;
  this.interests = [];
  this.cdr.detectChanges();

  try {
    const storedUser = this.getStoredLoggedInUser();

    const loggedUserId =
      storedUser?._id ||
      storedUser?.id ||
      storedUser?.userId ||
      storedUser?.user_id;

    if (!loggedUserId) {
      this.showMessage('User not found');
      return;
    }

    const res: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/interests/sent/${loggedUserId}`)
    );

    this.interests = res?.data || [];
  } catch (err: any) {
    this.showMessage(err?.error?.message || 'Unable to load sent interests');
  } finally {
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}

  viewProfile(item: any): void {
    if (!item?.receiver?.profile_code) {
      this.showMessage('Profile not found');
      return;
    }

    this.router.navigate(['/free-profile', item.receiver.profile_code]);
  }
}