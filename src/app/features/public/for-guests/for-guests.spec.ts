import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForGuests } from './for-guests';

describe('ForGuests', () => {
  let component: ForGuests;
  let fixture: ComponentFixture<ForGuests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForGuests],
    }).compileComponents();

    fixture = TestBed.createComponent(ForGuests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
