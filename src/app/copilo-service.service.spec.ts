import { TestBed } from '@angular/core/testing';

import { CopiloServiceService } from './copilo-service.service';

describe('CopiloServiceService', () => {
  let service: CopiloServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CopiloServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
