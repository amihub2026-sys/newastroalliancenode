import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NakshatraList } from './nakshatra-list';

describe('NakshatraList', () => {
  let component: NakshatraList;
  let fixture: ComponentFixture<NakshatraList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [NakshatraList],
    }).compileComponents();

    fixture = TestBed.createComponent(NakshatraList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
