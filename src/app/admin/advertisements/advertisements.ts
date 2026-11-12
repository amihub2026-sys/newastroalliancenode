
import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { LanguageService } from '../../core/services/language.service';

import {
  AdvertisementService,
  Advertisement as ApiAdvertisement,
  AdvertisementPayload
} from '../../services/advertisement.service';

// ==========================================
// ADVERTISEMENT FORM
// ==========================================

interface AdvertisementForm {
  title: string;
  titleTamil: string;
  placement: AdvertisementPayload['placement'];
  destinationUrl: string;
  device: AdvertisementPayload['device'];
  startDate: string;
  endDate: string;
  published: boolean;
}

// ==========================================
// ADVERTISEMENT LIST
// ==========================================

interface AdvertisementItem extends ApiAdvertisement {
  id: string;
}

@Component({
  selector: 'app-advertisements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './advertisements.html',
  styleUrls: [
    './advertisements.scss',
    './advertisements.responsive.scss'
  ]
})
export class Advertisements implements OnInit, OnDestroy {

  // ========================================
  // SERVICES
  // ========================================

  private readonly advertisementService =
    inject(AdvertisementService);

  private readonly language =
    inject(LanguageService);

  // ========================================
  // ENGLISH / TAMIL LANGUAGE SUPPORT
  // ========================================

  get currentLang(): 'en' | 'ta' {
    return this.language.currentLang;
  }

  t(en: string, ta: string): string {
    return this.currentLang === 'ta' ? ta : en;
  }

  get pageTitle(): string {
    return this.t(
      'Advertisement Management',
      'விளம்பர மேலாண்மை'
    );
  }

  // ========================================
  // PAGE STATE
  // ========================================

  showForm = false;

  loading = false;
  saving = false;
  deletingId: string | null = null;

  errorMessage = '';
  successMessage = '';

  imagePreview: string | null = null;
  selectedFile: File | null = null;

  advertisements: AdvertisementItem[] = [];

  editingId: string | null = null;
  existingImageUrl = '';

  form: AdvertisementForm = this.createEmptyForm();

  // ========================================
  // INITIALIZE
  // ========================================

  ngOnInit(): void {
    void this.loadAdvertisements();
  }

  // ========================================
  // EMPTY FORM
  // ========================================

  private createEmptyForm(): AdvertisementForm {
    return {
      title: '',
      titleTamil: '',
      placement: 'home-banner',
      destinationUrl: '',
      device: 'all',
      startDate: '',
      endDate: '',
      published: false
    };
  }

  // ========================================
  // LOAD ADVERTISEMENTS FROM MONGODB
  // ========================================

  async loadAdvertisements(): Promise<void> {

    this.loading = true;
    this.errorMessage = '';

    try {
      const response = await firstValueFrom(
        this.advertisementService.getAll()
      );

      if (!response.success) {
        throw new Error(
          response.message ||
          'Unable to load advertisements'
        );
      }

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      this.advertisements = data.map(ad => ({
        ...ad,
        id: ad._id
      }));

    } catch (error) {

      console.error(
        'LOAD ADVERTISEMENTS ERROR:',
        error
      );

      this.errorMessage = this.getErrorMessage(
        error,
        'Unable to load advertisements'
      );

    } finally {
      this.loading = false;
    }
  }

  // ========================================
  // SELECT ADVERTISEMENT IMAGE
  // ========================================

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.errorMessage = '';

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {

      this.errorMessage =
        'Only JPG, PNG and WebP images are allowed.';

      alert(this.errorMessage);
      input.value = '';
      return;
    }

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {

      this.errorMessage =
        'Advertisement image must be 5 MB or smaller.';

      alert(this.errorMessage);
      input.value = '';
      return;
    }

    this.clearImagePreview();

    this.selectedFile = file;
    this.imagePreview = URL.createObjectURL(file);
  }

  // ========================================
  // SAVE / UPDATE ADVERTISEMENT
  // ========================================

  async saveAdvertisement(): Promise<void> {

    if (this.saving) return;

    this.errorMessage = '';
    this.successMessage = '';

    // ======================================
    // ENGLISH TITLE VALIDATION
    // ======================================

    if (!this.form.title.trim()) {

      alert(
        this.t(
          'Please enter an English advertisement title.',
          'விளம்பரத்தின் ஆங்கிலத் தலைப்பை உள்ளிடவும்.'
        )
      );

      return;
    }

    // ======================================
    // TAMIL TITLE
    // ======================================

    // Optional for compatibility with
    // existing advertisement records.

    // ======================================
    // IMAGE VALIDATION
    // ======================================

    if (!this.selectedFile && !this.existingImageUrl) {

      alert(
        this.t(
          'Please select an advertisement image.',
          'விளம்பரப் படத்தைத் தேர்ந்தெடுக்கவும்.'
        )
      );

      return;
    }

    // ======================================
    // DATE VALIDATION
    // ======================================

    if (
      this.form.startDate &&
      this.form.endDate &&
      this.form.endDate < this.form.startDate
    ) {

      alert(
        this.t(
          'End date cannot be earlier than start date.',
          'முடிவு தேதி தொடக்க தேதிக்கு முன்பாக இருக்கக்கூடாது.'
        )
      );

      return;
    }

    // ======================================
    // DESTINATION URL VALIDATION
    // ======================================

    const destinationUrl =
      this.form.destinationUrl.trim();

    if (destinationUrl) {

      try {

        const parsedUrl = new URL(destinationUrl);

        if (
          parsedUrl.protocol !== 'http:' &&
          parsedUrl.protocol !== 'https:'
        ) {
          throw new Error('Invalid protocol');
        }

      } catch {

        alert(
          this.t(
            'Please enter a valid HTTP or HTTPS destination URL.',
            'சரியான HTTP அல்லது HTTPS இணைப்பு முகவரியை உள்ளிடவும்.'
          )
        );

        return;
      }
    }

    this.saving = true;

    try {

      let imageUrl = this.existingImageUrl;

      // ====================================
      // STEP 1 — UPLOAD IMAGE TO R2
      // ====================================

      if (this.selectedFile) {

        const uploadResponse = await firstValueFrom(
          this.advertisementService.uploadBanner(
            this.selectedFile
          )
        );

        if (
          !uploadResponse.success ||
          !uploadResponse.url
        ) {

          throw new Error(
            uploadResponse.message ||
            'Advertisement image upload failed'
          );
        }

        imageUrl = uploadResponse.url;
      }

      // ====================================
      // STEP 2 — PREPARE MONGODB DATA
      // ====================================

      const payload: AdvertisementPayload = {

        // English advertisement title
        title: this.form.title.trim(),

        // Tamil advertisement title
        titleTamil: this.form.titleTamil.trim(),

        imageUrl,

        destinationUrl,

        placement: this.form.placement,

        device: this.form.device,

        startDate: this.form.startDate || null,

        endDate: this.form.endDate || null,

        published: this.form.published
      };

      // ====================================
      // STEP 3 — CREATE OR UPDATE
      // ====================================

      const response = this.editingId
        ? await firstValueFrom(
            this.advertisementService.update(
              this.editingId,
              payload
            )
          )
        : await firstValueFrom(
            this.advertisementService.create(
              payload
            )
          );

      if (!response.success) {

        throw new Error(
          response.message ||
          'Unable to save advertisement'
        );
      }

      this.successMessage = this.editingId
        ? this.t(
            'Advertisement updated successfully.',
            'விளம்பரம் வெற்றிகரமாகப் புதுப்பிக்கப்பட்டது.'
          )
        : this.t(
            'Advertisement saved successfully.',
            'விளம்பரம் வெற்றிகரமாகச் சேமிக்கப்பட்டது.'
          );

      // ====================================
      // STEP 4 — REFRESH LIST
      // ====================================

      this.resetForm();

      await this.loadAdvertisements();

      alert(this.successMessage);

    } catch (error) {

      console.error(
        'SAVE ADVERTISEMENT ERROR:',
        error
      );

      this.errorMessage = this.getErrorMessage(
        error,
        'Failed to save advertisement'
      );

      alert(this.errorMessage);

    } finally {
      this.saving = false;
    }
  }

  // ========================================
  // EDIT ADVERTISEMENT
  // ========================================

  editAdvertisement(ad: AdvertisementItem): void {

    this.resetForm();

    this.editingId = ad._id;
    this.existingImageUrl = ad.imageUrl;

    this.form = {

      // English title
      title: ad.title,

      // Tamil title
      titleTamil: ad.titleTamil || '',

      placement: ad.placement,

      destinationUrl: ad.destinationUrl || '',

      device: ad.device,

      startDate: this.toDateInput(
        ad.startDate
      ),

      endDate: this.toDateInput(
        ad.endDate
      ),

      published: ad.published
    };

    // Existing R2 image preview
    this.imagePreview = ad.imageUrl;

    this.showForm = true;

    this.errorMessage = '';
    this.successMessage = '';

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // ========================================
  // PUBLISH / UNPUBLISH
  // ========================================

  async togglePublish(
    ad: AdvertisementItem
  ): Promise<void> {

    if (this.saving) return;

    this.saving = true;
    this.errorMessage = '';

    try {

      const response = await firstValueFrom(
        this.advertisementService.update(
          ad._id,
          {
            published: !ad.published
          }
        )
      );

      if (!response.success) {

        throw new Error(
          response.message ||
          'Unable to update advertisement status'
        );
      }

      this.successMessage = ad.published
        ? this.t(
            'Advertisement unpublished successfully.',
            'விளம்பர வெளியீடு நிறுத்தப்பட்டது.'
          )
        : this.t(
            'Advertisement published successfully.',
            'விளம்பரம் வெற்றிகரமாக வெளியிடப்பட்டது.'
          );

      await this.loadAdvertisements();

    } catch (error) {

      console.error(
        'PUBLISH AD ERROR:',
        error
      );

      this.errorMessage = this.getErrorMessage(
        error,
        'Unable to update advertisement status'
      );

      alert(this.errorMessage);

    } finally {
      this.saving = false;
    }
  }

  // ========================================
  // DELETE ADVERTISEMENT
  // ========================================

  async deleteAdvertisement(id: string): Promise<void> {

    if (!id || this.deletingId) return;

    const confirmed = confirm(
      this.t(
        'Are you sure you want to delete this advertisement?',
        'இந்த விளம்பரத்தை நீக்க விரும்புகிறீர்களா?'
      )
    );

    if (!confirmed) return;

    this.deletingId = id;
    this.errorMessage = '';

    try {

      const response = await firstValueFrom(
        this.advertisementService.delete(id)
      );

      if (!response.success) {

        throw new Error(
          response.message ||
          'Unable to delete advertisement'
        );
      }

      this.advertisements =
        this.advertisements.filter(
          ad => ad._id !== id
        );

      if (this.editingId === id) {
        this.resetForm();
      }

      this.successMessage = this.t(
        'Advertisement deleted successfully.',
        'விளம்பரம் வெற்றிகரமாக நீக்கப்பட்டது.'
      );

    } catch (error) {

      console.error(
        'DELETE AD ERROR:',
        error
      );

      this.errorMessage = this.getErrorMessage(
        error,
        'Unable to delete advertisement'
      );

      alert(this.errorMessage);

    } finally {
      this.deletingId = null;
    }
  }

  // ========================================
  // RESET FORM
  // ========================================

  resetForm(): void {

    this.clearImagePreview();

    this.form = this.createEmptyForm();

    this.selectedFile = null;

    this.editingId = null;

    this.existingImageUrl = '';

    this.showForm = false;
  }

  // ========================================
  // DATE FORMAT FOR HTML INPUT
  // ========================================

  private toDateInput(
    date: string | null | undefined
  ): string {

    if (!date) return '';

    return String(date).slice(0, 10);
  }

  // ========================================
  // API ERROR HANDLING
  // ========================================

  private getErrorMessage(
    error: unknown,
    fallback: string
  ): string {

    if (
      error &&
      typeof error === 'object'
    ) {

      const err = error as {
        error?: {
          message?: string;
        };
        message?: string;
      };

      return (
        err.error?.message ||
        err.message ||
        fallback
      );
    }

    return fallback;
  }

  // ========================================
  // CLEAR LOCAL IMAGE PREVIEW
  // ========================================

  private clearImagePreview(): void {

    if (
      this.imagePreview &&
      this.imagePreview.startsWith('blob:')
    ) {

      URL.revokeObjectURL(this.imagePreview);
    }

    this.imagePreview = null;
  }

  // ========================================
  // COMPONENT CLEANUP
  // ========================================

  ngOnDestroy(): void {
    this.clearImagePreview();
  }
}
