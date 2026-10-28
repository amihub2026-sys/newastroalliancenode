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
import { Country } from '../../interfaces/master/country.interface';
import {
  State,
  StatePayload
} from '../../interfaces/master/state.interface';

declare const convertThis: any;

@Component({
  selector: 'app-state-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './state-list.html',
  styleUrls: ['./state-list.scss']
})
export class StateList implements OnInit, OnDestroy {

  states: State[] = [];
  countries: Country[] = [];

  isLoading = true;
  showForm = false;
  isEdit = false;
  selectedId = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  isSaving = false;

  private subscriptions: Subscription[] = [];

  formData: StatePayload = {
    countryId: '',
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
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadInitialData(): void {
    this.isLoading = true;

    const countrySub = this.masterService.getCountries().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.countries = res.data || [];
          this.cd.detectChanges();
        });
      },
      error: (err) => console.error('Country load error:', err)
    });

    const stateSub = this.masterService.getStates().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.states = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('State load error:', err);
        this.ngZone.run(() => {
          this.states = [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      }
    });

    this.subscriptions.push(countrySub, stateSub);
  }

  loadStates(): void {
    this.isLoading = true;

    const sub = this.masterService.getStates().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.states = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('State load error:', err);
        this.ngZone.run(() => {
          this.states = [];
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
      countryId: '',
      nameEn: '',
      nameTa: '',
      sortOrder: 0
    };
  }

  editState(item: State): void {
    this.isEdit = true;
    this.showForm = true;
    this.selectedId = item._id;

    this.formData = {
      countryId: this.getCountryId(item),
      nameEn: item.nameEn || '',
      nameTa: item.nameTa || '',
      sortOrder: item.sortOrder || 0
    };
  }

  closeForm(): void {
    this.showForm = false;
    this.isEdit = false;
    this.selectedId = '';
  }

  saveState(): void {
    if (this.isSaving) return;

    if (!this.formData.countryId || !this.formData.nameEn.trim() || !this.formData.nameTa.trim()) {
      alert('Please fill required fields');
      return;
    }

    this.isSaving = true;

    const request = this.isEdit
      ? this.masterService.updateState(this.selectedId, this.formData)
      : this.masterService.createState(this.formData);

    const sub = request.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.currentPage = 1;
          this.closeForm();
          this.loadStates();
        });
      },
      error: (err) => {
        console.error('Save state error:', err);
        this.isSaving = false;
        alert(err?.error?.message || 'Failed to save state');
      }
    });

    this.subscriptions.push(sub);
  }

  deleteState(item: State): void {
    if (!confirm('Are you sure you want to delete this state?')) return;

    const sub = this.masterService.deleteState(item._id).subscribe({
      next: () => {
        this.currentPage = 1;
        this.loadStates();
      },
      error: (err) => {
        console.error('Delete state error:', err);
        alert(err?.error?.message || 'Failed to delete state');
      }
    });

    this.subscriptions.push(sub);
  }

  getCountryId(item: State): string {
    if (!item.countryId) return '';
    return typeof item.countryId === 'string'
      ? item.countryId
      : item.countryId._id;
  }

  getCountryName(item: State): string {
    if (!item.countryId) return '-';
    return typeof item.countryId === 'string'
      ? '-'
      : item.countryId.nameEn || '-';
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStates.length / this.itemsPerPage);
  }

  get paginatedStates(): State[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredStates.slice(start, start + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  get filteredStates(): State[] {
    if (!this.searchTerm) return this.states;

    const term = this.searchTerm.toLowerCase();

    return this.states.filter(item =>
      item.nameEn?.toLowerCase().includes(term) ||
      item.nameTa?.toLowerCase().includes(term) ||
      this.getCountryName(item).toLowerCase().includes(term)
    );
  }
}