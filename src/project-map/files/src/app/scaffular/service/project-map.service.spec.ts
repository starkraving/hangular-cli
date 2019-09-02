import { TestBed } from '@angular/core/testing';

import { ProjectMapService } from './project-map.service';

describe('ProjectMapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProjectMapService = TestBed.get(ProjectMapService);
    expect(service).toBeTruthy();
  });
});
