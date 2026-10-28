import { biodataTranslations } from '../../biodata.translations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaUpload } from './media-upload';

describe('MediaUpload', () => {
  let component: MediaUpload;
  let fixture: ComponentFixture<MediaUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [MediaUpload],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaUpload);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tr', biodataTranslations.en);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
