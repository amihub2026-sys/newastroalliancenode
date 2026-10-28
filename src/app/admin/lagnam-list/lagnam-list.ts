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
  Lagnam,
  LagnamPayload
} from '../../interfaces/master/lagnam.interface';

declare const convertThis: any;

@Component({
  selector: 'app-lagnam-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lagnam-list.html',
  styleUrls: ['./lagnam-list.scss']
})
export class LagnamList implements OnInit, OnDestroy {

  lagnams: Lagnam[] = [];

  isLoading = true;
  showForm = false;
  isEdit = false;
  selectedId = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  isSaving = false;

  private subscriptions: Subscription[] = [];

  formData: LagnamPayload = {
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
    this.loadLagnams();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadLagnams(): void {
    this.isLoading = true;

    const sub = this.masterService.getLagnams().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.lagnams = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Lagnam load error:', err);

        this.ngZone.run(() => {
          this.lagnams = [];
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

  editLagnam(item: Lagnam): void {
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

  saveLagnam(): void {
    if (this.isSaving) return;

    if (!this.formData.nameEn.trim() || !this.formData.nameTa.trim()) {
      alert('Please fill required fields');
      return;
    }

    this.isSaving = true;
    this.cd.detectChanges();

    const request = this.isEdit
      ? this.masterService.updateLagnam(this.selectedId, this.formData)
      : this.masterService.createLagnam(this.formData);

    const sub = request.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.currentPage = 1;
          this.closeForm();
          this.loadLagnams();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Save lagnam error:', err);

        this.ngZone.run(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        });

        alert(err?.error?.message || 'Failed to save lagnam');
      }
    });

    this.subscriptions.push(sub);
  }

  deleteLagnam(item: Lagnam): void {
    if (!confirm('Are you sure you want to delete this lagnam?')) return;

    const sub = this.masterService.deleteLagnam(item._id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.currentPage = 1;
          this.loadLagnams();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Delete lagnam error:', err);
        alert(err?.error?.message || 'Failed to delete lagnam');
      }
    });

    this.subscriptions.push(sub);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLagnams.length / this.itemsPerPage);
  }

  get paginatedLagnams(): Lagnam[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredLagnams.slice(start, start + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  get filteredLagnams(): Lagnam[] {
    if (!this.searchTerm) return this.lagnams;

    const term = this.searchTerm.toLowerCase();

    return this.lagnams.filter(item =>
      item.nameEn?.toLowerCase().includes(term) ||
      item.nameTa?.toLowerCase().includes(term)
    );
  }
}