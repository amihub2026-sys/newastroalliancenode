import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MasterService } from '../../services/master.service';
import {
  ThisaiIruppu,
  ThisaiIruppuPayload
} from '../../interfaces/master/thisai-iruppu.interface';

declare const convertThis: any;

@Component({
  selector: 'app-thisai-iruppu-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './thisai-iruppu-list.html',
  styleUrls: ['./thisai-iruppu-list.scss']
})
export class ThisaiIruppuList implements OnInit, OnDestroy {

  thisaiIruppus: ThisaiIruppu[] = [];

  isLoading = true;
  showForm = false;
  isEdit = false;
  selectedId = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  isSaving = false;

  private subscriptions: Subscription[] = [];

  formData: ThisaiIruppuPayload = {
    nameEn: '',
    nameTa: '',
    sortOrder: 0
  };

  constructor(
    private masterService: MasterService,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef
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
    this.loadThisaiIruppus();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadThisaiIruppus(): void {
    this.isLoading = true;

    const sub = this.masterService.getThisaiIruppus().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.thisaiIruppus = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Thisai Iruppu load error:', err);

        this.ngZone.run(() => {
          this.thisaiIruppus = [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      }
    });

    this.subscriptions.push(sub);
  }

  openAdd(): void {
    this.isEdit = false;
    this.showForm = true;
    this.selectedId = '';

    this.formData = {
      nameEn: '',
      nameTa: '',
      sortOrder: 0
    };

    this.cd.detectChanges();
  }

  editThisaiIruppu(item: ThisaiIruppu): void {
    this.isEdit = true;
    this.showForm = true;
    this.selectedId = item._id;

    this.formData = {
      nameEn: item.nameEn || '',
      nameTa: item.nameTa || '',
      sortOrder: item.sortOrder || 0
    };

    this.cd.detectChanges();
  }

  closeForm(): void {
    this.showForm = false;
    this.isEdit = false;
    this.selectedId = '';
    this.cd.detectChanges();
  }

  saveThisaiIruppu(): void {
    if (this.isSaving) return;

    if (!this.formData.nameEn.trim() || !this.formData.nameTa.trim()) {
      alert('Please fill required fields');
      return;
    }

    this.isSaving = true;
    this.cd.detectChanges();

    const request = this.isEdit
      ? this.masterService.updateThisaiIruppu(this.selectedId, this.formData)
      : this.masterService.createThisaiIruppu(this.formData);

    const sub = request.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.currentPage = 1;
          this.closeForm();
          this.loadThisaiIruppus();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Save thisai iruppu error:', err);

        this.ngZone.run(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        });

        alert(err?.error?.message || 'Failed to save thisai iruppu');
      }
    });

    this.subscriptions.push(sub);
  }

  deleteThisaiIruppu(item: ThisaiIruppu): void {
    if (!confirm('Are you sure you want to delete this thisai iruppu?')) return;

    const sub = this.masterService.deleteThisaiIruppu(item._id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.currentPage = 1;
          this.loadThisaiIruppus();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Delete thisai iruppu error:', err);
        alert(err?.error?.message || 'Failed to delete thisai iruppu');
      }
    });

    this.subscriptions.push(sub);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredThisaiIruppus.length / this.itemsPerPage);
  }

  get paginatedThisaiIruppus(): ThisaiIruppu[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredThisaiIruppus.slice(start, start + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  get filteredThisaiIruppus(): ThisaiIruppu[] {
    if (!this.searchTerm) return this.thisaiIruppus;

    const term = this.searchTerm.toLowerCase();

    return this.thisaiIruppus.filter(item =>
      item.nameEn?.toLowerCase().includes(term) ||
      item.nameTa?.toLowerCase().includes(term)
    );
  }
}