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
  Dhosham,
  DhoshamPayload
} from '../../interfaces/master/dhosham.interface';

declare const convertThis: any;

@Component({
  selector: 'app-dhosham-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dhosham-list.html',
  styleUrls: ['./dhosham-list.scss']
})
export class DhoshamList implements OnInit, OnDestroy {

  dhoshams: Dhosham[] = [];

  isLoading = true;
  showForm = false;
  isEdit = false;
  selectedId = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  isSaving = false;

  private subscriptions: Subscription[] = [];

  formData: DhoshamPayload = {
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
    this.loadDhoshams();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadDhoshams(): void {
    this.isLoading = true;

    const sub = this.masterService.getDhoshams().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.dhoshams = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Dhosham load error:', err);

        this.ngZone.run(() => {
          this.dhoshams = [];
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

  editDhosham(item: Dhosham): void {
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

  saveDhosham(): void {
    if (this.isSaving) return;

    if (!this.formData.nameEn.trim() || !this.formData.nameTa.trim()) {
      alert('Please fill required fields');
      return;
    }

    this.isSaving = true;
    this.cd.detectChanges();

    const request = this.isEdit
      ? this.masterService.updateDhosham(this.selectedId, this.formData)
      : this.masterService.createDhosham(this.formData);

    const sub = request.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.currentPage = 1;
          this.closeForm();
          this.loadDhoshams();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Save dhosham error:', err);

        this.ngZone.run(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        });

        alert(err?.error?.message || 'Failed to save dhosham');
      }
    });

    this.subscriptions.push(sub);
  }

  deleteDhosham(item: Dhosham): void {
    if (!confirm('Are you sure you want to delete this dhosham?')) return;

    const sub = this.masterService.deleteDhosham(item._id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.currentPage = 1;
          this.loadDhoshams();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Delete dhosham error:', err);
        alert(err?.error?.message || 'Failed to delete dhosham');
      }
    });

    this.subscriptions.push(sub);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDhoshams.length / this.itemsPerPage);
  }

  get paginatedDhoshams(): Dhosham[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDhoshams.slice(start, start + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  get filteredDhoshams(): Dhosham[] {
    if (!this.searchTerm) return this.dhoshams;

    const term = this.searchTerm.toLowerCase();

    return this.dhoshams.filter(item =>
      item.nameEn?.toLowerCase().includes(term) ||
      item.nameTa?.toLowerCase().includes(term)
    );
  }
}