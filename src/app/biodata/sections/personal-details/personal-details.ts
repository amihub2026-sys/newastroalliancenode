import { Component, Input, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Biodata } from '../../biodata';
import { FormsModule, ControlContainer } from '@angular/forms';

/** PersonalDetails owns this section's template. The parent owns shared form state and API calls. */
@Component({
  selector: 'app-biodata-personal-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-details.html',
  styleUrl: './personal-details.scss',
  // Keep ngModel controls registered with the surrounding Biodata ngForm.
  viewProviders: [{
    provide: ControlContainer,
    useFactory: (parent: ControlContainer) => parent,
    deps: [[new SkipSelf(), ControlContainer]]
  }]
})
export class PersonalDetails {
  @Input({ required: true }) vm!: Biodata;
}
