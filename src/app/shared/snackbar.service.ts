import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type SnackbarType = 'success' | 'error';

export interface SnackbarData {
  message: string;
  type: SnackbarType;
}

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private snackbarSubject = new Subject<SnackbarData>();
  snackbar$ = this.snackbarSubject.asObservable();

  success(message: string): void {
    this.snackbarSubject.next({ message, type: 'success' });
  }

  error(message: string): void {
    this.snackbarSubject.next({ message, type: 'error' });
  }
}