import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestShell } from './guest-shell';

describe('GuestShell', () => {
  let component: GuestShell;
  let fixture: ComponentFixture<GuestShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestShell],
    }).compileComponents();

    fixture = TestBed.createComponent(GuestShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
