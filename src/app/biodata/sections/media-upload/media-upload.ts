import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media-upload.html',
  styleUrl: './media-upload.scss'
})
export class MediaUpload {
  @Input() currentLang: 'en' | 'ta' = 'en';
  @Input() tr: any;

  @Input() profilePreviewUrl: string | null = null;
  @Input() additionalImages: File[] = [];
  @Input() additionalImagePreviews: string[] = [];
  @Input() selectedVideo: File | null = null;
  @Input() videoPreviewUrl: string | null = null;

  @Output() profileImageChange = new EventEmitter<Event>();
  @Output() additionalImagesChange = new EventEmitter<Event>();
  @Output() videoChange = new EventEmitter<Event>();

  @Output() removeProfileImage = new EventEmitter<void>();
  @Output() clearAdditionalImages = new EventEmitter<void>();
  @Output() removeVideo = new EventEmitter<void>();
  @Output() removeAdditionalImage = new EventEmitter<number>();

  onProfileChange(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.profileImageChange.emit(event);
  }

  onAdditionalChange(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.additionalImagesChange.emit(event);
  }

  onVideoFileChange(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.videoChange.emit(event);
  }
}