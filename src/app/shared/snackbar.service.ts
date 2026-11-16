
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// ==========================================
// SNACKBAR TYPES
// ==========================================

export type SnackbarType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

// ==========================================
// SNACKBAR DATA
// ==========================================

export interface SnackbarData {
  message: string;
  type: SnackbarType;
  title?: string;
}

// ==========================================
// GLOBAL SNACKBAR SERVICE
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  private snackbarSubject =
    new Subject<SnackbarData | null>();

  snackbar$ = this.snackbarSubject.asObservable();

  // SUCCESS MESSAGE

  success(message: string, title?: string): void {
    this.show(message, 'success', title);
  }

  // ERROR MESSAGE

  error(message: string, title?: string): void {
    this.show(message, 'error', title);
  }

  // WARNING MESSAGE

  warning(message: string, title?: string): void {
    this.show(message, 'warning', title);
  }

  // INFORMATION MESSAGE

  info(message: string, title?: string): void {
    this.show(message, 'info', title);
  }

  // SHOW NOTIFICATION

  show(
    message: string,
    type: SnackbarType = 'info',
    title?: string
  ): void {

    this.snackbarSubject.next({
      message,
      type,
      title
    });

  }

  // MANUALLY CLOSE NOTIFICATION

  dismiss(): void {
    this.snackbarSubject.next(null);
  }

}
