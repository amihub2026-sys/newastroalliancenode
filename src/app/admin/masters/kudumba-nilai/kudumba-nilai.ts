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
  selector: 'app-kudumba-nilai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kudumba-nilai.html',
  styleUrl: './kudumba-nilai.scss',
})
export class KudumbaNilai implements OnInit, OnDestroy {

  kudumbaNilaiList: any[] = [];
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
    this.loadKudumbaNilai();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadKudumbaNilai(): void {
    this.isLoading = true;

    const sub = this.masterService.getKudumbaNilai().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.kudumbaNilaiList = res.data || [];
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

  editKudumbaNilai(item: any): void {
    this.showForm = true;
    this.isEdit = true;
    this.selectedId = item._id;

    this.formData = {
      nameEn: item.nameEn || '',
      nameTa: item.nameTa || '',
      sortOrder: item.sortOrder ?? 0,
      isActive: item.isActive ?? true
    };
  }

  closeForm(): void {
    this.showForm = false;
    this.isEdit = false;
    this.selectedId = '';
  }

  saveKudumbaNilai(): void {

    if (!this.formData.nameEn.trim()) {
      alert('Enter Kudumba Nilai');
      return;
    }

    this.isSaving = true;

    const apiCall = this.isEdit
      ? this.masterService.updateKudumbaNilai(this.selectedId, this.formData)
      : this.masterService.createKudumbaNilai(this.formData);

    const sub = apiCall.subscribe({
      next: () => {
        this.isSaving = false;
        this.closeForm();
        this.loadKudumbaNilai();
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
      }
    });

    this.subscriptions.push(sub);
  }

  deleteKudumbaNilai(id: string): void {

    if (!confirm('Delete this record?')) return;

    const sub = this.masterService.deleteKudumbaNilai(id).subscribe({
      next: () => this.loadKudumbaNilai(),
      error: err => console.error(err)
    });

    this.subscriptions.push(sub);
  }

}