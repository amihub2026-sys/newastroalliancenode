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
  Rasi,
  RasiPayload
} from '../../interfaces/master/rasi.interface';

declare const convertThis: any;

@Component({
  selector: 'app-rasi-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rasi-list.html',
  styleUrls: ['./rasi-list.scss']
})
export class RasiList implements OnInit, OnDestroy {

  rasis: Rasi[] = [];

  isLoading = true;
  showForm = false;
  isEdit = false;
  selectedId = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  isSaving = false;

  private subscriptions: Subscription[] = [];

  formData: RasiPayload = {
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
    this.loadRasis();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadRasis(): void {
    this.isLoading = true;

    const sub = this.masterService.getRasis().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.rasis = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Rasi load error:', err);

        this.ngZone.run(() => {
          this.rasis = [];
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

  editRasi(item: Rasi): void {
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

  saveRasi(): void {
    if (this.isSaving) return;

    if (!this.formData.nameEn.trim() || !this.formData.nameTa.trim()) {
      alert('Please fill required fields');
      return;
    }

    this.isSaving = true;
    this.cd.detectChanges();

    const request = this.isEdit
      ? this.masterService.updateRasi(this.selectedId, this.formData)
      : this.masterService.createRasi(this.formData);

    const sub = request.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.currentPage = 1;
          this.closeForm();
          this.loadRasis();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Save rasi error:', err);

        this.ngZone.run(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        });

        alert(err?.error?.message || 'Failed to save rasi');
      }
    });

    this.subscriptions.push(sub);
  }

  deleteRasi(item: Rasi): void {
    if (!confirm('Are you sure you want to delete this rasi?')) return;

    const sub = this.masterService.deleteRasi(item._id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.currentPage = 1;
          this.loadRasis();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Delete rasi error:', err);
        alert(err?.error?.message || 'Failed to delete rasi');
      }
    });

    this.subscriptions.push(sub);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRasis.length / this.itemsPerPage);
  }

  get paginatedRasis(): Rasi[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRasis.slice(start, start + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  get filteredRasis(): Rasi[] {
    if (!this.searchTerm) return this.rasis;

    const term = this.searchTerm.toLowerCase();

    return this.rasis.filter(item =>
      item.nameEn?.toLowerCase().includes(term) ||
      item.nameTa?.toLowerCase().includes(term)
    );
  }
}