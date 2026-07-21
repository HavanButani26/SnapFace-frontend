import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageBar } from './usage-bar';

describe('UsageBar', () => {
  let component: UsageBar;
  let fixture: ComponentFixture<UsageBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageBar],
    }).compileComponents();

    fixture = TestBed.createComponent(UsageBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
