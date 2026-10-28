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
import { State } from '../../interfaces/master/state.interface';
import {
  City,
  CityPayload
} from '../../interfaces/master/city.interface';

declare const convertThis: any;

@Component({
  selector: 'app-cities',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cities.html',
  styleUrls: ['./cities.scss']
})
export class Cities implements OnInit, OnDestroy {

  cities: City[] = [];
  states: State[] = [];

  isLoading = true;
  showForm = false;
  isEdit = false;
  selectedId = '';
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  isSaving = false;

  private subscriptions: Subscription[] = [];

  formData: CityPayload = {
    stateId: '',
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

    const stateSub = this.masterService.getStates().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.states = res.data || [];
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('State load error:', err);
      }
    });

    const citySub = this.masterService.getCities().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.cities = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('City load error:', err);

        this.ngZone.run(() => {
          this.cities = [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      }
    });

    this.subscriptions.push(stateSub, citySub);
  }

  loadCities(): void {
    this.isLoading = true;

    const sub = this.masterService.getCities().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.cities = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('City load error:', err);

        this.ngZone.run(() => {
          this.cities = [];
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
      stateId: '',
      nameEn: '',
      nameTa: '',
      sortOrder: 0
    };

    this.cd.detectChanges();
  }

  editCity(item: City): void {
    this.isEdit = true;
    this.showForm = true;
    this.selectedId = item._id;

    this.formData = {
      stateId: this.getStateId(item),
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

  saveCity(): void {
    if (this.isSaving) return;

    if (!this.formData.stateId || !this.formData.nameEn.trim() || !this.formData.nameTa.trim()) {
      alert('Please fill required fields');
      return;
    }

    this.isSaving = true;
    this.cd.detectChanges();

    const request = this.isEdit
      ? this.masterService.updateCity(this.selectedId, this.formData)
      : this.masterService.createCity(this.formData);

    const sub = request.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.currentPage = 1;
          this.closeForm();
          this.loadCities();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Save city error:', err);

        this.ngZone.run(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        });

        alert(err?.error?.message || 'Failed to save city');
      }
    });

    this.subscriptions.push(sub);
  }

  deleteCity(item: City): void {
    if (!confirm('Are you sure you want to delete this city?')) return;

    const sub = this.masterService.deleteCity(item._id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.currentPage = 1;
          this.loadCities();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Delete city error:', err);
        alert(err?.error?.message || 'Failed to delete city');
      }
    });

    this.subscriptions.push(sub);
  }

  getStateId(item: City): string {
    if (!item.stateId) return '';

    if (typeof item.stateId === 'string') {
      return item.stateId;
    }

    return item.stateId._id;
  }

  getStateName(item: City): string {
    if (!item.stateId) return '-';

    if (typeof item.stateId === 'string') {
      return '-';
    }

    return item.stateId.nameEn || '-';
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCities.length / this.itemsPerPage);
  }

  get paginatedCities(): City[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;

    return this.filteredCities.slice(
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

  get filteredCities(): City[] {
    if (!this.searchTerm) {
      return this.cities;
    }

    const term = this.searchTerm.toLowerCase();

    return this.cities.filter(item =>
      item.nameEn?.toLowerCase().includes(term) ||
      item.nameTa?.toLowerCase().includes(term) ||
      this.getStateName(item).toLowerCase().includes(term)
    );
  }
}