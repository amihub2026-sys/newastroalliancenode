import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { SnackbarService, SnackbarType } from '../snackbar.service';

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
  type: SnackbarType = 'success';

  private sub?: Subscription;
  private timer?: any;

  constructor(
    private snackbarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.sub = this.snackbarService.snackbar$.subscribe((data) => {
      clearTimeout(this.timer);

      this.message = data.message;
      this.type = data.type;
      this.visible = true;
      this.cdr.detectChanges();

      this.zone.runOutsideAngular(() => {
        this.timer = setTimeout(() => {
          this.zone.run(() => {
            this.visible = false;
            this.message = '';
            this.cdr.detectChanges();
          });
        }, 3000);
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    clearTimeout(this.timer);
  }
}