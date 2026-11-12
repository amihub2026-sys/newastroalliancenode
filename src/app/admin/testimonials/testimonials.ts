
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import {
  TestimonialService,
  Testimonial,
  TestimonialPayload
} from '../../services/testimonial.service';

import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './testimonials.html',
  styleUrls: [
    './testimonials.scss',
    './testimonials.responsive.scss'
  ]
})
export class Testimonials implements OnInit {

  private testimonialService = inject(TestimonialService);
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);

  // ==========================================
  // PAGE STATE
  // ==========================================

  testimonials: Testimonial[] = [];

  loading = false;
  saving = false;
  uploading = false;

  deletingId: string | null = null;
  publishingId: string | null = null;
  editingId: string | null = null;

  showForm = false;

  errorMessage = '';
  successMessage = '';

  selectedPhotoName = '';

  readonly ratingOptions = [1, 2, 3, 4, 5];

  // ==========================================
  // FORM
  // ==========================================

  form: TestimonialPayload = this.createEmptyForm();

  private createEmptyForm(): TestimonialPayload {
    return {
      coupleNameEnglish: '',
      coupleNameTamil: '',
      reviewEnglish: '',
      reviewTamil: '',
      photoUrl: '',
      rating: 5,
      weddingDate: null,
      published: false
    };
  }

  // ==========================================
  // LANGUAGE SUPPORT
  // ==========================================

  get currentLang(): 'en' | 'ta' {
    return this.languageService.currentLang;
  }

  t(english: string, tamil: string): string {
    return this.currentLang === 'ta' ? tamil : english;
  }

  get pageTitle(): string {
    return this.t(
      'Testimonials Management',
      'வாடிக்கையாளர் கருத்துகள் மேலாண்மை'
    );
  }

  getCoupleName(testimonial: Testimonial): string {
    if (
      this.currentLang === 'ta' &&
      testimonial.coupleNameTamil?.trim()
    ) {
      return testimonial.coupleNameTamil;
    }

    return testimonial.coupleNameEnglish;
  }

  getReview(testimonial: Testimonial): string {
    if (
      this.currentLang === 'ta' &&
      testimonial.reviewTamil?.trim()
    ) {
      return testimonial.reviewTamil;
    }

    return testimonial.reviewEnglish;
  }

  // ==========================================
  // INITIALIZE
  // ==========================================

  ngOnInit(): void {
    void this.loadTestimonials();
  }

  // ==========================================
  // GET ALL TESTIMONIALS
  // ==========================================

  async loadTestimonials(): Promise<void> {

    this.loading = true;
    this.errorMessage = '';

    try {

      const response = await firstValueFrom(
        this.testimonialService.getAll()
      );

      this.testimonials = Array.isArray(response.data)
        ? response.data
        : [];

    } catch (error) {

      console.error(
        'LOAD TESTIMONIALS ERROR:',
        error
      );

      this.errorMessage = this.t(
        'Unable to load testimonials.',
        'வாடிக்கையாளர் கருத்துகளை ஏற்ற முடியவில்லை.'
      );

    } finally {

      this.loading = false;
      this.cdr.markForCheck();

    }
  }

  // ==========================================
  // OPEN NEW TESTIMONIAL FORM
  // ==========================================

  addNewTestimonial(): void {

    if (this.saving || this.uploading) return;

    this.editingId = null;

    this.form = this.createEmptyForm();

    this.selectedPhotoName = '';

    this.showForm = true;

    this.errorMessage = '';
    this.successMessage = '';
  }

  // ==========================================
  // EDIT EXISTING TESTIMONIAL
  // ==========================================

  editTestimonial(testimonial: Testimonial): void {

    if (this.saving || this.uploading) return;

    this.editingId = testimonial._id;

    this.form = {
      coupleNameEnglish:
        testimonial.coupleNameEnglish || '',

      coupleNameTamil:
        testimonial.coupleNameTamil || '',

      reviewEnglish:
        testimonial.reviewEnglish || '',

      reviewTamil:
        testimonial.reviewTamil || '',

      photoUrl:
        testimonial.photoUrl || '',

      rating:
        testimonial.rating || 5,

      weddingDate:
        testimonial.weddingDate
          ? testimonial.weddingDate.substring(0, 10)
          : null,

      published:
        testimonial.published === true
    };

    this.selectedPhotoName = '';

    this.showForm = true;

    this.errorMessage = '';
    this.successMessage = '';
  }

  // ==========================================
  // CANCEL FORM
  // ==========================================

  cancelForm(): void {

    if (this.saving || this.uploading) return;

    this.showForm = false;

    this.editingId = null;

    this.form = this.createEmptyForm();

    this.selectedPhotoName = '';

    this.errorMessage = '';
  }

  // ==========================================
  // UPLOAD COUPLE PHOTO
  // ==========================================

  async onPhotoSelected(event: Event): Promise<void> {

    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {

      this.errorMessage = this.t(
        'Only JPG, PNG and WebP images are allowed.',
        'JPG, PNG மற்றும் WebP படங்கள் மட்டுமே அனுமதிக்கப்படும்.'
      );

      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {

      this.errorMessage = this.t(
        'Photo must be 5 MB or smaller.',
        'புகைப்படம் 5 MB அல்லது அதற்கு குறைவாக இருக்க வேண்டும்.'
      );

      input.value = '';
      return;
    }

    if (this.uploading || this.saving) {
      input.value = '';
      return;
    }

    this.uploading = true;

    this.errorMessage = '';
    this.successMessage = '';

    try {

      const response = await firstValueFrom(
        this.testimonialService.uploadPhoto(file)
      );

      if (!response.success || !response.url) {
        throw new Error(
          response.message || 'Upload failed'
        );
      }

      this.form.photoUrl = response.url;

      this.selectedPhotoName = file.name;

      this.successMessage = this.t(
        'Couple photo uploaded successfully.',
        'ஜோடி புகைப்படம் வெற்றிகரமாக பதிவேற்றப்பட்டது.'
      );

    } catch (error) {

      console.error(
        'TESTIMONIAL PHOTO UPLOAD ERROR:',
        error
      );

      this.errorMessage = this.t(
        'Unable to upload couple photo.',
        'ஜோடி புகைப்படத்தை பதிவேற்ற முடியவில்லை.'
      );

    } finally {

      this.uploading = false;
      input.value = '';

      this.cdr.markForCheck();

    }
  }

  // ==========================================
  // REMOVE PHOTO FROM FORM
  // ==========================================

  removePhoto(): void {

    if (this.saving || this.uploading) return;

    this.form.photoUrl = '';

    this.selectedPhotoName = '';
  }

  // ==========================================
  // FORM VALIDATION
  // ==========================================

  private validateForm(): boolean {

    if (!this.form.coupleNameEnglish.trim()) {

      this.errorMessage = this.t(
        'Please enter the couple name in English.',
        'ஜோடியின் பெயரை ஆங்கிலத்தில் உள்ளிடவும்.'
      );

      return false;
    }

    if (!this.form.reviewEnglish.trim()) {

      this.errorMessage = this.t(
        'Please enter the testimonial in English.',
        'வாடிக்கையாளர் கருத்தை ஆங்கிலத்தில் உள்ளிடவும்.'
      );

      return false;
    }

    const rating = Number(this.form.rating);

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {

      this.errorMessage = this.t(
        'Please select a rating between 1 and 5.',
        '1 முதல் 5 வரை மதிப்பீட்டைத் தேர்ந்தெடுக்கவும்.'
      );

      return false;
    }

    return true;
  }

  // ==========================================
  // SAVE OR UPDATE TESTIMONIAL
  // ==========================================

  async saveTestimonial(): Promise<void> {

    if (this.saving || this.uploading) return;

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.validateForm()) return;

    this.saving = true;

    const isEditing = !!this.editingId;

    const payload: TestimonialPayload = {

      coupleNameEnglish:
        this.form.coupleNameEnglish.trim(),

      coupleNameTamil:
        this.form.coupleNameTamil.trim(),

      reviewEnglish:
        this.form.reviewEnglish.trim(),

      reviewTamil:
        this.form.reviewTamil.trim(),

      photoUrl:
        this.form.photoUrl.trim(),

      rating:
        Number(this.form.rating),

      weddingDate:
        this.form.weddingDate || null,

      published:
        this.form.published === true
    };

    try {

      if (this.editingId) {

        await firstValueFrom(
          this.testimonialService.update(
            this.editingId,
            payload
          )
        );

      } else {

        await firstValueFrom(
          this.testimonialService.create(payload)
        );

      }

      this.showForm = false;

      this.editingId = null;

      this.form = this.createEmptyForm();

      this.selectedPhotoName = '';

      await this.loadTestimonials();

      this.successMessage = isEditing
        ? this.t(
            'Testimonial updated successfully.',
            'வாடிக்கையாளர் கருத்து புதுப்பிக்கப்பட்டது.'
          )
        : this.t(
            'Testimonial added successfully.',
            'வாடிக்கையாளர் கருத்து சேர்க்கப்பட்டது.'
          );

    } catch (error) {

      console.error(
        'SAVE TESTIMONIAL ERROR:',
        error
      );

      this.errorMessage = this.t(
        'Unable to save testimonial. Please try again.',
        'வாடிக்கையாளர் கருத்தை சேமிக்க முடியவில்லை.'
      );

    } finally {

      this.saving = false;
      this.cdr.markForCheck();

    }
  }

  // ==========================================
  // PUBLISH / UNPUBLISH TESTIMONIAL
  // ==========================================

  async togglePublish(
    testimonial: Testimonial
  ): Promise<void> {

    if (this.publishingId) return;

    this.publishingId = testimonial._id;

    this.errorMessage = '';
    this.successMessage = '';

    const nextPublished = !testimonial.published;

    try {

      await firstValueFrom(
        this.testimonialService.update(
          testimonial._id,
          {
            published: nextPublished
          }
        )
      );

      testimonial.published = nextPublished;

      this.successMessage = nextPublished
        ? this.t(
            'Testimonial published successfully.',
            'வாடிக்கையாளர் கருத்து வெளியிடப்பட்டது.'
          )
        : this.t(
            'Testimonial unpublished successfully.',
            'வாடிக்கையாளர் கருத்து மறைக்கப்பட்டது.'
          );

    } catch (error) {

      console.error(
        'PUBLISH TESTIMONIAL ERROR:',
        error
      );

      this.errorMessage = this.t(
        'Unable to update publication status.',
        'வெளியீட்டு நிலையை மாற்ற முடியவில்லை.'
      );

    } finally {

      this.publishingId = null;
      this.cdr.markForCheck();

    }
  }

  // ==========================================
  // DELETE TESTIMONIAL
  // ==========================================

  async deleteTestimonial(
    testimonial: Testimonial
  ): Promise<void> {

    if (this.deletingId) return;

    const confirmed = window.confirm(
      this.t(
        `Delete testimonial for ${testimonial.coupleNameEnglish}?`,
        `${testimonial.coupleNameTamil || testimonial.coupleNameEnglish} கருத்தை நீக்க வேண்டுமா?`
      )
    );

    if (!confirmed) return;

    this.deletingId = testimonial._id;

    this.errorMessage = '';
    this.successMessage = '';

    try {

      await firstValueFrom(
        this.testimonialService.delete(
          testimonial._id
        )
      );

      this.testimonials = this.testimonials.filter(
        item => item._id !== testimonial._id
      );

      if (this.editingId === testimonial._id) {
        this.cancelForm();
      }

      this.successMessage = this.t(
        'Testimonial deleted successfully.',
        'வாடிக்கையாளர் கருத்து நீக்கப்பட்டது.'
      );

    } catch (error) {

      console.error(
        'DELETE TESTIMONIAL ERROR:',
        error
      );

      this.errorMessage = this.t(
        'Unable to delete testimonial.',
        'வாடிக்கையாளர் கருத்தை நீக்க முடியவில்லை.'
      );

    } finally {

      this.deletingId = null;
      this.cdr.markForCheck();

    }
  }

  // ==========================================
  // DISPLAY HELPERS
  // ==========================================

  getStarArray(rating: number): number[] {

    const count = Math.max(
      0,
      Math.min(5, Math.round(rating || 0))
    );

    return Array.from(
      { length: count },
      (_, index) => index + 1
    );
  }

  trackByTestimonial(
    index: number,
    testimonial: Testimonial
  ): string {
    return testimonial._id;
  }

}
