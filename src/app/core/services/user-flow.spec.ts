import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { UserFlowService } from './user-flow';

describe('UserFlowService', () => {
  let service: UserFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],});
    service = TestBed.inject(UserFlowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
