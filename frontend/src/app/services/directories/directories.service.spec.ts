import { TestBed } from '@angular/core/testing';

import { DirectoriesService } from './directories.service';

describe('DirectoriesService', () => {
  let service: DirectoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DirectoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
