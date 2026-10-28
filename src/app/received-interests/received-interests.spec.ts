import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedInterests } from './received-interests';

describe('ReceivedInterests', () => {
  let component: ReceivedInterests;
  let fixture: ComponentFixture<ReceivedInterests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [ReceivedInterests],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceivedInterests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
