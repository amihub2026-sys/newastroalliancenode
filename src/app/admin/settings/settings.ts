import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {

  tanglishEnabled = false;
  isBrowser = typeof window !== 'undefined';

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.tanglishEnabled =
      localStorage.getItem('admin_tanglish_enabled') === '1';
  }

  toggleTanglish(event: Event): void {
    if (!this.isBrowser) return;

    const checked = (event.target as HTMLInputElement).checked;

    this.tanglishEnabled = checked;

    localStorage.setItem(
      'admin_tanglish_enabled',
      checked ? '1' : '0'
    );
  }
}