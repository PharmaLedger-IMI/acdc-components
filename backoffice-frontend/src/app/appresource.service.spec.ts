import { TestBed } from '@angular/core/testing';

import { AppResourceService } from './appresource.service';

describe('AppresourceService', () => {
  let service: AppResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
