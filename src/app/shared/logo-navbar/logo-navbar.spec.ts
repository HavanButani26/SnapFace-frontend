import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoNavbar } from './logo-navbar';

describe('LogoNavbar', () => {
  let component: LogoNavbar;
  let fixture: ComponentFixture<LogoNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoNavbar],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoNavbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
