import { biodataTranslations } from '../../biodata.translations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDetails } from './personal-details';

describe('PersonalDetails', () => {
  let component: PersonalDetails;
  let fixture: ComponentFixture<PersonalDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [PersonalDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonalDetails);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tr', biodataTranslations.en);
    fixture.componentRef.setInput('formData', {});
    fixture.componentRef.setInput('formDataTa', {});
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
