import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThisaiIruppuList } from './thisai-iruppu-list';

describe('ThisaiIruppuList', () => {
  let component: ThisaiIruppuList;
  let fixture: ComponentFixture<ThisaiIruppuList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [ThisaiIruppuList],
    }).compileComponents();

    fixture = TestBed.createComponent(ThisaiIruppuList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
