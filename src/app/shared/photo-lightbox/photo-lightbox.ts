import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, EventEmitter, HostListener, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';

/** Use only photos provided by a permitted endpoint. Never fetch a protected gallery from a public preview. */
@Component({
  selector: 'app-photo-lightbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-lightbox.html',
  styleUrl: './photo-lightbox.scss'
})
export class PhotoLightbox implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() index = 0;
  @Input() lang: 'en' | 'ta' = 'en';
  @Output() closed = new EventEmitter<void>();
  private oldOverflow = '';
  constructor(@Inject(DOCUMENT) private document: Document) {}
  ngOnInit(): void {
    this.oldOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
  }
  ngOnDestroy(): void { this.document.body.style.overflow = this.oldOverflow; }
  get current(): string { return this.images[this.index] || ''; }
  close(): void { this.closed.emit(); }
  next(): void { if (this.images.length > 1) this.index = (this.index + 1) % this.images.length; }
  previous(): void { if (this.images.length > 1) this.index = (this.index - 1 + this.images.length) % this.images.length; }
  @HostListener('document:keydown.escape') escape(): void { this.close(); }
  @HostListener('document:keydown.arrowright') right(): void { this.next(); }
  @HostListener('document:keydown.arrowleft') left(): void { this.previous(); }
  onImageError(event: Event): void {
    // No broken-image browser icon; don't substitute a different real person's portrait.
    const image = event.target as HTMLImageElement;
    image.style.visibility = 'hidden';
  }
  onImageLoad(event: Event): void { (event.target as HTMLImageElement).style.visibility = 'visible'; }
}
