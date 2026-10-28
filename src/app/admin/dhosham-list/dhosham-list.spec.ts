import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DhoshamList } from './dhosham-list';

describe('DhoshamList', () => {
  let component: DhoshamList;
  let fixture: ComponentFixture<DhoshamList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [DhoshamList],
    }).compileComponents();

    fixture = TestBed.createComponent(DhoshamList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
