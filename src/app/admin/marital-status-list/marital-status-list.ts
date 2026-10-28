import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MasterService } from '../../services/master.service';

declare const convertThis: any;

@Component({
  selector: 'app-marital-status-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marital-status-list.html',
  styleUrl: './marital-status-list.scss',
})
export class MaritalStatusList implements OnInit, OnDestroy {

  statuses: any[] = [];
  isLoading = false;
  showForm = false;
  isEdit = false;
  selectedId = '';
  isSaving = false;

  private subscriptions: Subscription[] = [];

  formData: any = {
    nameEn: '',
    nameTa: '',
    sortOrder: 0,
    isActive: true
  };

  constructor(
    private masterService: MasterService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  tamilTyping(event: KeyboardEvent): void {
    convertThis(event, 4);

    setTimeout(() => {
      const input = event.target as HTMLInputElement;
      this.formData.nameTa = input.value;
      this.cd.detectChanges();
    }, 0);
  }

  ngOnInit(): void {
    this.loadMaritalStatuses();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadMaritalStatuses(): void {
    this.isLoading = true;

    const sub = this.masterService.getMaritalStatuses().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.statuses = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Marital status load error:', err);

        this.ngZone.run(() => {
          this.isLoading = false;
          this.cd.detectChanges();
        });
      }
    });

    this.subscriptions.push(sub);
  }

  openAddForm(): void {
    this.showForm = true;
    this.isEdit = false;
    this.selectedId = '';

    this.formData = {
      nameEn: '',
      nameTa: '',
      sortOrder: 0,
      isActive: true
    };

    this.cd.detectChanges();
  }

  editMaritalStatus(status: any): void {
    this.showForm = true;
    this.isEdit = true;
    this.selectedId = status._id;

    this.formData = {
      nameEn: status.nameEn || '',
      nameTa: status.nameTa || '',
      sortOrder: status.sortOrder ?? 0,
      isActive: status.isActive ?? true
    };

    this.cd.detectChanges();
  }

  closeForm(): void {
    this.showForm = false;
    this.isEdit = false;
    this.selectedId = '';

    this.cd.detectChanges();
  }

  saveMaritalStatus(): void {
    if (!this.formData.nameEn.trim()) {
      alert('Enter marital status name');
      return;
    }

    this.isSaving = true;
    this.cd.detectChanges();

    const apiCall = this.isEdit
      ? this.masterService.updateMaritalStatus(this.selectedId, this.formData)
      : this.masterService.createMaritalStatus(this.formData);

    const sub = apiCall.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.closeForm();
          this.loadMaritalStatuses();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Save marital status error:', err);

        this.ngZone.run(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        });
      }
    });

    this.subscriptions.push(sub);
  }

  deleteMaritalStatus(id: string): void {
    if (!confirm('Are you sure you want to delete this marital status?')) return;

    const sub = this.masterService.deleteMaritalStatus(id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.loadMaritalStatuses();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Delete marital status error:', err);
      }
    });

    this.subscriptions.push(sub);
  }
}