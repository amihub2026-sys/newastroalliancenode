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
  Nakshatra,
  NakshatraPayload
} from '../../interfaces/master/nakshatra.interface';

declare const convertThis: any;

@Component({
  selector: 'app-nakshatra-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nakshatra-list.html',
  styleUrls: ['./nakshatra-list.scss']
})
export class NakshatraList implements OnInit, OnDestroy {

  nakshatras: Nakshatra[] = [];

  isLoading = true;
  showForm = false;
  isEdit = false;
  selectedId = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  isSaving = false;

  private subscriptions: Subscription[] = [];

  formData: NakshatraPayload = {
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
    this.loadNakshatras();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNakshatras(): void {
    this.isLoading = true;

    const sub = this.masterService.getNakshatras().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.nakshatras = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Nakshatra load error:', err);

        this.ngZone.run(() => {
          this.nakshatras = [];
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

  editNakshatra(item: Nakshatra): void {
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

  saveNakshatra(): void {
    if (this.isSaving) return;

    if (
      !this.formData.nameEn.trim() ||
      !this.formData.nameTa.trim()
    ) {
      alert('Please fill required fields');
      return;
    }

    this.isSaving = true;
    this.cd.detectChanges();

    const request = this.isEdit
      ? this.masterService.updateNakshatra(
          this.selectedId,
          this.formData
        )
      : this.masterService.createNakshatra(
          this.formData
        );

    const sub = request.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.currentPage = 1;
          this.closeForm();
          this.loadNakshatras();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Save nakshatra error:', err);

        this.ngZone.run(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        });

        alert(
          err?.error?.message ||
          'Failed to save nakshatra'
        );
      }
    });

    this.subscriptions.push(sub);
  }

  deleteNakshatra(item: Nakshatra): void {
    if (
      !confirm(
        'Are you sure you want to delete this nakshatra?'
      )
    ) {
      return;
    }

    const sub = this.masterService
      .deleteNakshatra(item._id)
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.currentPage = 1;
            this.loadNakshatras();
            this.cd.detectChanges();
          });
        },
        error: (err) => {
          console.error(
            'Delete nakshatra error:',
            err
          );

          alert(
            err?.error?.message ||
            'Failed to delete nakshatra'
          );
        }
      });

    this.subscriptions.push(sub);
  }

  get totalPages(): number {
    return Math.ceil(
      this.filteredNakshatras.length /
      this.itemsPerPage
    );
  }

  get paginatedNakshatras(): Nakshatra[] {
    const start =
      (this.currentPage - 1) *
      this.itemsPerPage;

    return this.filteredNakshatras.slice(
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

  get filteredNakshatras(): Nakshatra[] {
    if (!this.searchTerm) {
      return this.nakshatras;
    }

    const term = this.searchTerm.toLowerCase();

    return this.nakshatras.filter(item =>
      item.nameEn?.toLowerCase().includes(term) ||
      item.nameTa?.toLowerCase().includes(term)
    );
  }
}