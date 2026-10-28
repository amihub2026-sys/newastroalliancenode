import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBiodataComponent } from './my-biodata';

describe('MyBiodataComponent', () => {
  let component: MyBiodataComponent;
  let fixture: ComponentFixture<MyBiodataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      imports: [MyBiodataComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyBiodataComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
