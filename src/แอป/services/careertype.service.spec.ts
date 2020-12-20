import { TestBed } from '@angular/core/testing';

import { CareertypeService } from './careertype.service';

describe('CareertypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CareertypeService = TestBed.get(CareertypeService);
    expect(service).toBeTruthy();
  });
});
