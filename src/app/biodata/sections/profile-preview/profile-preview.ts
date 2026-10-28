import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Biodata } from '../../biodata';

@Component({
  selector: 'app-biodata-profile-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-preview.html',
  styleUrl: './profile-preview.scss'
})
export class ProfilePreview {
  @Input({ required: true }) vm!: Biodata;
}
