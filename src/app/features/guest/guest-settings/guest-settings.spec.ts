import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestSettings } from './guest-settings';

describe('GuestSettings', () => {
  let component: GuestSettings;
  let fixture: ComponentFixture<GuestSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(GuestSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
