import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoFull } from './logo-full';

describe('LogoFull', () => {
  let component: LogoFull;
  let fixture: ComponentFixture<LogoFull>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoFull],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoFull);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
