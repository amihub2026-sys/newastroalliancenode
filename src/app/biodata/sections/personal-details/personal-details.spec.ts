
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { biodataTranslations } from '../../biodata.translations';
import type { Biodata } from '../../biodata';
import { PersonalDetails } from './personal-details';

describe('PersonalDetails', () => {
  let component: PersonalDetails;
  let fixture: ComponentFixture<PersonalDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ],
      imports: [PersonalDetails]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalDetails);
    component = fixture.componentInstance;

    // The component receives its form state through vm.
    // Keep this inactive for the creation-only smoke test.
    const mockVm = {
      tr: biodataTranslations.en,
      currentLang: 'en',
      activeStep: 1,
      isAdminBiodataMode: () => false,
      formData: {},
      formDataTa: {}
    } as unknown as Biodata;

    fixture.componentRef.setInput('vm', mockVm);

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
