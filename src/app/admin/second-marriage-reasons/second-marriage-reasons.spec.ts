import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondMarriageReasons } from './second-marriage-reasons';

describe('SecondMarriageReasons', () => {
  let component: SecondMarriageReasons;
  let fixture: ComponentFixture<SecondMarriageReasons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [SecondMarriageReasons],
    }).compileComponents();

    fixture = TestBed.createComponent(SecondMarriageReasons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
