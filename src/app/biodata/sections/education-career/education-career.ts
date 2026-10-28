import { Component, Input, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Biodata } from '../../biodata';
import { FormsModule, ControlContainer } from '@angular/forms';

/** EducationCareer owns this section's template. The parent owns shared form state and API calls. */
@Component({
  selector: 'app-biodata-education-career',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './education-career.html',
  styleUrl: './education-career.scss',
  // Keep ngModel controls registered with the surrounding Biodata ngForm.
  viewProviders: [{
    provide: ControlContainer,
    useFactory: (parent: ControlContainer) => parent,
    deps: [[new SkipSelf(), ControlContainer]]
  }]
})
export class EducationCareer {
  @Input({ required: true }) vm!: Biodata;
}
