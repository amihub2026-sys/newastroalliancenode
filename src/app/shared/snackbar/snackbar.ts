
import {
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import {
  SnackbarService,
  SnackbarType,
  SnackbarData
} from '../snackbar.service';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.html',
  styleUrls: ['./snackbar.scss']
})
export class SnackbarComponent implements OnInit, OnDestroy {

  visible = false;

  message = '';
  title = '';

  type: SnackbarType = 'success';

  private sub?: Subscription;

  private queue: SnackbarData[] = [];

  constructor(
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  // ==========================================
  // LISTEN FOR GLOBAL NOTIFICATIONS
  // ==========================================

  ngOnInit(): void {

    this.sub = this.snackbarService.snackbar$
      .subscribe(data => {

        this.zone.run(() => {

          if (!data) {

            this.showNextNotification();

            return;
          }

          // KEEP UNREAD NOTIFICATION VISIBLE

          if (this.visible) {

            this.queue.push(data);

            return;
          }

          this.showNotification(data);

        });

      });

  }

  // ==========================================
  // DISPLAY NOTIFICATION
  // ==========================================

  private showNotification(data: SnackbarData): void {

    this.message = data.message;

    this.title = data.title || '';

    this.type = data.type;

    this.visible = true;

    this.cdr.markForCheck();

  }

  // ==========================================
  // MANUALLY CLOSE NOTIFICATION
  // ==========================================

  close(): void {

    this.snackbarService.dismiss();

  }

  // ==========================================
  // DISPLAY NEXT QUEUED NOTIFICATION
  // ==========================================

  private showNextNotification(): void {

    this.visible = false;

    this.message = '';

    this.title = '';

    const next = this.queue.shift();

    if (next) {

      this.showNotification(next);

    }

    this.cdr.markForCheck();

  }

  // ==========================================
  // NOTIFICATION ICON
  // ==========================================

  get notificationIcon(): string {

    switch (this.type) {

      case 'success':
        return '✓';

      case 'error':
        return '!';

      case 'warning':
        return '⚠';

      case 'info':
        return 'i';

      default:
        return 'i';

    }

  }

  // ==========================================
  // CLEANUP
  // ==========================================

  ngOnDestroy(): void {

    this.sub?.unsubscribe();

    this.queue = [];

  }

}
