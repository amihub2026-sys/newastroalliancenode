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
  selector: 'app-gender-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gender-list.html',
  styleUrl: './gender-list.scss',
})
export class GenderList implements OnInit, OnDestroy {

  genders: any[] = [];
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
    this.loadGenders();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadGenders(): void {
    this.isLoading = true;

    const sub = this.masterService.getGenders().subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.genders = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err: any) => {
        console.error('Gender load error:', err);
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
  }

  editGender(gender: any): void {
    this.showForm = true;
    this.isEdit = true;
    this.selectedId = gender._id;

    this.formData = {
      nameEn: gender.nameEn || '',
      nameTa: gender.nameTa || '',
      sortOrder: gender.sortOrder ?? 0,
      isActive: gender.isActive ?? true
    };
  }

  closeForm(): void {
    this.showForm = false;
    this.isEdit = false;
    this.selectedId = '';
  }

  saveGender(): void {
    if (!this.formData.nameEn.trim()) {
      alert('Enter gender name');
      return;
    }

    this.isSaving = true;

    const apiCall = this.isEdit
      ? this.masterService.updateGender(this.selectedId, this.formData)
      : this.masterService.createGender(this.formData);

    const sub = apiCall.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.closeForm();
          this.loadGenders();
        });
      },
      error: (err: any) => {
        console.error('Save gender error:', err);
        this.ngZone.run(() => {
          this.isSaving = false;
        });
      }
    });

    this.subscriptions.push(sub);
  }

  deleteGender(id: string): void {
    if (!confirm('Are you sure you want to delete this gender?')) return;

    const sub = this.masterService.deleteGender(id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.loadGenders();
        });
      },
      error: (err: any) => {
        console.error('Delete gender error:', err);
      }
    });

    this.subscriptions.push(sub);
  }
}