import { Component, Input, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Biodata } from '../../biodata';
import { suggestBilingualName, hasTamilScript } from '../../biodata.names';
import { FormsModule, ControlContainer } from '@angular/forms';

/** FamilyDetails owns this section's template. The parent owns shared form state and API calls. */
@Component({
  selector: 'app-biodata-family-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './family-details.html',
  styleUrl: './family-details.scss',
  // Keep ngModel controls registered with the surrounding Biodata ngForm.
  viewProviders: [{
    provide: ControlContainer,
    useFactory: (parent: ControlContainer) => parent,
    deps: [[new SkipSelf(), ControlContainer]]
  }]
})
export class FamilyDetails {
  @Input({ required: true }) vm!: Biodata;

  /** Present an existing stored name in the currently selected language. */
  userFamilyName(field: 'fatherName' | 'motherName'): string {
    return this.vm.currentLang === 'ta'
      ? (this.vm.formDataTa[field] || this.vm.formData[field])
      : (this.vm.formData[field] || this.vm.formDataTa[field]);
  }

  /** One entry populates both scripts without asking the member twice. */
  onUserFamilyNameInput(field: 'fatherName' | 'motherName', value: string): void {
    const pair = suggestBilingualName(value);
    if (hasTamilScript(value)) {
      this.vm.formDataTa[field] = value;
      if (!this.vm.familySpellingCorrected[field]) this.vm.formData[field] = pair.en;
    } else {
      this.vm.formData[field] = value;
      if (!this.vm.familySpellingCorrected[field]) this.vm.formDataTa[field] = pair.ta;
    }
  }

  correctAlternateName(field: 'fatherName' | 'motherName', value: string): void {
    this.vm.familySpellingCorrected[field] = true;
    if (this.vm.currentLang === 'ta') this.vm.formData[field] = value.trim();
    else this.vm.formDataTa[field] = value.trim();
  }
  alternateFamilyName(field: 'fatherName' | 'motherName'): string {
    return this.vm.currentLang === 'ta' ? this.vm.formData[field] : this.vm.formDataTa[field];
  }

}
