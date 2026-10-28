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

import {
  Religion,
  ReligionPayload
} from '../../interfaces/master/religion.interface';
declare const convertThis: any;
@Component({
  selector: 'app-religion-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './religion-list.html',
  styleUrl: './religion-list.scss',
})
export class ReligionList implements OnInit, OnDestroy {

  religions: Religion[] = [];
  isLoading = false;
  showForm = false;
  isEdit = false;
  selectedId = '';
  isSaving = false;

  private subscriptions: Subscription[] = [];

formData: ReligionPayload = {
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
    this.loadReligions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadReligions(): void {
    this.isLoading = true;

    const sub = this.masterService.getReligions().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.religions = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Religion load error:', err);

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

  editReligion(religion: any): void {
    this.showForm = true;
    this.isEdit = true;
    this.selectedId = religion._id;

this.formData = {
  nameEn: religion.nameEn || '',
  nameTa: religion.nameTa || '',
  sortOrder: religion.sortOrder ?? 0,
  isActive: religion.isActive ?? true
};

    this.cd.detectChanges();
  }

  closeForm(): void {
    this.showForm = false;
    this.isEdit = false;
    this.selectedId = '';

    this.cd.detectChanges();
  }

  saveReligion(): void {
    if (!this.formData.nameEn.trim()) {
      alert('Enter religion name');
      return;
    }

    this.isSaving = true;
    this.cd.detectChanges();

    const apiCall = this.isEdit
      ? this.masterService.updateReligion(this.selectedId, this.formData)
      : this.masterService.createReligion(this.formData);

    const sub = apiCall.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.closeForm();
          this.loadReligions();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Save religion error:', err);

        this.ngZone.run(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        });
      }
    });

    this.subscriptions.push(sub);
  }

  deleteReligion(id: string): void {
    if (!confirm('Are you sure you want to delete this religion?')) return;

    const sub = this.masterService.deleteReligion(id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.loadReligions();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Delete religion error:', err);
      }
    });

    this.subscriptions.push(sub);
  }
}