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
import { Religion } from '../../interfaces/master/religion.interface';
import {
  Caste,
  CastePayload
} from '../../interfaces/master/caste.interface';
import { Router } from '@angular/router';
declare const convertThis: any;
@Component({
  selector: 'app-caste-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './caste-list.html',
  styleUrls: ['./caste-list.scss']
})
export class CasteList implements OnInit, OnDestroy {

  castes: Caste[] = [];
  casteCounts: any = {};
  religions: Religion[] = [];

  isLoading = true;
  showForm = false;
  isEdit = false;
  selectedId = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  isSaving = false;

  private subscriptions: Subscription[] = [];

  formData: CastePayload = {
    religionId: '',
    nameEn: '',
    nameTa: '',
    isActive: true
  };

constructor(
  private masterService: MasterService,
  private ngZone: NgZone,
  private cd: ChangeDetectorRef,
  private router: Router
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
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadInitialData(): void {
    this.isLoading = true;

    const religionSub = this.masterService.getReligions().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.religions = res.data || [];
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Religion load error:', err);
      }
    });

    const casteSub = this.masterService.getCastes().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.castes = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Caste load error:', err);

        this.ngZone.run(() => {
          this.castes = [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      }
    });

    const countSub = this.masterService.getCasteProfileCounts().subscribe({
  next: (res) => {
    this.ngZone.run(() => {
      this.casteCounts = {};

      (res.data || []).forEach((item: any) => {
        this.casteCounts[item._id] = item;
      });

      this.cd.detectChanges();
    });
  },
  error: (err) => {
    console.error('Profile count load error:', err);
    this.casteCounts = {};
  }
});

this.subscriptions.push(religionSub, casteSub, countSub);
  }

  loadCastes(): void {
    this.isLoading = true;

    const sub = this.masterService.getCastes().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.castes = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Caste load error:', err);

        this.ngZone.run(() => {
          this.castes = [];
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
      religionId: '',
      nameEn: '',
      nameTa: '',
      isActive: true
    };

    this.cd.detectChanges();
  }

  editCaste(item: Caste): void {
    this.isEdit = true;
    this.showForm = true;
    this.selectedId = item._id;

    this.formData = {
      religionId: this.getReligionId(item),
      nameEn: item.nameEn || '',
      nameTa: item.nameTa || '',
      isActive: item.isActive ?? true
    };

    this.cd.detectChanges();
  }

  closeForm(): void {
    this.showForm = false;
    this.isEdit = false;
    this.selectedId = '';
    this.cd.detectChanges();
  }

  saveCaste(): void {
    if (this.isSaving) return;

    if (!this.formData.religionId || !this.formData.nameEn.trim()) {
      alert('Please fill required fields');
      return;
    }

    this.isSaving = true;
    this.cd.detectChanges();

    const request = this.isEdit
      ? this.masterService.updateCaste(this.selectedId, this.formData)
      : this.masterService.createCaste(this.formData);

    const sub = request.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.currentPage = 1;
          this.closeForm();
          this.loadCastes();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Save caste error:', err);

        this.ngZone.run(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        });

        alert(err?.error?.message || 'Failed to save caste');
      }
    });

    this.subscriptions.push(sub);
  }

  deleteCaste(item: Caste): void {
    if (!confirm('Are you sure you want to delete this caste?')) return;

    const sub = this.masterService.deleteCaste(item._id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.currentPage = 1;
          this.loadCastes();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Delete caste error:', err);
        alert(err?.error?.message || 'Failed to delete caste');
      }
    });

    this.subscriptions.push(sub);
  }

  getReligionId(item: Caste): string {
    if (!item.religionId) return '';

    if (typeof item.religionId === 'string') {
      return item.religionId;
    }

    return item.religionId._id;
  }

  getReligionName(item: Caste): string {
    if (!item.religionId) return '-';

    if (typeof item.religionId === 'string') {
      return '-';
    }

    return item.religionId.nameEn || '-';
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCastes.length / this.itemsPerPage);
  }

  get paginatedCastes(): Caste[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;

    return this.filteredCastes.slice(
      start,
      start + this.itemsPerPage
    );
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get filteredCastes(): Caste[] {
    if (!this.searchTerm) {
      return this.castes;
    }

    const term = this.searchTerm.toLowerCase();

    return this.castes.filter(item =>
      item.nameEn?.toLowerCase().includes(term) ||
      item.nameTa?.toLowerCase().includes(term) ||
      this.getReligionName(item).toLowerCase().includes(term)
    );
  }
  openCasteProfiles(item: Caste): void {
  this.router.navigate(['/admin/castes', item._id, 'profiles']);
}
}