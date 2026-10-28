import { Component, Input, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Biodata } from '../../biodata';
import { FormsModule, ControlContainer } from '@angular/forms';

/** PartnerPreferences owns this section's template. The parent owns shared form state and API calls. */
@Component({
  selector: 'app-biodata-partner-preferences',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-preferences.html',
  styleUrl: './partner-preferences.scss',
  // Keep ngModel controls registered with the surrounding Biodata ngForm.
  viewProviders: [{
    provide: ControlContainer,
    useFactory: (parent: ControlContainer) => parent,
    deps: [[new SkipSelf(), ControlContainer]]
  }]
})
export class PartnerPreferences {
  @Input({ required: true }) vm!: Biodata;
}
