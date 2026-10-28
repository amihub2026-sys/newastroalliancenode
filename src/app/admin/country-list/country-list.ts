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
  Country,
  CountryPayload
} from '../../interfaces/master/country.interface';

declare const convertThis: any;

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './country-list.html',
  styleUrls: ['./country-list.scss']
})
export class CountryList implements OnInit, OnDestroy {

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

  formData: CountryPayload = {
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
    this.loadCountries();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadCountries(): void {
    this.isLoading = true;

    const sub = this.masterService.getCountries().subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.countries = res.data || [];
          this.isLoading = false;
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Country load error:', err);

        this.ngZone.run(() => {
          this.countries = [];
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

  editCountry(item: Country): void {
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

  saveCountry(): void {
    if (this.isSaving) return;

    if (!this.formData.nameEn.trim() || !this.formData.nameTa.trim()) {
      alert('Please fill required fields');
      return;
    }

    this.isSaving = true;
    this.cd.detectChanges();

    const request = this.isEdit
      ? this.masterService.updateCountry(this.selectedId, this.formData)
      : this.masterService.createCountry(this.formData);

    const sub = request.subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSaving = false;
          this.currentPage = 1;
          this.closeForm();
          this.loadCountries();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Save country error:', err);

        this.ngZone.run(() => {
          this.isSaving = false;
          this.cd.detectChanges();
        });

        alert(err?.error?.message || 'Failed to save country');
      }
    });

    this.subscriptions.push(sub);
  }

  deleteCountry(item: Country): void {
    if (!confirm('Are you sure you want to delete this country?')) return;

    const sub = this.masterService.deleteCountry(item._id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.currentPage = 1;
          this.loadCountries();
          this.cd.detectChanges();
        });
      },
      error: (err) => {
        console.error('Delete country error:', err);
        alert(err?.error?.message || 'Failed to delete country');
      }
    });

    this.subscriptions.push(sub);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredCountries.length / this.itemsPerPage);
  }

  get paginatedCountries(): Country[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCountries.slice(start, start + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  get filteredCountries(): Country[] {
    if (!this.searchTerm) return this.countries;

    const term = this.searchTerm.toLowerCase();

    return this.countries.filter(item =>
      item.nameEn?.toLowerCase().includes(term) ||
      item.nameTa?.toLowerCase().includes(term)
    );
  }
}