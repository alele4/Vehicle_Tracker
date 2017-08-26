import { TestBed, inject } from '@angular/core/testing';

import { VehicleTrackerService } from './vehicle-tracker.service';

describe('VehicleTrackerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VehicleTrackerService]
    });
  });

  it('should be created', inject([VehicleTrackerService], (service: VehicleTrackerService) => {
    expect(service).toBeTruthy();
  }));
});
