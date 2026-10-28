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
import { MasterService } from '../../../services/master.service';

declare const convertThis: any;

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './colors.html',
  styleUrl: './colors.scss',
})
export class Colors implements OnInit, OnDestroy {

  colors: any[] = [];
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
    this.loadColors();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadColors(): void {
    this.isLoading = true;

    const sub = this.masterService.getColors().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.colors = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: () => {
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

  editColor(color: any): void {
    this.showForm = true;
    this.isEdit = true;
    this.selectedId = color._id;

    this.formData = {
      nameEn: color.nameEn || '',
      nameTa: color.nameTa || '',
      sortOrder: color.sortOrder ?? 0,
      isActive: color.isActive ?? true
    };
  }

  closeForm(): void {
    this.showForm = false;
    this.isEdit = false;
    this.selectedId = '';
  }

  saveColor(): void {
    if (!this.formData.nameEn.trim()) {
      alert('Enter color name');
      return;
    }

    this.isSaving = true;

    const apiCall = this.isEdit
      ? this.masterService.updateColor(this.selectedId, this.formData)
      : this.masterService.createColor(this.formData);

    const sub = apiCall.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeForm();
        this.loadColors();
      },
      error: (err) => {
        console.error('Save color error:', err);
        this.isSaving = false;
      }
    });

    this.subscriptions.push(sub);
  }

  deleteColor(id: string): void {
    if (!confirm('Are you sure you want to delete this color?')) return;

    const sub = this.masterService.deleteColor(id).subscribe({
      next: () => this.loadColors(),
      error: (err) => console.error('Delete color error:', err)
    });

    this.subscriptions.push(sub);
  }
}