import { TestBed } from '@angular/core/testing';

import { GuestEvent } from './guest-event';

describe('GuestEvent', () => {
  let service: GuestEvent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuestEvent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
