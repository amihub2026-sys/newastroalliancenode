import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
interface AdminAccount {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.scss'],
})
export class AdminUsers implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cd = inject(ChangeDetectorRef);
  admins: AdminAccount[] = [];
  name = '';
  email = '';
  password = '';
  role = 'admin';
  error = '';
  busy = false;
  ngOnInit(): void {
    void this.loadAdmins();
  }
  async loadAdmins(): Promise<void> {
    this.error = '';
    try {
      this.admins = (
        await firstValueFrom(
          this.http.get<{ data: AdminAccount[] }>(`${environment.apiUrl}/admin/accounts`),
        )
      ).data;
    } catch {
      this.error = 'Unable to load admins. Owner access is required.';
    } finally {
      this.cd.markForCheck();
    }
  }
  async addAdmin(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/admin/accounts`, {
          name: this.name,
          email: this.email,
          password: this.password,
          role: this.role,
        }),
      );
      this.name = '';
      this.email = '';
      this.password = '';
      this.role = 'admin';
      await this.loadAdmins();
    } catch {
      this.error = 'Could not add admin. Check email and use a password of at least 12 characters.';
    } finally {
      this.busy = false;
      this.cd.markForCheck();
    }
  }
  async deleteAdmin(id: string): Promise<void> {
    if (this.busy || !window.confirm('Disable this admin account?')) return;
    this.busy = true;
    this.error = '';
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}/admin/accounts/${id}`));
      await this.loadAdmins();
    } catch {
      this.error = 'Could not disable this account. You cannot disable yourself.';
    } finally {
      this.busy = false;
      this.cd.markForCheck();
    }
  }
}
