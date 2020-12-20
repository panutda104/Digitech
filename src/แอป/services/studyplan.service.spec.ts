import { TestBed } from '@angular/core/testing';

import { StudyplanService } from './studyplan.service';

describe('StudyplanService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StudyplanService = TestBed.get(StudyplanService);
    expect(service).toBeTruthy();
  });
});
