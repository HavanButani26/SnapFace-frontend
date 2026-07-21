import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestEvent } from './guest-event';

describe('GuestEvent', () => {
  let component: GuestEvent;
  let fixture: ComponentFixture<GuestEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestEvent],
    }).compileComponents();

    fixture = TestBed.createComponent(GuestEvent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
