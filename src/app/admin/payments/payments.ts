import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { inject, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrls: ['./payments.scss'],
})
export class Payments implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cd = inject(ChangeDetectorRef);
  page = 1;
  total = 0;
  error = '';
  isLoading = true;

  searchTerm = '';

  payments: any[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadPayments();
  }

  async loadPayments(): Promise<void> {
    this.isLoading = true;

    this.error = '';
    try {
      const result = await firstValueFrom(
        this.http.get<{ data: any[]; total: number }>(
          `${environment.apiUrl}/payments?page=${this.page}`,
        ),
      );
      this.payments = result.data;
      this.total = result.total;
    } catch {
      this.error = 'Unable to load payments. Please retry.';
      this.payments = [];
    } finally {
      this.isLoading = false;
      this.cd.markForCheck();
    }
  }
  async changePage(delta: number): Promise<void> {
    this.page += delta;
    await this.loadPayments();
  }

  get filteredPayments(): any[] {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.payments;
    }

    return this.payments.filter(
      (payment) =>
        String(payment.user_id || '')
          .toLowerCase()
          .includes(term) ||
        String(payment.payment_status || '')
          .toLowerCase()
          .includes(term) ||
        String(payment.transaction_id || '')
          .toLowerCase()
          .includes(term) ||
        String(payment.payment_method || '')
          .toLowerCase()
          .includes(term),
    );
  }

  async refresh(): Promise<void> {
    await this.loadPayments();
  }
}
