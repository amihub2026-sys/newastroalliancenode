import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ImportStatus = 'ready' | 'error' | 'skip' | 'imported';
export interface ImportRow { row: number; status: ImportStatus; message: string; }
interface ImportResponse { success: boolean; data: ImportRow[]; committed: boolean; message?: string; }

@Component({
  selector: 'app-profile-import',
  standalone: true,
  templateUrl: './profile-import.html',
  styleUrl: './profile-import.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileImport {
  private readonly http = inject(HttpClient);
  private readonly cd = inject(ChangeDetectorRef);
  readonly maximumProfiles = 100;
  readonly maximumBytes = 900_000;
  filename = '';
  profiles: unknown[] = [];
  rows: ImportRow[] = [];
  busy = false;
  error = '';
  message = '';
  canImport = false;
  imported = false;
  get counts() {
    return {
      ready: this.rows.filter(row => row.status === 'ready').length,
      skip: this.rows.filter(row => row.status === 'skip').length,
      error: this.rows.filter(row => row.status === 'error').length,
      imported: this.rows.filter(row => row.status === 'imported').length,
    };
  }

  async selectFile(event: Event): Promise<void> {
    this.clear();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.filename = file.name;
    try {
      if (!file.name.toLowerCase().endsWith('.json')) throw new Error('Choose a .json profile file.');
      if (file.size > this.maximumBytes) throw new Error('File exceeds 900 KB. Import existing media by URL.');
      const parsed: unknown = JSON.parse(await file.text());
      if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > this.maximumProfiles) {
        throw new Error('The JSON must contain an array of 1–100 profiles.');
      }
      this.profiles = parsed;
      this.message = `${this.profiles.length} profiles loaded. Preview before importing.`;
    } catch (cause) {
      this.error = cause instanceof Error ? cause.message : 'Could not read the selected file.';
      this.profiles = [];
      input.value = '';
    } finally {
      this.cd.markForCheck();
    }
  }

  async submit(commit: boolean): Promise<void> {
    if (this.busy || !this.profiles.length || (commit && !this.canImport)) return;
    this.busy = true;
    this.error = '';
    this.message = '';
    this.canImport = false;
    try {
      const response = await firstValueFrom(this.http.post<ImportResponse>(
        `${environment.apiUrl}/admin/profile-import`, { profiles: this.profiles, commit }
      ));
      this.rows = response.data ?? [];
      this.imported = commit;
      if (commit) {
        this.message = `${this.counts.imported} profiles imported for approval. ${this.counts.skip} existing profiles skipped.`;
      } else {
        this.canImport = this.counts.ready > 0 && this.counts.error === 0;
        this.message = this.counts.error ? 'Fix the invalid records and preview again.' : 'Preview finished. Existing records will not be overwritten.';
      }
    } catch (cause) {
      if (cause instanceof HttpErrorResponse && Array.isArray(cause.error?.data)) this.rows = cause.error.data;
      this.error = cause instanceof HttpErrorResponse && typeof cause.error?.message === 'string'
        ? cause.error.message : 'Request failed. Check your admin session and the backend connection.';
    } finally {
      this.busy = false;
      this.cd.markForCheck();
    }
  }

  downloadTemplate(): void {
    if (typeof window === 'undefined') return;
    const template = [{
      basic: { mobile: '9000000000', dob: '1998-01-01', fullName: { en: 'Example Person', ta: '' }, gender: 'female' }
    }];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'astro-alliance-profile-template.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  private clear(): void {
    this.profiles = [];
    this.rows = [];
    this.filename = '';
    this.canImport = false;
    this.imported = false;
    this.error = '';
    this.message = '';
  }
}
